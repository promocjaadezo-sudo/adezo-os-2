import { createAnalyticsProvider } from "@/lib/providers/analytics-ads";
import { deriveGa4LeadMetrics } from "@/lib/providers/analytics-ads/lead-metrics";
import { getProviderStore } from "@/lib/providers/data-provider";
import { buildLeadResponseTracker, type LeadResponseRecord } from "@/lib/lead-response-tracker";
import { calculateResponseRisk } from "@/lib/response-risk-engine";
import { createRevenueTruthLayerSnapshot } from "@/lib/revenue-truth-layer";
import { monitorLeadSla } from "@/lib/sla-monitor";
import { createTaskExecutionSnapshot } from "@/lib/task-execution-engine";

export interface HotLeadResponseSnapshot {
  generatedAt: string;
  previewMode: boolean;
  summary: {
    avgResponseMinutes: number;
    slaCompliancePct: number;
    lostOpportunitiesNoResponse: number;
    forecastPenalty: number;
    forecastRecovery: number;
    hotQueueCount: number;
    ga4LeadCount: number;
    revenueTruthGap: number;
    taskExecutionOverdue: number;
  };
  leadRecords: LeadResponseRecord[];
  hotLeadQueue: LeadResponseRecord[];
  overdueLeadAlerts: Array<{
    leadId: string;
    clientName: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    message: string;
  }>;
  responseTimeRanking: Array<{
    owner: "Magda 1" | "Magda 2" | "UNASSIGNED";
    avgResponseMinutes: number;
    slaCompliancePct: number;
  }>;
  leadOwnerPerformance: Array<{
    owner: "Magda 1" | "Magda 2" | "UNASSIGNED";
    leads: number;
    recoveredBeforeSla: number;
    atRiskValue: number;
  }>;
  ceoCriticalAlerts: Array<{
    title: string;
    description: string;
  }>;
  forecastImpactNote: string;
}

export async function createHotLeadResponseSnapshot(params?: {
  previewMode?: boolean;
}): Promise<HotLeadResponseSnapshot> {
  const analyticsProvider = createAnalyticsProvider();

  const [store, ga4Conversions, truth, taskExecution] = await Promise.all([
    getProviderStore(),
    analyticsProvider.getConversions("last7days"),
    createRevenueTruthLayerSnapshot(),
    createTaskExecutionSnapshot({ previewMode: params?.previewMode }),
  ]);

  const ga4LeadMetrics = deriveGa4LeadMetrics(ga4Conversions);
  const leadRecords = buildLeadResponseTracker(store);
  const slaSnapshot = monitorLeadSla(leadRecords);
  const risk = calculateResponseRisk(leadRecords, slaSnapshot);

  const hotLeadQueue = leadRecords
    .filter((lead) => lead.category === "HOT")
    .sort((left, right) => right.minutesWithoutContact - left.minutesWithoutContact);

  const overdueLeadAlerts = slaSnapshot.statuses
    .filter((status) => status.slaBreached)
    .map((status) => {
      const lead = leadRecords.find((item) => item.leadId === status.leadId);
      const severity: "CRITICAL" | "WARNING" | "INFO" =
        status.level === "CRITICAL" ? "CRITICAL" : status.level === "WARNING" ? "WARNING" : "INFO";

      return {
        leadId: status.leadId,
        clientName: lead?.clientName || status.leadId,
        severity,
        message: status.message,
      };
    });

  const leadOwnerPerformance = risk.leadOwnerPerformance.map((row) => {
    const ownerLeads = leadRecords.filter((lead) => lead.owner === row.owner);
    const atRiskValue = ownerLeads
      .filter((lead) => {
        const status = slaSnapshot.statuses.find((item) => item.leadId === lead.leadId);
        return Boolean(status?.slaBreached);
      })
      .reduce((sum, lead) => sum + lead.budget, 0);

    return {
      owner: row.owner,
      leads: row.leads,
      recoveredBeforeSla: row.recoveredBeforeSla,
      atRiskValue,
    };
  });

  const forecastImpactNote =
    `Każdy HOT lead bez kontaktu obniża forecast. Kara: ${risk.forecastPenalty.toLocaleString("pl-PL")} zł. ` +
    `Leady odzyskane przed SLA poprawiły forecast o ${risk.forecastRecovery.toLocaleString("pl-PL")} zł.`;

  return {
    generatedAt: new Date().toISOString(),
    previewMode: Boolean(params?.previewMode),
    summary: {
      avgResponseMinutes: slaSnapshot.avgResponseMinutes,
      slaCompliancePct: slaSnapshot.slaCompliancePct,
      lostOpportunitiesNoResponse: risk.lostOpportunitiesNoResponse,
      forecastPenalty: risk.forecastPenalty,
      forecastRecovery: risk.forecastRecovery,
      hotQueueCount: hotLeadQueue.length,
      ga4LeadCount: ga4LeadMetrics.lead_count,
      revenueTruthGap: truth.summary.gapToPlan,
      taskExecutionOverdue: taskExecution.summary.overdue,
    },
    leadRecords,
    hotLeadQueue,
    overdueLeadAlerts,
    responseTimeRanking: risk.responseTimeRanking.map((row) => ({
      owner: row.owner,
      avgResponseMinutes: row.avgResponseMinutes,
      slaCompliancePct: row.slaCompliancePct,
    })),
    leadOwnerPerformance,
    ceoCriticalAlerts: risk.ceoCriticalAlerts.map((alert) => ({
      title: alert.title,
      description: alert.description,
    })),
    forecastImpactNote,
  };
}
