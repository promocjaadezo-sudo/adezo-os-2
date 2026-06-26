import { createAdsProvider, createAnalyticsProvider } from "@/lib/providers/analytics-ads";
import { getProviderStore } from "@/lib/providers/data-provider";
import type { AnalyticsAdsProviderStatus, DateRange } from "@/lib/providers/analytics-ads";
import type { CampaignSyncRecord, ConversionSyncRecord, AnalyticsSession } from "@/lib/providers/analytics-ads";
import type { OperatingDataStore } from "@/lib/operating-model/types";
import { deriveGa4LeadMetrics } from "@/lib/providers/analytics-ads/lead-metrics";

type TrackedEventName =
  | "formularz_start"
  | "lead_count"
  | "lead_form"
  | "lead_tel"
  | "lead_email"
  | "lead_messenger";

export type TiranaAlertKind =
  | "LANDING PROBLEM"
  | "FORM FRICTION"
  | "QUALITY PROBLEM"
  | "BUDGET WARNING"
  | "SCALE SIGNAL"
  | "CONTINUE"
  | "REVIEW OFFER / FOLLOW-UP";

export interface TiranaAlert {
  id: string;
  kind: TiranaAlertKind;
  message: string;
}

export interface TiranaPerformanceSnapshot {
  generatedAt: string;
  providerStatus: {
    ga4: AnalyticsAdsProviderStatus;
    googleAds: AnalyticsAdsProviderStatus;
  };
  traffic: {
    sessions7d: number;
    sessions14d: number;
  };
  events: Record<TrackedEventName, number>;
  funnel: {
    leads: number;
    hotLeads: number;
    offers: number;
    sales: number;
    revenue: number;
  };
  costs: {
    cost7d: number;
    costPrev7d: number;
  };
  economics: {
    costPerLead: number;
    costPerHotLead: number;
    costPerSale: number;
  };
  alerts: TiranaAlert[];
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function shiftDays(days: number): Date {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + days);
  return next;
}

function inRange(date: string, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}

function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return numerator / denominator;
}

function includesTirana(value?: string): boolean {
  return (value || "").toLowerCase().includes("tirana");
}

function sumConversions(records: ConversionSyncRecord[], name: string, range: DateRange): number {
  return records
    .filter((record) => record.conversionName === name && inRange(record.date, range))
    .reduce((sum, record) => sum + (record.value || 0), 0);
}

function sumTraffic(records: AnalyticsSession[], range: DateRange): number {
  return records
    .filter((record) => includesTirana(record.landingPage) && inRange(record.date, range))
    .reduce((sum, record) => sum + (record.sessions || 0), 0);
}

function sumTiranaCost(records: CampaignSyncRecord[], range: DateRange): number {
  return records
    .filter((record) => includesTirana(record.campaignName) && inRange(record.date, range))
    .reduce((sum, record) => sum + (record.cost || 0), 0);
}

function filterStoreByDate<T extends { createdAt?: string; sentAt?: string }>(
  list: T[],
  range: DateRange,
  dateSelector: (value: T) => string,
): T[] {
  return list.filter((item) => {
    const date = dateSelector(item);
    return Boolean(date) && inRange(date, range);
  });
}

function computeStoreFunnel(store: OperatingDataStore, range14d: DateRange) {
  const leads14d = filterStoreByDate(
    store.leads.filter((lead) => lead.modelInterest === "Tirana" || includesTirana(lead.campaignId)),
    range14d,
    (lead) => lead.createdAt,
  );

  const hotLeads14d = leads14d.filter((lead) => lead.temperature === "HOT");

  const offers14d = filterStoreByDate(
    store.offers.filter((offer) => offer.model === "Tirana"),
    range14d,
    (offer) => offer.createdAt,
  );

  const sales14d = offers14d.filter((offer) => offer.status === "won");
  const revenue14d = sales14d.reduce((sum, offer) => sum + (offer.value || 0), 0);

  return {
    leads: leads14d.length,
    hotLeads: hotLeads14d.length,
    offers: offers14d.length,
    sales: sales14d.length,
    revenue: revenue14d,
  };
}

export async function getLandingTiranaPerformanceSnapshot(): Promise<TiranaPerformanceSnapshot> {
  const analyticsProvider = createAnalyticsProvider();
  const adsProvider = createAdsProvider();

  const range7d: DateRange = { from: toDateKey(shiftDays(-6)), to: toDateKey(new Date()) };
  const rangePrev7d: DateRange = { from: toDateKey(shiftDays(-13)), to: toDateKey(shiftDays(-7)) };
  const range14d: DateRange = { from: toDateKey(shiftDays(-13)), to: toDateKey(new Date()) };

  const [ga4Status, adsStatus, sessionsRows14d, conversions14d, campaigns14d, store] = await Promise.all([
    analyticsProvider.getStatus(),
    adsProvider.getStatus(),
    analyticsProvider.getSessions(range14d),
    analyticsProvider.getConversions(range14d),
    adsProvider.getCampaigns(range14d),
    getProviderStore(),
  ]);

  const sessions7d = sumTraffic(sessionsRows14d, range7d);
  const sessions14dTotal = sumTraffic(sessionsRows14d, range14d);

  const leadMetrics14d = deriveGa4LeadMetrics(conversions14d, range14d);

  const eventStats = {
    formularz_start: sumConversions(conversions14d, "formularz_start", range14d),
    lead_count: leadMetrics14d.lead_count,
    lead_form: leadMetrics14d.lead_form,
    lead_tel: leadMetrics14d.lead_tel,
    lead_email: leadMetrics14d.lead_email,
    lead_messenger: leadMetrics14d.lead_messenger,
  };

  const funnel = computeStoreFunnel(store, range14d);

  const cost7d = sumTiranaCost(campaigns14d, range7d);
  const costPrev7d = sumTiranaCost(campaigns14d, rangePrev7d);

  const hotLeads7d = filterStoreByDate(
    store.leads.filter((lead) => lead.temperature === "HOT" && (lead.modelInterest === "Tirana" || includesTirana(lead.campaignId))),
    range7d,
    (lead) => lead.createdAt,
  ).length;

  const hotLeadsPrev7d = filterStoreByDate(
    store.leads.filter((lead) => lead.temperature === "HOT" && (lead.modelInterest === "Tirana" || includesTirana(lead.campaignId))),
    rangePrev7d,
    (lead) => lead.createdAt,
  ).length;

  const alerts: TiranaAlert[] = [];

  const leadSignals = eventStats.lead_count;

  if (sessions14dTotal > 0 && leadSignals <= 0) {
    alerts.push({
      id: "landing-problem",
      kind: "LANDING PROBLEM",
      message: "Landing Tirana ma ruch, ale nie generuje leadów.",
    });
  }

  if (eventStats.formularz_start > 0 && eventStats.lead_form <= 0) {
    alerts.push({
      id: "form-friction",
      kind: "FORM FRICTION",
      message: "Wykryto formularz_start bez submit — możliwa blokada formularza.",
    });
  }

  if (cost7d > costPrev7d && hotLeads7d <= hotLeadsPrev7d) {
    alerts.push({
      id: "quality-problem",
      kind: "QUALITY PROBLEM",
      message: "Koszt rośnie, ale HOT leady nie rosną.",
    });
  }

  if (cost7d - costPrev7d >= 1000 && hotLeads7d <= hotLeadsPrev7d) {
    alerts.push({
      id: "budget-warning",
      kind: "BUDGET WARNING",
      message: "+1000 zł budżetu nie przełożyło się na wzrost HOT leadów.",
    });
  }

  if (funnel.sales > 0) {
    alerts.push({
      id: "scale-signal",
      kind: "SCALE SIGNAL",
      message: "Tirana generuje sprzedaż — sygnał do skalowania.",
    });
  }

  const costPerHotLead = safeDivide(cost7d, Math.max(hotLeads7d, 0));
  if (hotLeads7d > 0 && costPerHotLead > 0 && costPerHotLead <= 1000) {
    alerts.push({
      id: "continue-signal",
      kind: "CONTINUE",
      message: "Koszt HOT leada jest akceptowalny — kontynuuj kampanię.",
    });
  }

  if (sessions14dTotal > 0 && funnel.sales <= 0) {
    alerts.push({
      id: "review-offer-followup",
      kind: "REVIEW OFFER / FOLLOW-UP",
      message: "Brak sprzedaży po 14 dniach — sprawdź ofertę i follow-up.",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    providerStatus: {
      ga4: ga4Status,
      googleAds: adsStatus,
    },
    traffic: {
      sessions7d,
      sessions14d: sessions14dTotal,
    },
    events: eventStats,
    funnel,
    costs: {
      cost7d,
      costPrev7d,
    },
    economics: {
      costPerLead: safeDivide(cost7d, Math.max(leadSignals, 0)),
      costPerHotLead: safeDivide(cost7d, Math.max(hotLeads7d, 0)),
      costPerSale: safeDivide(cost7d, Math.max(funnel.sales, 0)),
    },
    alerts,
  };
}
