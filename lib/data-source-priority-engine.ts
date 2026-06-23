import type { AnalyticsAdsProviderStatus } from "@/lib/providers/analytics-ads";
import type { DataProviderName, DataProviderStatus } from "@/lib/providers/data-provider";

export type CrmFallbackReason = "crm-unavailable" | "missing-file" | "read-error";

export interface DataSourcePriorityDecision {
  requestedProvider: string;
  activeProvider: DataProviderName;
  priorityOrder: DataProviderName[];
  strategy: "crm-first";
}

export interface CrmCompletenessInput {
  providerStatus: DataProviderStatus;
  daysSinceLastData: number | null;
  crmLeads: number;
  crmOffers: number;
  crmSales: number;
}

export interface DataTrustDimension {
  key: "crm" | "ga4" | "ads";
  completenessPct: number;
  details: string;
}

export interface DataTrustScoreResult {
  score: number;
  dimensions: DataTrustDimension[];
  missingData: string[];
}

const PRIORITY_ORDER: DataProviderName[] = ["excel-crm", "csv", "google-sheets", "supabase", "firebase", "mock"];

function normalizeProvider(value?: string): DataProviderName {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "csv" || normalized === "google-sheets" || normalized === "supabase" || normalized === "firebase" || normalized === "excel-crm" || normalized === "mock") {
    return normalized;
  }
  return "excel-crm";
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveDataSourcePriority(requestedProvider?: string): DataSourcePriorityDecision {
  const normalized = normalizeProvider(requestedProvider);
  return {
    requestedProvider: normalized,
    activeProvider: "excel-crm",
    priorityOrder: PRIORITY_ORDER,
    strategy: "crm-first",
  };
}

export function resolvePriorityProviderName(rawProvider?: string): DataProviderName {
  const requested = normalizeProvider(rawProvider || process.env.ADEZO_DATA_PROVIDER);
  if (requested === "excel-crm") return "excel-crm";
  return "excel-crm";
}

export function classifyCrmFallbackReason(input: string): CrmFallbackReason {
  const value = input.toLowerCase();
  if (value.includes("brak pliku") || value.includes(".xlsx") || value.includes("katalogu crm")) {
    return "missing-file";
  }
  if (value.includes("odczyt") || value.includes("read") || value.includes("arkusz") || value.includes("sheet")) {
    return "read-error";
  }
  return "crm-unavailable";
}

export function mapAnalyticsCompleteness(status: AnalyticsAdsProviderStatus): number {
  if (status.syncState === "ready") return 100;
  if (status.syncState === "stub") return status.configured ? 40 : 20;
  if (status.syncState === "not-configured") return 0;
  return 0;
}

export function mapCrmCompleteness(input: CrmCompletenessInput): number {
  const { providerStatus, crmLeads, crmOffers, crmSales, daysSinceLastData } = input;

  if (providerStatus.resolvedProvider !== "excel-crm") {
    return 0;
  }

  const recordCount = crmLeads + crmOffers + crmSales;
  if (recordCount === 0) {
    return 0;
  }

  let score = 100;
  score -= Math.min(35, providerStatus.incompleteRows * 0.5);
  score -= Math.min(25, providerStatus.incompleteFields * 0.1);

  if (daysSinceLastData !== null && daysSinceLastData > 7) score -= 50;
  else if (daysSinceLastData !== null && daysSinceLastData > 3) score -= 25;

  return clampScore(score);
}

export function calculateDataTrustScore(params: {
  providerStatus: DataProviderStatus;
  ga4Status: AnalyticsAdsProviderStatus;
  adsStatus: AnalyticsAdsProviderStatus;
  daysSinceLastData: number | null;
  crmLeads: number;
  crmOffers: number;
  crmSales: number;
}): DataTrustScoreResult {
  const crmScore = mapCrmCompleteness({
    providerStatus: params.providerStatus,
    daysSinceLastData: params.daysSinceLastData,
    crmLeads: params.crmLeads,
    crmOffers: params.crmOffers,
    crmSales: params.crmSales,
  });
  const ga4Score = mapAnalyticsCompleteness(params.ga4Status);
  const adsScore = mapAnalyticsCompleteness(params.adsStatus);
  const score = clampScore((crmScore + ga4Score + adsScore) / 3);

  const missingData: string[] = [];
  if (params.providerStatus.resolvedProvider !== "excel-crm") {
    missingData.push("CRM is not active as the primary source.");
  }
  if (params.crmLeads + params.crmOffers + params.crmSales === 0) {
    missingData.push("CRM has no usable lead/offer/sale records.");
  }
  if (params.daysSinceLastData !== null && params.daysSinceLastData > 3) {
    missingData.push(`CRM data stale for ${params.daysSinceLastData} day(s).`);
  }
  if (params.ga4Status.syncState !== "ready") {
    missingData.push("GA4 is not in ready state.");
  }
  if (params.adsStatus.syncState !== "ready") {
    missingData.push("Google Ads is not in ready state.");
  }

  return {
    score,
    dimensions: [
      {
        key: "crm",
        completenessPct: crmScore,
        details: `Provider: ${params.providerStatus.resolvedProvider}, rows incomplete: ${params.providerStatus.incompleteRows}.`,
      },
      {
        key: "ga4",
        completenessPct: ga4Score,
        details: `State: ${params.ga4Status.syncState}.`,
      },
      {
        key: "ads",
        completenessPct: adsScore,
        details: `State: ${params.adsStatus.syncState}.`,
      },
    ],
    missingData,
  };
}
