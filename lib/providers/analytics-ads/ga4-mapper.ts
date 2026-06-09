import type { AnalyticsSession, ConversionSyncRecord } from "./types";

interface Ga4RunReportRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

interface Ga4RunReportResponse {
  rows?: Ga4RunReportRow[];
}

function parseNumber(value?: string): number {
  const parsed = Number(value || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(yyyymmdd?: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) {
    return new Date().toISOString().slice(0, 10);
  }
  const year = yyyymmdd.slice(0, 4);
  const month = yyyymmdd.slice(4, 6);
  const day = yyyymmdd.slice(6, 8);
  return `${year}-${month}-${day}`;
}

export function mapGa4SessionsResponse(raw: unknown): AnalyticsSession[] {
  const response = raw as Ga4RunReportResponse;
  const rows = response.rows || [];

  return rows.map((row) => {
    const dimensions = row.dimensionValues || [];
    const metrics = row.metricValues || [];

    return {
      date: normalizeDate(dimensions[0]?.value),
      source: dimensions[1]?.value || "(direct)",
      medium: dimensions[2]?.value || "(none)",
      campaign: dimensions[3]?.value || undefined,
      landingPage: dimensions[4]?.value || undefined,
      sessions: parseNumber(metrics[0]?.value),
      users: parseNumber(metrics[1]?.value),
    };
  });
}

const LEAD_EVENTS = new Set([
  "generate_lead",
  "form_submit",
  "premium_form_submit",
  "phone_call_lead",
  "consultation_request",
  "formularz_start",
  "file_download",
  "click",
]);

export function mapGa4ConversionsResponse(raw: unknown): ConversionSyncRecord[] {
  const response = raw as Ga4RunReportResponse;
  const rows = response.rows || [];

  return rows
    .map((row, index) => {
      const dimensions = row.dimensionValues || [];
      const metrics = row.metricValues || [];
      const eventName = dimensions[4]?.value || "unknown_event";

      return {
        id: `ga4-${dimensions[0]?.value || "nodate"}-${eventName}-${index}`,
        date: normalizeDate(dimensions[0]?.value),
        conversionName: eventName,
        value: parseNumber(metrics[0]?.value),
        source: dimensions[1]?.value || "(direct)",
        medium: dimensions[2]?.value || "(none)",
        campaignName: dimensions[3]?.value || undefined,
      } satisfies ConversionSyncRecord;
    })
    .filter((record) => LEAD_EVENTS.has(record.conversionName));
}
