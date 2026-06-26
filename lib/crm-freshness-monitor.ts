import type { OperatingDataStore } from "@/lib/operating-model/types";

export type CrmFreshnessLevel = "ok" | "warning" | "critical" | "incomplete";

export interface CrmFreshnessSnapshot {
  level: CrmFreshnessLevel;
  daysSinceLastData: number | null;
  lastDataAt: string | null;
  missingDates: string[];
  alerts: string[];
}

function toTimestamp(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function floorDaysDiff(newer: Date, older: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const newerUtc = Date.UTC(newer.getUTCFullYear(), newer.getUTCMonth(), newer.getUTCDate());
  const olderUtc = Date.UTC(older.getUTCFullYear(), older.getUTCMonth(), older.getUTCDate());
  return Math.max(0, Math.floor((newerUtc - olderUtc) / msPerDay));
}

function listMissingDates(lastDataAt: Date, now: Date): string[] {
  const days = floorDaysDiff(now, lastDataAt);
  if (days <= 0) return [];

  const list: string[] = [];
  const maxDaysToList = Math.min(days, 31);
  for (let index = 1; index <= maxDaysToList; index += 1) {
    const date = new Date(lastDataAt);
    date.setUTCDate(date.getUTCDate() + index);
    list.push(date.toISOString().slice(0, 10));
  }
  return list;
}

export function monitorCrmFreshness(store: OperatingDataStore, now = new Date()): CrmFreshnessSnapshot {
  const timestamps: number[] = [];

  for (const lead of store.leads) {
    const createdAt = toTimestamp(lead.createdAt);
    const lastContactAt = toTimestamp(lead.lastContactAt);
    if (createdAt !== null) timestamps.push(createdAt);
    if (lastContactAt !== null) timestamps.push(lastContactAt);
  }

  for (const offer of store.offers) {
    const createdAt = toTimestamp(offer.createdAt);
    const sentAt = toTimestamp(offer.sentAt);
    const followupAt = toTimestamp(offer.lastFollowupAt);
    if (createdAt !== null) timestamps.push(createdAt);
    if (sentAt !== null) timestamps.push(sentAt);
    if (followupAt !== null) timestamps.push(followupAt);
  }

  if (timestamps.length === 0) {
    return {
      level: "incomplete",
      daysSinceLastData: null,
      lastDataAt: null,
      missingDates: [],
      alerts: ["DATA INCOMPLETE: CRM has no dated records."],
    };
  }

  const lastTimestamp = Math.max(...timestamps);
  const lastDataDate = new Date(lastTimestamp);
  const daysSinceLastData = floorDaysDiff(now, lastDataDate);
  const missingDates = listMissingDates(lastDataDate, now);

  if (daysSinceLastData > 7) {
    return {
      level: "critical",
      daysSinceLastData,
      lastDataAt: lastDataDate.toISOString(),
      missingDates,
      alerts: [`CRITICAL: CRM data stale for ${daysSinceLastData} days.`],
    };
  }

  if (daysSinceLastData > 3) {
    return {
      level: "warning",
      daysSinceLastData,
      lastDataAt: lastDataDate.toISOString(),
      missingDates,
      alerts: [`WARNING: CRM data stale for ${daysSinceLastData} days.`],
    };
  }

  return {
    level: "ok",
    daysSinceLastData,
    lastDataAt: lastDataDate.toISOString(),
    missingDates,
    alerts: [],
  };
}
