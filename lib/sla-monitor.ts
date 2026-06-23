import type { LeadCategory, LeadResponseRecord } from "@/lib/lead-response-tracker";

export type SlaLevel = "CRITICAL" | "WARNING" | "INFO" | "OK";

export interface LeadSlaStatus {
  leadId: string;
  category: LeadCategory;
  level: SlaLevel;
  thresholdMinutes: number;
  overdueMinutes: number;
  slaBreached: boolean;
  message: string;
}

export interface SlaMonitorSnapshot {
  statuses: LeadSlaStatus[];
  avgResponseMinutes: number;
  slaCompliancePct: number;
  breachedCount: number;
  recoveredBeforeSlaCount: number;
}

function thresholdFor(category: LeadCategory): number {
  if (category === "HOT") return 15;
  if (category === "WARM") return 120;
  return 24 * 60;
}

function levelFor(category: LeadCategory, breached: boolean): SlaLevel {
  if (!breached) return "OK";
  if (category === "HOT") return "CRITICAL";
  if (category === "WARM") return "WARNING";
  return "INFO";
}

export function monitorLeadSla(records: LeadResponseRecord[]): SlaMonitorSnapshot {
  const statuses: LeadSlaStatus[] = records.map((record) => {
    const thresholdMinutes = thresholdFor(record.category);
    const observed = record.contacted
      ? (record.firstResponseMinutes ?? record.minutesWithoutContact)
      : record.minutesWithoutContact;

    const overdueMinutes = Math.max(0, observed - thresholdMinutes);
    const slaBreached = overdueMinutes > 0;
    const level = levelFor(record.category, slaBreached);

    const message = slaBreached
      ? `${record.category}: SLA breached o ${overdueMinutes} min.`
      : `${record.category}: SLA OK.`;

    return {
      leadId: record.leadId,
      category: record.category,
      level,
      thresholdMinutes,
      overdueMinutes,
      slaBreached,
      message,
    };
  });

  const contacted = records.filter((record) => record.contacted && record.firstResponseMinutes != null);
  const avgResponseMinutes = contacted.length
    ? Math.round(contacted.reduce((sum, record) => sum + (record.firstResponseMinutes || 0), 0) / contacted.length)
    : 0;

  const breachedCount = statuses.filter((status) => status.slaBreached).length;
  const slaCompliancePct = records.length
    ? Math.round(((records.length - breachedCount) / records.length) * 100)
    : 100;

  const recoveredBeforeSlaCount = records.filter((record) => {
    if (!record.contacted || record.firstResponseMinutes == null) return false;
    return record.firstResponseMinutes <= thresholdFor(record.category);
  }).length;

  return {
    statuses,
    avgResponseMinutes,
    slaCompliancePct,
    breachedCount,
    recoveredBeforeSlaCount,
  };
}
