import type { AdsProvider, AnalyticsProvider, AnalyticsAdsProviderStatus, DateRange } from "../types";

export const AUDIT_EVENTS = [
  "generate_lead",
  "premium_form_submit",
  "form_submit",
  "phone_call_lead",
  "consultation_request",
  "formularz_start",
  "file_download",
  "click",
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

interface ConversionRecord {
  date: string;
  conversionName: string;
  value: number;
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

function sumEvent(records: ConversionRecord[], eventName: string, range: DateRange): number {
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

    const conversionRows = conversions14d as ConversionRecord[];
    const sessionRows = sessions7d as SessionRecord[];
    const campaignRows = campaigns7d as CampaignRecord[];

    const events: LeadEventStat[] = AUDIT_EVENTS.map((eventName) => {
      const count24h = sumEvent(conversionRows, eventName, range24h);
      const count7d = sumEvent(conversionRows, eventName, range7d);
      const countPrev7d = sumEvent(conversionRows, eventName, rangePrev7d);
      const dropPct = calculateDrop(count7d, countPrev7d);

      return {
        eventName,
        count24h,
        count7d,
        countPrev7d,
        dropPct,
      };
    });

    const leads7d =
      sumEvent(conversionRows, "generate_lead", range7d) +
      sumEvent(conversionRows, "premium_form_submit", range7d) +
      sumEvent(conversionRows, "form_submit", range7d) +
      sumEvent(conversionRows, "consultation_request", range7d) +
      sumEvent(conversionRows, "phone_call_lead", range7d);

    const adsCost7d = campaignRows.reduce((sum, row) => sum + (row.cost || 0), 0);

    const tiranaSessions7d = sessionRows
      .filter((row) => (row.landingPage || "").toLowerCase().includes("tirana"))
      .reduce((sum, row) => sum + (row.sessions || 0), 0);

    const alerts: ConversionAuditAlert[] = [];

    if (sumEvent(conversionRows, "generate_lead", range24h) <= 0) {
      alerts.push({
        id: "warning-generate-lead-24h",
        type: "WARNING",
        title: "Brak generate_lead przez 24h",
        description: "GA4 nie zarejestrował eventu generate_lead w ostatnich 24 godzinach.",
      });
    }

    if (sumEvent(conversionRows, "formularz_start", range7d) > 0 && sumEvent(conversionRows, "form_submit", range7d) <= 0) {
      alerts.push({
        id: "funnel-leak-form",
        type: "FUNNEL LEAK",
        title: "Wykryto wyciek lejka formularza",
        description: "Są eventy formularz_start, ale brak form_submit w ostatnich 7 dniach.",
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

    const premium7d = sumEvent(conversionRows, "premium_form_submit", range7d);
    const premiumPrev7d = sumEvent(conversionRows, "premium_form_submit", rangePrev7d);
    const premiumDrop = calculateDrop(premium7d, premiumPrev7d);

    if (premiumPrev7d > 0 && premiumDrop > 40) {
      alerts.push({
        id: "drop-alert-premium-form-submit",
        type: "DROP ALERT",
        title: "Spadek premium_form_submit > 40%",
        description: `Spadek wynosi ${premiumDrop.toFixed(1)}% vs poprzednie 7 dni.`,
      });
    }

    if (sumEvent(conversionRows, "phone_call_lead", range7d) <= 0) {
      alerts.push({
        id: "phone-tracking-warning",
        type: "PHONE TRACKING WARNING",
        title: "Brak phone_call_lead przez 7 dni",
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
