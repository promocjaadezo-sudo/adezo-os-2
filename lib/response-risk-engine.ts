import type { LeadResponseRecord } from "@/lib/lead-response-tracker";
import type { SlaMonitorSnapshot } from "@/lib/sla-monitor";

export interface ResponseRiskAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  leadId?: string;
}

export interface OwnerResponsePerformance {
  owner: "Magda 1" | "Magda 2" | "UNASSIGNED";
  leads: number;
  avgResponseMinutes: number;
  slaCompliancePct: number;
  recoveredBeforeSla: number;
}

export interface ResponseRiskSnapshot {
  forecastPenalty: number;
  forecastRecovery: number;
  lostOpportunitiesNoResponse: number;
  responseTimeRanking: OwnerResponsePerformance[];
  leadOwnerPerformance: OwnerResponsePerformance[];
  overdueLeadAlerts: ResponseRiskAlert[];
  ceoCriticalAlerts: ResponseRiskAlert[];
}

function createOwnerPerformance(records: LeadResponseRecord[], sla: SlaMonitorSnapshot): OwnerResponsePerformance[] {
  const byOwner = new Map<"Magda 1" | "Magda 2" | "UNASSIGNED", LeadResponseRecord[]>();
  records.forEach((record) => {
    const bucket = byOwner.get(record.owner) || [];
    bucket.push(record);
    byOwner.set(record.owner, bucket);
  });

  return Array.from(byOwner.entries()).map(([owner, ownerRecords]) => {
    const responseRows = ownerRecords.filter((record) => record.firstResponseMinutes != null);
    const avgResponseMinutes = responseRows.length
      ? Math.round(responseRows.reduce((sum, record) => sum + (record.firstResponseMinutes || 0), 0) / responseRows.length)
      : 0;

    const ownerStatus = sla.statuses.filter((status) => ownerRecords.some((record) => record.leadId === status.leadId));
    const breached = ownerStatus.filter((status) => status.slaBreached).length;
    const slaCompliancePct = ownerStatus.length ? Math.round(((ownerStatus.length - breached) / ownerStatus.length) * 100) : 100;

    const recoveredBeforeSla = ownerRecords.filter((record) => {
      const status = sla.statuses.find((item) => item.leadId === record.leadId);
      return record.contacted && record.firstResponseMinutes != null && status && !status.slaBreached;
    }).length;

    return {
      owner,
      leads: ownerRecords.length,
      avgResponseMinutes,
      slaCompliancePct,
      recoveredBeforeSla,
    };
  });
}

export function calculateResponseRisk(records: LeadResponseRecord[], sla: SlaMonitorSnapshot): ResponseRiskSnapshot {
  const overdueLeadAlerts: ResponseRiskAlert[] = [];
  const ceoCriticalAlerts: ResponseRiskAlert[] = [];

  let forecastPenalty = 0;
  let forecastRecovery = 0;
  let lostOpportunitiesNoResponse = 0;

  records.forEach((record) => {
    const status = sla.statuses.find((item) => item.leadId === record.leadId);
    if (!status) return;

    const breached = status.slaBreached;
    if (breached) {
      overdueLeadAlerts.push({
        id: `SLA-${record.leadId}`,
        severity: status.level === "CRITICAL" ? "critical" : status.level === "WARNING" ? "warning" : "info",
        title: `${record.category} lead overdue`,
        description: `${record.clientName}: ${status.message}`,
        leadId: record.leadId,
      });
    }

    if (record.category === "HOT" && breached && !record.contacted) {
      forecastPenalty += Math.round(record.budget * 0.25);
      lostOpportunitiesNoResponse += record.budget;
    }

    if (record.contacted && !breached) {
      forecastRecovery += Math.round(record.budget * 0.08);
    }

    if (record.budget > 30000) {
      ceoCriticalAlerts.push({
        id: `CEO-VALUE-${record.leadId}`,
        severity: "warning",
        title: "Lead > 30 000 zł",
        description: `${record.clientName} (${record.budget.toLocaleString("pl-PL")} zł) wymaga visibility CEO.`,
        leadId: record.leadId,
      });
    }

    if (record.category === "HOT" && !record.contacted && record.minutesWithoutContact > 60) {
      ceoCriticalAlerts.push({
        id: `CEO-HOT-OVERDUE-${record.leadId}`,
        severity: "critical",
        title: "HOT overdue > 1h",
        description: `${record.clientName} czeka ${record.minutesWithoutContact} min bez kontaktu.`,
        leadId: record.leadId,
      });
    }

    if (record.owner === "UNASSIGNED") {
      ceoCriticalAlerts.push({
        id: `CEO-NO-OWNER-${record.leadId}`,
        severity: "warning",
        title: "Brak opiekuna leada",
        description: `${record.clientName} nie ma przypisanego opiekuna.`,
        leadId: record.leadId,
      });
    }

    if (record.isVipArchitectLead) {
      ceoCriticalAlerts.push({
        id: `CEO-VIP-ARCH-${record.leadId}`,
        severity: "critical",
        title: "Lead od architekta VIP",
        description: `${record.clientName} to lead premium od architekta VIP.`,
        leadId: record.leadId,
      });
    }
  });

  const ownerPerformance = createOwnerPerformance(records, sla);
  const responseTimeRanking = ownerPerformance
    .slice()
    .sort((left, right) => {
      if (left.avgResponseMinutes !== right.avgResponseMinutes) {
        return left.avgResponseMinutes - right.avgResponseMinutes;
      }
      return right.slaCompliancePct - left.slaCompliancePct;
    });

  return {
    forecastPenalty,
    forecastRecovery,
    lostOpportunitiesNoResponse,
    responseTimeRanking,
    leadOwnerPerformance: ownerPerformance,
    overdueLeadAlerts,
    ceoCriticalAlerts,
  };
}
