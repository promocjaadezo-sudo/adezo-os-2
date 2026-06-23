import { existsSync, readdirSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import * as XLSX from "xlsx";
import { calculateLeadScore, calculateLeadTemperature, calculateForecast } from "@/lib/operating-model/helpers";
import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type { OperatingDataStore } from "@/lib/operating-model/types";
import { createAnalyticsProvider } from "@/lib/providers/analytics-ads";
import { deriveGa4LeadMetrics } from "@/lib/providers/analytics-ads/lead-metrics";
import { classifyCrmFallbackReason } from "@/lib/data-source-priority-engine";
import { mapExcelCrmRowsToStore, type ExcelCrmRow } from "./excel-crm-mapper";
import { validateExcelCrmRows } from "./excel-crm-validator";
import type { DataProvider, DataProviderStatus } from "./types";
import { createStatus } from "./utils";

interface WorkbookStructure {
  filePath: string;
  sheetNames: string[];
  columnNames: string[];
}

interface ImportResult {
  store: OperatingDataStore;
  status: DataProviderStatus;
  structure: WorkbookStructure;
}

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function parseNumber(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).replace(/\s/g, "").replace(",", ".");
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseDate(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString();
  const value = String(raw).trim();
  if (!value) return undefined;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return undefined;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function rowText(row: unknown[], index: number): string | undefined {
  const raw = row[index];
  if (raw === null || raw === undefined) return undefined;
  const text = String(raw).trim();
  return text || undefined;
}

function canReadFile(filePath: string): boolean {
  return existsSync(filePath);
}

function resolveCrmFilePath(): string {
  const envPath = process.env.ADEZO_EXCEL_CRM_FILE;
  if (envPath && envPath.trim()) {
    const normalized = envPath.trim();
    const candidates = [
      isAbsolute(normalized) ? normalized : resolve(process.cwd(), normalized),
      normalized,
    ];

    for (const candidate of candidates) {
      if (canReadFile(candidate)) return candidate;
    }

    throw new Error(`Cannot access file ${normalized}`);
  }

  const crmDir = join(process.cwd(), "crm");
  const candidates = readdirSync(crmDir)
    .filter((name) => name.toLowerCase().endsWith(".xlsx"))
    .filter((name) => !name.startsWith("~$"))
    .sort((left, right) => (left > right ? -1 : 1));

  const preferred = candidates.find((name) => name.includes("BUILD034K_CRM_CLEANUP_FINAL_NEW")) || candidates[0];
  if (!preferred) throw new Error("Brak pliku CRM Excel (.xlsx) w katalogu crm.");

  const filePath = join(crmDir, preferred);
  if (!canReadFile(filePath)) {
    throw new Error(`Cannot access file ${filePath}`);
  }

  return filePath;
}

function findHeaderRow(rows: unknown[][]): number {
  for (let index = 0; index < Math.min(rows.length, 25); index += 1) {
    const cells = (rows[index] || []).map((cell) => normalize(String(cell || "")));
    if (cells.some((c) => c.includes("nr oferty")) && cells.some((c) => c.includes("status"))) {
      return index;
    }
  }
  return 3;
}

function findColumnIndex(headers: string[], aliases: string[], fallback = -1): number {
  const normalizedHeaders = headers.map((h) => normalize(h));
  for (const alias of aliases) {
    const idx = normalizedHeaders.findIndex((header) => header.includes(normalize(alias)));
    if (idx >= 0) return idx;
  }
  return fallback;
}

function parseCrmRows(sheet: XLSX.WorkSheet): { rows: ExcelCrmRow[]; headers: string[] } {
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as unknown[][];
  if (rawRows.length === 0) return { rows: [], headers: [] };

  const headerRowIndex = findHeaderRow(rawRows);
  const headers = (rawRows[headerRowIndex] || []).map((cell, idx) => {
    const text = String(cell || "").trim();
    return text || `COL_${idx + 1}`;
  });

  const idxDataKont = findColumnIndex(headers, ["DATA KOLEJNEGO KONTAKTU", "DATA KONTAKTU"]);
  const idxKlient = findColumnIndex(headers, ["KLIENT"]);
  const idxTelefon = findColumnIndex(headers, ["TELEFON", "TEL"]);
  const idxEmail = findColumnIndex(headers, ["EMAIL", "E-MAIL"]);
  const idxNrOferty = findColumnIndex(headers, ["NR OFERTY", "NUMER OFERTY"]);
  const idxObsluga = findColumnIndex(headers, ["OBSLUGA", "OPIEKUN", "MAGDA"]);
  const idxKwota = findColumnIndex(headers, ["KWOTA", "WARTOSC", "WARTOŚĆ"]);
  const idxSzansa = findColumnIndex(headers, ["SZANSA"]);
  const idxStatus = findColumnIndex(headers, ["STATUS"]);
  const idxDataOferty = findColumnIndex(headers, ["DATA OFERTY", "OFERTA DATA"]);
  const idxWynikSprzedazy = findColumnIndex(headers, ["WYNIK SPRZEDAZY", "WYNIK SPRZEDAŻY", "WYNIK"]);
  const idxSource = findColumnIndex(headers, ["SOURCE", "ZRODLO", "ŹRÓDŁO"]);
  const idxMedium = findColumnIndex(headers, ["MEDIUM"]);
  const idxCampaign = findColumnIndex(headers, ["CAMPAIGN", "KAMPANIA"]);
  const idxPlanMies = findColumnIndex(headers, ["PLAN MIESIECZNY", "PLAN MIESIĘCZNY", "PLAN"]);

  const rows: ExcelCrmRow[] = [];
  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex += 1) {
    const row = rawRows[rowIndex] || [];
    const nrOferty = rowText(row, idxNrOferty);
    if (!nrOferty) continue;

    rows.push({
      rowNumber: rowIndex + 1,
      dataKontaktu: parseDate(row[idxDataKont]),
      klient: rowText(row, idxKlient),
      telefon: rowText(row, idxTelefon),
      email: rowText(row, idxEmail),
      nrOferty,
      obsluga: rowText(row, idxObsluga),
      kwota: parseNumber(row[idxKwota]),
      szansa: parseNumber(row[idxSzansa]),
      status: rowText(row, idxStatus),
      dataOferty: parseDate(row[idxDataOferty]),
      wynikSprzedazy: rowText(row, idxWynikSprzedazy),
      source: rowText(row, idxSource),
      medium: rowText(row, idxMedium),
      campaign: rowText(row, idxCampaign),
      planMiesieczny: parseNumber(row[idxPlanMies]),
    });
  }

  return { rows, headers };
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

async function resolveGa4Context() {
  const analytics = createAnalyticsProvider();
  const [sessions, conversions] = await Promise.all([
    analytics.getSessions("last30days"),
    analytics.getConversions("last7days"),
  ]);

  const topSession = sessions[0];
  const leadMetrics = deriveGa4LeadMetrics(conversions);

  return {
    defaultSource: topSession?.source,
    defaultMedium: topSession?.medium,
    defaultCampaign: topSession?.campaign,
    leadCount7d: leadMetrics.lead_count,
  };
}

export class ExcelCrmProvider implements DataProvider {
  readonly name = "excel-crm" as const;
  private cache: ImportResult | null = null;

  private async importExcel(): Promise<ImportResult> {
    if (this.cache) return this.cache;

    const mockStore = getOperatingStore();

    try {
      const filePath = resolveCrmFilePath();
      const workbook = XLSX.readFile(filePath, { cellDates: true });
      const crmSheet = workbook.Sheets["CRM_MAGDY"] || workbook.Sheets[workbook.SheetNames[0]];
      if (!crmSheet) {
        throw new Error("Nie znaleziono arkusza CRM_MAGDY w pliku CRM.");
      }

      const ga4Context = await resolveGa4Context();
      const { rows, headers } = parseCrmRows(crmSheet);
      const validation = validateExcelCrmRows(rows);
      const mapped = mapExcelCrmRowsToStore(rows, ga4Context);

      const forecastCalc = calculateForecast(mapped.store.offers);
      if (mapped.store.forecasts.length > 0 && mapped.store.forecasts[0].revenuePlan <= 0) {
        mapped.store.forecasts[0].revenuePlan = Math.max(forecastCalc.forecast, forecastCalc.sold);
      }

      const store = enrichLeadScore(mapped.store);
      const errors = [...validation.warnings];

      this.cache = {
        store,
        structure: {
          filePath,
          sheetNames: workbook.SheetNames,
          columnNames: headers,
        },
        status: createStatus({
          provider: this.name,
          resolvedProvider: this.name,
          store,
          configured: true,
          syncState: "ok",
          message:
            mapped.diagnostics.rows > 0
              ? `Excel CRM załadowany. Wiersze: ${mapped.diagnostics.rows}. GA4 lead_count 7d: ${(ga4Context.leadCount7d || 0).toFixed(0)}.`
              : "DATA INCOMPLETE: Excel CRM załadowany, ale brak rekordów lead/oferta.",
          incompleteRows: validation.incompleteRows,
          incompleteFields: validation.incompleteFields,
          errors,
        }),
      };

      return this.cache;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nieznany błąd importu Excel CRM.";
      const cwd = process.cwd();
      const crmDirPath = join(cwd, "crm");
      const crmDirExists = existsSync(crmDirPath);
      const cwdEntries = (() => {
        try {
          return readdirSync(cwd).slice(0, 20).join(", ");
        } catch {
          return "n/a";
        }
      })();
      const crmEntries = (() => {
        if (!crmDirExists) return "n/a";
        try {
          return readdirSync(crmDirPath).slice(0, 20).join(", ") || "(empty)";
        } catch {
          return "n/a";
        }
      })();
      const detailedMessage = `${message} | cwd=${cwd} | crmDirExists=${crmDirExists ? "yes" : "no"} | cwdEntries=${cwdEntries} | crmEntries=${crmEntries}`;
      const fallbackReason = classifyCrmFallbackReason(message);
      const fallbackReasonLabel =
        fallbackReason === "missing-file"
          ? "brak pliku"
          : fallbackReason === "read-error"
            ? "błąd odczytu"
            : "CRM niedostępny";

      this.cache = {
        store: mockStore,
        structure: {
          filePath: "",
          sheetNames: [],
          columnNames: [],
        },
        status: createStatus({
          provider: this.name,
          resolvedProvider: "mock",
          store: mockStore,
          configured: false,
          syncState: "fallback-mock",
          message: `Excel CRM niedostępny (${fallbackReasonLabel}). Używam danych mock.`,
          errors: [detailedMessage],
        }),
      };
      return this.cache;
    }
  }

  async getStore(): Promise<OperatingDataStore> {
    const result = await this.importExcel();
    return result.store;
  }

  async getStatus(): Promise<DataProviderStatus> {
    const result = await this.importExcel();
    return result.status;
  }

  async getStructure(): Promise<WorkbookStructure> {
    const result = await this.importExcel();
    return result.structure;
  }
}
