import type { ConversionSyncRecord, DateRange } from "./types";

export const CANONICAL_LEAD_EVENTS = [
  "lead_count",
  "lead_form",
  "lead_tel",
  "lead_email",
  "lead_messenger",
] as const;

type CanonicalLeadEvent = (typeof CANONICAL_LEAD_EVENTS)[number];

const LEGACY_FORM_EVENTS = ["generate_lead", "form_submit", "premium_form_submit", "consultation_request"] as const;
const LEGACY_TEL_EVENTS = ["phone_call_lead"] as const;

const SUPPORTED_EVENTS = new Set<string>([
  ...CANONICAL_LEAD_EVENTS,
  ...LEGACY_FORM_EVENTS,
  ...LEGACY_TEL_EVENTS,
  "formularz_start",
  "file_download",
  "click",
]);

export interface Ga4LeadMetrics {
  lead_count: number;
  lead_form: number;
  lead_tel: number;
  lead_email: number;
  lead_messenger: number;
  source: "ga4_lead_count" | "sum_components" | "legacy_generate_lead";
}

function inRange(date: string, range?: DateRange): boolean {
  if (!range) return true;
  return date >= range.from && date <= range.to;
}

function sumEvent(records: ConversionSyncRecord[], eventName: string, range?: DateRange): number {
  return records
    .filter((record) => record.conversionName === eventName && inRange(record.date, range))
    .reduce((sum, record) => sum + (record.value || 0), 0);
}

export function isSupportedGa4LeadOrFunnelEvent(eventName: string): boolean {
  return SUPPORTED_EVENTS.has(eventName);
}

export function deriveGa4LeadMetrics(records: ConversionSyncRecord[], range?: DateRange): Ga4LeadMetrics {
  const directLeadCount = sumEvent(records, "lead_count", range);

  const canonicalForm = sumEvent(records, "lead_form", range);
  const canonicalTel = sumEvent(records, "lead_tel", range);
  const canonicalEmail = sumEvent(records, "lead_email", range);
  const canonicalMessenger = sumEvent(records, "lead_messenger", range);

  const legacyForm = LEGACY_FORM_EVENTS.reduce((sum, eventName) => sum + sumEvent(records, eventName, range), 0);
  const legacyTel = LEGACY_TEL_EVENTS.reduce((sum, eventName) => sum + sumEvent(records, eventName, range), 0);
  const legacyGenerateLead = sumEvent(records, "generate_lead", range);

  const lead_form = canonicalForm > 0 ? canonicalForm : legacyForm;
  const lead_tel = canonicalTel > 0 ? canonicalTel : legacyTel;
  const lead_email = canonicalEmail;
  const lead_messenger = canonicalMessenger;

  const summedComponents = lead_form + lead_tel + lead_email + lead_messenger;

  if (directLeadCount > 0) {
    return {
      lead_count: directLeadCount,
      lead_form,
      lead_tel,
      lead_email,
      lead_messenger,
      source: "ga4_lead_count",
    };
  }

  if (summedComponents > 0) {
    return {
      lead_count: summedComponents,
      lead_form,
      lead_tel,
      lead_email,
      lead_messenger,
      source: "sum_components",
    };
  }

  return {
    lead_count: legacyGenerateLead,
    lead_form: legacyGenerateLead,
    lead_tel: 0,
    lead_email: 0,
    lead_messenger: 0,
    source: "legacy_generate_lead",
  };
}

export function getCanonicalLeadEventNames(): CanonicalLeadEvent[] {
  return [...CANONICAL_LEAD_EVENTS];
}
