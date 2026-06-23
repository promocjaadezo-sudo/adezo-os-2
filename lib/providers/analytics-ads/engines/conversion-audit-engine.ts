import type {
  AdsProvider,
  AnalyticsProvider,
  AnalyticsAdsProviderStatus,
  ConversionSyncRecord,
  DateRange,
} from "../types";
import { deriveGa4LeadMetrics, getCanonicalLeadEventNames } from "../lead-metrics";

export const AUDIT_EVENTS = [
  ...getCanonicalLeadEventNames(),
  "formularz_start",
] as const;

export type AuditEventName = (typeof AUDIT_EVENTS)[number];

export interface LeadEventStat {
  eventName: AuditEventName;
  count24h: number;
  count7d: number;
  countPrev7d: number;
  dropPct: number;
}

export interface ConversionAuditAlert {
  id: string;
  type:
    | "WARNING"
    | "FUNNEL LEAK"
    | "ADS WASTE ALERT"
    | "DROP ALERT"
    | "PHONE TRACKING WARNING"
    | "LANDING PROBLEM";
  title: string;
  description: string;
}

export interface LandingTiranaAudit {
  sessions7d: number;
  leads7d: number;
  status: "OK" | "LANDING PROBLEM";
}

export interface ConversionAuditSnapshot {
  generatedAt: string;
  providerStatus: {
    ga4: AnalyticsAdsProviderStatus;
    googleAds: AnalyticsAdsProviderStatus;
  };
  events: LeadEventStat[];
  alerts: ConversionAuditAlert[];
  landingTirana: LandingTiranaAudit;
  totals: {
    adsCost7d: number;
    leads7d: number;
  };
}

interface SessionRecord {
  date: string;
  landingPage?: string;
  sessions: number;
}

interface CampaignRecord {
  date: string;
  cost: number;
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function createRange(from: Date, to: Date): DateRange {
  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
  };
}

function isInRange(date: string, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}

function sumEvent(records: ConversionSyncRecord[], eventName: string, range: DateRange): number {
  return records
    .filter((record) => record.conversionName === eventName && isInRange(record.date, range))
    .reduce((sum, record) => sum + (record.value || 0), 0);
}

function calculateDrop(current: number, previous: number): number {
  if (previous <= 0) {
    return current <= 0 ? 0 : -100;
  }
  return ((previous - current) / previous) * 100;
}

export class ConversionAuditEngine {
  async run(params: {
    analyticsProvider: AnalyticsProvider;
    adsProvider: AdsProvider;
  }): Promise<ConversionAuditSnapshot> {
    const now = new Date();

    const range24h = createRange(shiftDays(now, -1), now);
    const range7d = createRange(shiftDays(now, -6), now);
    const rangePrev7d = createRange(shiftDays(now, -13), shiftDays(now, -7));
    const range14d = createRange(shiftDays(now, -13), now);

    const [ga4Status, adsStatus, conversions14d, sessions7d, campaigns7d] = await Promise.all([
      params.analyticsProvider.getStatus(),
      params.adsProvider.getStatus(),
      params.analyticsProvider.getConversions(range14d),
      params.analyticsProvider.getSessions(range7d),
      params.adsProvider.getCampaigns(range7d),
    ]);

    const conversionRows = conversions14d;
    const sessionRows = sessions7d as SessionRecord[];
    const campaignRows = campaigns7d as CampaignRecord[];

    const lead24h = deriveGa4LeadMetrics(conversionRows, range24h);
    const lead7d = deriveGa4LeadMetrics(conversionRows, range7d);
    const leadPrev7d = deriveGa4LeadMetrics(conversionRows, rangePrev7d);

    const events: LeadEventStat[] = AUDIT_EVENTS.map((eventName) => {
      const count24h = eventName === "lead_count" ? lead24h.lead_count : sumEvent(conversionRows, eventName, range24h);
      const count7d = eventName === "lead_count" ? lead7d.lead_count : sumEvent(conversionRows, eventName, range7d);
      const countPrev7d = eventName === "lead_count" ? leadPrev7d.lead_count : sumEvent(conversionRows, eventName, rangePrev7d);
      const dropPct = calculateDrop(count7d, countPrev7d);

      return {
        eventName,
        count24h,
        count7d,
        countPrev7d,
        dropPct,
      };
    });

    const leads7d = lead7d.lead_count;

    const adsCost7d = campaignRows.reduce((sum, row) => sum + (row.cost || 0), 0);

    const tiranaSessions7d = sessionRows
      .filter((row) => (row.landingPage || "").toLowerCase().includes("tirana"))
      .reduce((sum, row) => sum + (row.sessions || 0), 0);

    const alerts: ConversionAuditAlert[] = [];

    if (lead24h.lead_count <= 0) {
      alerts.push({
        id: "warning-lead-count-24h",
        type: "WARNING",
        title: "Brak leadów przez 24h",
        description: "GA4 nie zarejestrował leadów (lead_count / komponenty leadowe) w ostatnich 24 godzinach.",
      });
    }

    if (sumEvent(conversionRows, "formularz_start", range7d) > 0 && lead7d.lead_form <= 0) {
      alerts.push({
        id: "funnel-leak-form",
        type: "FUNNEL LEAK",
        title: "Wykryto wyciek lejka formularza",
        description: "Są eventy formularz_start, ale brak lead_form w ostatnich 7 dniach.",
      });
    }

    if (adsCost7d > 0 && leads7d <= 0) {
      alerts.push({
        id: "ads-waste-alert",
        type: "ADS WASTE ALERT",
        title: "Kampanie wydają budżet bez leadów",
        description: "Koszt kampanii > 0, ale brak leadów z eventów leadowych w ostatnich 7 dniach.",
      });
    }

    const leadForm7d = lead7d.lead_form;
    const leadFormPrev7d = leadPrev7d.lead_form;
    const premiumDrop = calculateDrop(leadForm7d, leadFormPrev7d);

    if (leadFormPrev7d > 0 && premiumDrop > 40) {
      alerts.push({
        id: "drop-alert-lead-form",
        type: "DROP ALERT",
        title: "Spadek lead_form > 40%",
        description: `Spadek wynosi ${premiumDrop.toFixed(1)}% vs poprzednie 7 dni.`,
      });
    }

    if (lead7d.lead_tel <= 0) {
      alerts.push({
        id: "phone-tracking-warning",
        type: "PHONE TRACKING WARNING",
        title: "Brak lead_tel przez 7 dni",
        description: "Sprawdź poprawność śledzenia połączeń telefonicznych.",
      });
    }

    const landingProblem = tiranaSessions7d > 0 && leads7d <= 0;
    if (landingProblem) {
      alerts.push({
        id: "landing-tirana-problem",
        type: "LANDING PROBLEM",
        title: "Landing Tirana ma ruch bez leadów",
        description: "Na landing Tirana jest ruch, ale brak leadów w ostatnich 7 dniach.",
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      providerStatus: {
        ga4: ga4Status,
        googleAds: adsStatus,
      },
      events,
      alerts,
      landingTirana: {
        sessions7d: tiranaSessions7d,
        leads7d,
        status: landingProblem ? "LANDING PROBLEM" : "OK",
      },
      totals: {
        adsCost7d,
        leads7d,
      },
    };
  }

  static createDefaultRange(): DateRange {
    const now = new Date();
    return {
      from: toDateOnly(shiftDays(now, -6)),
      to: toDateOnly(now),
    };
  }

  static todayKey(): string {
    return toDateOnly(new Date());
  }
}
