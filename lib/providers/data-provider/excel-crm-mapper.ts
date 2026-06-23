import type {
  CampaignEntity,
  ForecastEntity,
  LeadEntity,
  MagdaTaskEntity,
  OfferEntity,
  OperatingDataStore,
  PartnerEntity,
} from "@/lib/operating-model/types";

export interface ExcelCrmGa4Context {
  defaultSource?: string;
  defaultMedium?: string;
  defaultCampaign?: string;
  leadCount7d?: number;
}

export interface ExcelCrmRow {
  rowNumber: number;
  dataKontaktu?: string;
  klient?: string;
  telefon?: string;
  email?: string;
  nrOferty?: string;
  obsluga?: string;
  kwota?: number;
  szansa?: number;
  status?: string;
  dataOferty?: string;
  wynikSprzedazy?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  planMiesieczny?: number;
}

export interface ExcelCrmMappedResult {
  store: OperatingDataStore;
  diagnostics: {
    rows: number;
    inferredSourceRows: number;
    inferredCampaignRows: number;
  };
}

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function parseSource(value?: string): LeadEntity["source"] {
  const v = normalize(value);
  if (v.includes("meta")) return "meta";
  if (v.includes("google")) return "google";
  if (v.includes("architekt")) return "architect";
  if (v.includes("polecen") || v.includes("referral")) return "client_referral";
  if (v.includes("partner")) return "partner_referral";
  return "organic";
}

function parseOwner(value?: string): "Magda 1" | "Magda 2" {
  const v = normalize(value);
  if (v.includes("magda 2") || v.includes("magda b")) return "Magda 2";
  return "Magda 1";
}

function parseLeadStatus(value?: string): LeadEntity["status"] {
  const v = normalize(value);
  if (v.includes("wygran") || v.includes("realiz") || v.includes("zamow")) return "won";
  if (v.includes("utracon") || v.includes("przegran") || v.includes("anul")) return "lost";
  if (v.includes("ofert")) return "offer_needed";
  if (v.includes("kwalif") || v.includes("decyzj")) return "qualified";
  if (v.includes("kontakt") || v.includes("follow")) return "contacted";
  return "new";
}

function parseOfferStatus(value?: string, wynikSprzedazy?: string): OfferEntity["status"] {
  const v = `${normalize(value)} ${normalize(wynikSprzedazy)}`;
  if (v.includes("wygran") || v.includes("realiz") || v.includes("zamow") || v.includes("tak")) return "won";
  if (v.includes("utracon") || v.includes("przegran") || v.includes("nie")) return "lost";
  if (v.includes("decyzj") || v.includes("negocj")) return "negotiation";
  if (v.includes("pomiar")) return "measurement_done";
  if (v.includes("ofert") || v.includes("wyslan")) return "sent";
  return "draft";
}

function toIsoDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const raw = value.trim();
  if (!raw) return new Date().toISOString();

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  const parts = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (parts) {
    const day = Number(parts[1]);
    const month = Number(parts[2]);
    const year = Number(parts[3]);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return new Date().toISOString();
}

function campaignKey(source: string, medium: string, campaign: string): string {
  return `${source}|${medium}|${campaign}`;
}

export function mapExcelCrmRowsToStore(rows: ExcelCrmRow[], ga4: ExcelCrmGa4Context): ExcelCrmMappedResult {
  const leads: LeadEntity[] = [];
  const offers: OfferEntity[] = [];
  const campaignsByKey = new Map<string, CampaignEntity>();
  const magdaTasks: MagdaTaskEntity[] = [];
  const partners: PartnerEntity[] = [];
  const forecasts: ForecastEntity[] = [];

  let inferredSourceRows = 0;
  let inferredCampaignRows = 0;
  let leadSeq = 1;
  let taskSeq = 1;
  let planMonthly = 0;

  for (const row of rows) {
    if (!row.nrOferty) continue;

    const sourceRaw = row.source || ga4.defaultSource || "organic";
    const mediumRaw = row.medium || ga4.defaultMedium || "unknown";
    const campaignRaw = row.campaign || ga4.defaultCampaign || "GA4 Unassigned";

    if (!row.source && ga4.defaultSource) inferredSourceRows += 1;
    if (!row.campaign && ga4.defaultCampaign) inferredCampaignRows += 1;

    const source = parseSource(sourceRaw);
    const campaignName = `GA4 ${sourceRaw}/${mediumRaw} - ${campaignRaw}`;
    const cmpKey = campaignKey(sourceRaw, mediumRaw, campaignRaw);

    if (!campaignsByKey.has(cmpKey)) {
      campaignsByKey.set(cmpKey, {
        id: `CMP-GA4-${campaignsByKey.size + 1}`,
        name: campaignName,
        platform: source === "google" ? "Google" : "Meta",
        model: "Tirana",
        monthlyBudget: 0,
        status: "active",
      });
    }

    const campaign = campaignsByKey.get(cmpKey)!;
    const leadId = `LD-XLS-${leadSeq++}`;
    const owner = parseOwner(row.obsluga);
    const leadStatus = parseLeadStatus(row.status);
    const offerStatus = parseOfferStatus(row.status, row.wynikSprzedazy);

    leads.push({
      id: leadId,
      clientName: row.klient || `CRM_ROW_${row.rowNumber}`,
      phone: row.telefon || undefined,
      email: row.email || undefined,
      source,
      campaignId: campaign.id,
      owner,
      modelInterest: "Tirana",
      budget: row.kwota || 0,
      createdAt: toIsoDate(row.dataKontaktu),
      lastContactAt: row.dataKontaktu ? toIsoDate(row.dataKontaktu) : undefined,
      status: leadStatus,
    });

    offers.push({
      id: row.nrOferty,
      leadId,
      campaignId: campaign.id,
      owner,
      model: "Tirana",
      value: row.kwota || 0,
      status: offerStatus,
      createdAt: toIsoDate(row.dataOferty || row.dataKontaktu),
      sentAt: row.dataOferty ? toIsoDate(row.dataOferty) : undefined,
      lastFollowupAt: row.dataKontaktu ? toIsoDate(row.dataKontaktu) : undefined,
      winProbability: row.szansa != null ? Math.max(0, Math.min(1, row.szansa / 100)) : 0.5,
      decisionReason: row.wynikSprzedazy || undefined,
    });

    if (offerStatus !== "won" && offerStatus !== "lost") {
      magdaTasks.push({
        id: `TSK-XLS-${taskSeq++}`,
        owner,
        title: `Follow-up oferty ${row.nrOferty}`,
        linkedLeadId: leadId,
        linkedOfferId: row.nrOferty,
        dueAt: toIsoDate(row.dataKontaktu),
        priority: "high",
        done: false,
      });
    }

    if ((row.planMiesieczny || 0) > planMonthly) {
      planMonthly = row.planMiesieczny || 0;
    }
  }

  const wonRevenue = offers.filter((offer) => offer.status === "won").reduce((sum, offer) => sum + offer.value, 0);
  const monthKey = new Date().toISOString().slice(0, 7);
  forecasts.push({
    monthKey,
    revenuePlan: rows.length > 0 ? (planMonthly > 0 ? planMonthly : wonRevenue) : 0,
  });

  return {
    store: {
      leads,
      offers,
      campaigns: Array.from(campaignsByKey.values()),
      magdaTasks,
      partners,
      forecasts,
    },
    diagnostics: {
      rows: rows.length,
      inferredSourceRows,
      inferredCampaignRows,
    },
  };
}
