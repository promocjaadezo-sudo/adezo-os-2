import type { TaskExecutionOutcome, TaskExecutionRecord } from "@/lib/task-status-tracker";

export interface TaskImpactRecord extends TaskExecutionRecord {
  affectsForecast: boolean;
  forecastDelta: number;
}

export interface TaskImpactSummary {
  totalAtRisk: number;
  overdueAtRisk: number;
  blockedAtRisk: number;
  doneRealized: number;
  byOwner: Array<{
    owner: string;
    atRisk: number;
    realized: number;
  }>;
}

function outcomeMultiplier(outcome?: TaskExecutionOutcome): number {
  if (!outcome) return 0;
  if (outcome === "sale_won") return 1;
  if (outcome === "sale_lost") return -1;
  if (outcome === "contacted") return 0.1;
  if (outcome === "offer_sent") return 0.2;
  if (outcome === "followup_done") return 0.15;
  if (outcome === "meeting_booked") return 0.25;
  if (outcome === "no_answer") return -0.05;
  return 0.05;
}

export function calculateTaskForecastImpact(tasks: TaskExecutionRecord[]): {
  tasks: TaskImpactRecord[];
  summary: TaskImpactSummary;
} {
  const enriched: TaskImpactRecord[] = tasks.map((task) => {
    const overdueOrBlocked = task.status === "OVERDUE" || task.status === "BLOCKED";
    const todoRisk = task.status === "TODO" || task.status === "IN_PROGRESS";

    let forecastDelta = 0;
    if (task.status === "DONE") {
      forecastDelta = Math.round(task.valueAtRisk * outcomeMultiplier(task.outcome));
    } else if (overdueOrBlocked) {
      forecastDelta = -Math.round(task.valueAtRisk * 0.35);
    } else if (todoRisk) {
      forecastDelta = -Math.round(task.valueAtRisk * 0.1);
    }

    return {
      ...task,
      affectsForecast: task.status !== "DONE" || (task.outcome === "sale_won" || task.outcome === "sale_lost"),
      forecastDelta,
    };
  });

  const totalAtRisk = enriched
    .filter((task) => task.status !== "DONE")
    .reduce((sum, task) => sum + task.valueAtRisk, 0);

  const overdueAtRisk = enriched
    .filter((task) => task.status === "OVERDUE")
    .reduce((sum, task) => sum + task.valueAtRisk, 0);

  const blockedAtRisk = enriched
    .filter((task) => task.status === "BLOCKED")
    .reduce((sum, task) => sum + task.valueAtRisk, 0);

  const doneRealized = enriched
    .filter((task) => task.status === "DONE")
    .reduce((sum, task) => sum + task.forecastDelta, 0);

  const ownerMap = new Map<string, { atRisk: number; realized: number }>();
  enriched.forEach((task) => {
    const current = ownerMap.get(task.owner) || { atRisk: 0, realized: 0 };
    if (task.status !== "DONE") {
      current.atRisk += task.valueAtRisk;
    } else {
      current.realized += task.forecastDelta;
    }
    ownerMap.set(task.owner, current);
  });

  const byOwner = Array.from(ownerMap.entries()).map(([owner, metrics]) => ({
    owner,
    atRisk: metrics.atRisk,
    realized: metrics.realized,
  }));

  return {
    tasks: enriched,
    summary: {
      totalAtRisk,
      overdueAtRisk,
      blockedAtRisk,
      doneRealized,
      byOwner,
    },
  };
}
