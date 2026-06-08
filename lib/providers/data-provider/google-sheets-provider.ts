import { calculateLeadScore, calculateLeadTemperature } from "@/lib/operating-model/helpers";
import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type {
  CampaignEntity,
  ForecastEntity,
  LeadEntity,
  MagdaTaskEntity,
  OfferEntity,
  OperatingDataStore,
  PartnerEntity,
} from "@/lib/operating-model/types";
import { getGoogleSheetsConfig, isGoogleSheetsConfigured } from "./google-sheets-config";
import type { DataProvider, DataProviderStatus } from "./types";
import { createStatus } from "./utils";

type RawRow = Record<string, string>;

interface IncompleteTracker {
  rows: number;
  fields: number;
}

interface ImportResult {
  store: OperatingDataStore;
  status: DataProviderStatus;
}

const REQUIRED_COLUMNS = {
  leads: ["id", "client_name", "source", "budget", "status", "created_at"],
  offers: ["id", "lead_id", "owner", "model", "value", "status", "created_at", "win_probability"],
  campaigns: ["id", "name", "platform", "model", "monthly_budget", "status"],
  tasks: ["id", "owner", "title", "due_at", "priority", "done"],
  partners: ["id", "name", "kind"],
  sales: ["month_key", "revenue_plan"],
} as const;

function parseCsv(input: string): RawRow[] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim().length > 0)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((values) => {
    const mapped: RawRow = {};
    headers.forEach((header, headerIndex) => {
      mapped[header] = (values[headerIndex] || "").trim();
    });
    return mapped;
  });
}

function valueOrFallback(raw: string | undefined, fallback: string, tracker: IncompleteTracker): string {
  if (raw && raw.trim().length > 0) {
    return raw.trim();
  }
  tracker.fields += 1;
  return fallback;
}

function mapLead(row: RawRow, tracker: IncompleteTracker): LeadEntity {
  const source = valueOrFallback(row.source, "organic", tracker) as LeadEntity["source"];
  const status = valueOrFallback(row.status, "new", tracker) as LeadEntity["status"];

  return {
    id: valueOrFallback(row.id, `LEAD-${Date.now()}`, tracker),
    clientName: valueOrFallback(row.client_name, "DATA INCOMPLETE", tracker),
    phone: row.phone || undefined,
    email: row.email || undefined,
    source,
    campaignId: row.campaign_id || undefined,
    owner: (row.owner || undefined) as LeadEntity["owner"],
    modelInterest: (row.model_interest || undefined) as LeadEntity["modelInterest"],
    budget: Number(valueOrFallback(row.budget, "0", tracker)),
    createdAt: valueOrFallback(row.created_at, new Date().toISOString(), tracker),
    lastContactAt: row.last_contact_at || undefined,
    status,
  };
}

function mapOffer(row: RawRow, tracker: IncompleteTracker): OfferEntity {
  return {
    id: valueOrFallback(row.id, `OFFER-${Date.now()}`, tracker),
    leadId: valueOrFallback(row.lead_id, "DATA INCOMPLETE", tracker),
    campaignId: row.campaign_id || undefined,
    owner: valueOrFallback(row.owner, "Magda 1", tracker) as OfferEntity["owner"],
    model: valueOrFallback(row.model, "Tirana", tracker) as OfferEntity["model"],
    value: Number(valueOrFallback(row.value, "0", tracker)),
    status: valueOrFallback(row.status, "draft", tracker) as OfferEntity["status"],
    createdAt: valueOrFallback(row.created_at, new Date().toISOString(), tracker),
    sentAt: row.sent_at || undefined,
    lastFollowupAt: row.last_followup_at || undefined,
    winProbability: Number(valueOrFallback(row.win_probability, "0.5", tracker)),
    decisionReason: row.decision_reason || undefined,
  };
}

function mapCampaign(row: RawRow, tracker: IncompleteTracker): CampaignEntity {
  return {
    id: valueOrFallback(row.id, `CMP-${Date.now()}`, tracker),
    name: valueOrFallback(row.name, "DATA INCOMPLETE", tracker),
    platform: valueOrFallback(row.platform, "Meta", tracker) as CampaignEntity["platform"],
    model: valueOrFallback(row.model, "Tirana", tracker) as CampaignEntity["model"],
    monthlyBudget: Number(valueOrFallback(row.monthly_budget, "0", tracker)),
    status: valueOrFallback(row.status, "active", tracker) as CampaignEntity["status"],
  };
}

function mapTask(row: RawRow, tracker: IncompleteTracker): MagdaTaskEntity {
  return {
    id: valueOrFallback(row.id, `TSK-${Date.now()}`, tracker),
    owner: valueOrFallback(row.owner, "Magda 1", tracker) as MagdaTaskEntity["owner"],
    title: valueOrFallback(row.title, "DATA INCOMPLETE", tracker),
    linkedLeadId: row.linked_lead_id || undefined,
    linkedOfferId: row.linked_offer_id || undefined,
    dueAt: valueOrFallback(row.due_at, new Date().toISOString(), tracker),
    priority: valueOrFallback(row.priority, "medium", tracker) as MagdaTaskEntity["priority"],
    done: (row.done || "false").toLowerCase() === "true",
  };
}

function mapPartner(row: RawRow, tracker: IncompleteTracker): PartnerEntity {
  return {
    id: valueOrFallback(row.id, `PRT-${Date.now()}`, tracker),
    name: valueOrFallback(row.name, "DATA INCOMPLETE", tracker),
    kind: valueOrFallback(row.kind, "partner", tracker) as PartnerEntity["kind"],
    lastContactAt: row.last_contact_at || undefined,
    owner: (row.owner || undefined) as PartnerEntity["owner"],
  };
}

function mapSale(row: RawRow, tracker: IncompleteTracker): ForecastEntity {
  return {
    monthKey: valueOrFallback(row.month_key, new Date().toISOString().slice(0, 7), tracker),
    revenuePlan: Number(valueOrFallback(row.revenue_plan, "0", tracker)),
  };
}

function validateHeaders(rows: RawRow[], sheetName: keyof typeof REQUIRED_COLUMNS): string[] {
  if (rows.length === 0) {
    return [`Arkusz '${sheetName}' jest pusty.`];
  }

  const available = new Set(Object.keys(rows[0] || {}));
  const required = REQUIRED_COLUMNS[sheetName];
  const missing = required.filter((column) => !available.has(column));
  if (missing.length === 0) {
    return [];
  }

  return [`Arkusz '${sheetName}' nie ma wymaganych kolumn: ${missing.join(", ")}.`];
}

async function fetchSheetRows(spreadsheetId: string, baseUrl: string, sheetName: keyof typeof REQUIRED_COLUMNS): Promise<RawRow[]> {
  const url = `${baseUrl}/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Nie udało się pobrać arkusza '${sheetName}' (HTTP ${response.status}).`);
  }

  return parseCsv(await response.text());
}

function enrichLeadScore(store: OperatingDataStore): OperatingDataStore {
  return {
    ...store,
    leads: store.leads.map((lead) => {
      const score = calculateLeadScore(lead);
      const temperature = calculateLeadTemperature(score);
      return { ...lead, score, temperature };
    }),
  };
}

export class GoogleSheetsProvider implements DataProvider {
  readonly name = "google-sheets" as const;
  private cache: ImportResult | null = null;

  private async importSheets(): Promise<ImportResult> {
    if (this.cache) {
      return this.cache;
    }

    const config = getGoogleSheetsConfig();
    const mockStore = getOperatingStore();

    if (!isGoogleSheetsConfigured(config)) {
      this.cache = {
        store: mockStore,
        status: createStatus({
          provider: this.name,
          resolvedProvider: "mock",
          store: mockStore,
          configured: false,
          syncState: "fallback-mock",
          message: "Google Sheets nie jest skonfigurowany. Używam danych mock.",
          errors: [
            "Brak `ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID`.",
            "Ustaw Spreadsheet ID w `.env.local`.",
          ],
        }),
      };
      return this.cache;
    }

    try {
      const [leadRows, offerRows, campaignRows, taskRows, partnerRows, salesRows] = await Promise.all([
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "leads"),
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "offers"),
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "campaigns"),
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "tasks"),
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "partners"),
        fetchSheetRows(config.spreadsheetId, config.baseUrl, "sales"),
      ]);

      const headerErrors = [
        ...validateHeaders(leadRows, "leads"),
        ...validateHeaders(offerRows, "offers"),
        ...validateHeaders(campaignRows, "campaigns"),
        ...validateHeaders(taskRows, "tasks"),
        ...validateHeaders(partnerRows, "partners"),
        ...validateHeaders(salesRows, "sales"),
      ];

      if (headerErrors.length > 0) {
        this.cache = {
          store: mockStore,
          status: createStatus({
            provider: this.name,
            resolvedProvider: "mock",
            store: mockStore,
            configured: true,
            syncState: "fallback-mock",
            message: "Błąd struktury arkuszy. Przełączono na dane mock.",
            errors: headerErrors,
          }),
        };
        return this.cache;
      }

      const incomplete: IncompleteTracker = { rows: 0, fields: 0 };

      const mapWithCounter = <T>(rows: RawRow[], mapper: (row: RawRow, tracker: IncompleteTracker) => T): T[] => {
        return rows.map((row) => {
          const fieldsBefore = incomplete.fields;
          const mapped = mapper(row, incomplete);
          if (incomplete.fields > fieldsBefore) {
            incomplete.rows += 1;
          }
          return mapped;
        });
      };

      const store = enrichLeadScore({
        leads: mapWithCounter(leadRows, mapLead),
        offers: mapWithCounter(offerRows, mapOffer),
        campaigns: mapWithCounter(campaignRows, mapCampaign),
        magdaTasks: mapWithCounter(taskRows, mapTask),
        partners: mapWithCounter(partnerRows, mapPartner),
        forecasts: mapWithCounter(salesRows, mapSale),
      });

      const errors = incomplete.rows > 0 ? [`DATA INCOMPLETE: ${incomplete.rows} wierszy ma puste pola.`] : [];

      this.cache = {
        store,
        status: createStatus({
          provider: this.name,
          resolvedProvider: this.name,
          store,
          configured: true,
          syncState: "ok",
          message:
            incomplete.rows > 0
              ? "Dane z Google Sheets załadowane, wykryto DATA INCOMPLETE."
              : "Dane z Google Sheets załadowane poprawnie.",
          incompleteRows: incomplete.rows,
          incompleteFields: incomplete.fields,
          errors,
        }),
      };

      return this.cache;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nieznany błąd importu Google Sheets.";
      this.cache = {
        store: mockStore,
        status: createStatus({
          provider: this.name,
          resolvedProvider: "mock",
          store: mockStore,
          configured: true,
          syncState: "fallback-mock",
          message: "Import Google Sheets nieudany. Używam danych mock.",
          errors: [message, "Sprawdź udostępnienie arkusza i nazwy zakładek."],
        }),
      };
      return this.cache;
    }
  }

  async getStore(): Promise<OperatingDataStore> {
    const result = await this.importSheets();
    return result.store;
  }

  async getStatus(): Promise<DataProviderStatus> {
    const result = await this.importSheets();
    return result.status;
  }
}
