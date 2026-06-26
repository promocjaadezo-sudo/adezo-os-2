import { createAutomatedRevenueBriefSnapshot } from "@/lib/automated-revenue-brief-engine";
import { calculateTaskForecastImpact, type TaskImpactRecord } from "@/lib/task-impact-calculator";
import { buildTaskExecutionRecords } from "@/lib/task-status-tracker";
import { evaluateTaskOverdueRules, type TaskExecutionAlert } from "@/lib/task-overdue-rules";

export interface TaskExecutionValidationIssue {
  id: string;
  level: "critical" | "warning";
  message: string;
  taskId: string;
}

export interface TaskExecutionSnapshot {
  generatedAt: string;
  previewMode: boolean;
  planStatus: "PLAN AT RISK" | "PLAN ON TRACK";
  tasks: TaskImpactRecord[];
  alerts: TaskExecutionAlert[];
  validationIssues: TaskExecutionValidationIssue[];
  summary: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    blocked: number;
    overdue: number;
    totalAtRisk: number;
    overdueAtRisk: number;
    blockedAtRisk: number;
    doneRealized: number;
  };
  forecastImpactNote: string;
}

function validateExecutionRules(tasks: TaskImpactRecord[]): TaskExecutionValidationIssue[] {
  const issues: TaskExecutionValidationIssue[] = [];

  tasks.forEach((task) => {
    if (task.status === "DONE" && !task.outcome) {
      issues.push({
        id: `DONE-OUTCOME-${task.id}`,
        level: "critical",
        taskId: task.id,
        message: "DONE musi mieć outcome.",
      });
    }

    if (task.status === "BLOCKED" && !task.blockedReason) {
      issues.push({
        id: `BLOCKED-REASON-${task.id}`,
        level: "critical",
        taskId: task.id,
        message: "BLOCKED musi mieć reason.",
      });
    }

    if (task.outcome === "sale_lost" && !task.lostReason) {
      issues.push({
        id: `LOST-REASON-${task.id}`,
        level: "warning",
        taskId: task.id,
        message: "sale_lost musi mieć lost_reason.",
      });
    }
  });

  return issues;
}

export async function createTaskExecutionSnapshot(params?: {
  previewMode?: boolean;
}): Promise<TaskExecutionSnapshot> {
  const briefSnapshot = await createAutomatedRevenueBriefSnapshot({
    previewMode: params?.previewMode,
  });

  const trackedTasks = buildTaskExecutionRecords(briefSnapshot.actions);
  const impact = calculateTaskForecastImpact(trackedTasks);
  const alerts = evaluateTaskOverdueRules(impact.tasks);
  const validationIssues = validateExecutionRules(impact.tasks);

  const summary = {
    total: impact.tasks.length,
    todo: impact.tasks.filter((task) => task.status === "TODO").length,
    inProgress: impact.tasks.filter((task) => task.status === "IN_PROGRESS").length,
    done: impact.tasks.filter((task) => task.status === "DONE").length,
    blocked: impact.tasks.filter((task) => task.status === "BLOCKED").length,
    overdue: impact.tasks.filter((task) => task.status === "OVERDUE").length,
    totalAtRisk: impact.summary.totalAtRisk,
    overdueAtRisk: impact.summary.overdueAtRisk,
    blockedAtRisk: impact.summary.blockedAtRisk,
    doneRealized: impact.summary.doneRealized,
  };

  const forecastImpactNote =
    summary.overdue > 0 || summary.blocked > 0
      ? `Brak egzekucji wpływa na forecast: ryzyko ${summary.totalAtRisk.toLocaleString("pl-PL")} zł, ` +
        `w tym overdue ${summary.overdueAtRisk.toLocaleString("pl-PL")} zł.`
      : "Egzekucja stabilna: brak krytycznego wpływu na forecast.";

  return {
    generatedAt: new Date().toISOString(),
    previewMode: Boolean(params?.previewMode),
    planStatus: briefSnapshot.planStatus,
    tasks: impact.tasks,
    alerts,
    validationIssues,
    summary,
    forecastImpactNote,
  };
}
