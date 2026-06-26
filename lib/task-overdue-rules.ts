import type { TaskExecutionRecord } from "@/lib/task-status-tracker";

export interface TaskExecutionAlert {
  id: string;
  level: "critical" | "risk" | "warning";
  owner: "CEO" | "Magda 1" | "Magda 2" | "Marketing";
  title: string;
  description: string;
  taskId?: string;
}

function hoursOverdue(task: TaskExecutionRecord): number {
  const diff = Date.now() - new Date(task.deadlineAt).getTime();
  return diff / (1000 * 60 * 60);
}

export function evaluateTaskOverdueRules(tasks: TaskExecutionRecord[]): TaskExecutionAlert[] {
  const alerts: TaskExecutionAlert[] = [];

  const overdue = tasks.filter((task) => task.status === "OVERDUE");

  overdue.forEach((task) => {
    alerts.push({
      id: `OVERDUE-CEO-${task.id}`,
      level: "warning",
      owner: "CEO",
      title: "Zadanie overdue",
      description: `Zadanie ${task.id} jest po deadlinie i wymaga eskalacji.`,
      taskId: task.id,
    });

    const overdueHours = hoursOverdue(task);

    if (task.taskType === "hot_lead" && overdueHours > 2) {
      alerts.push({
        id: `HOT-CRITICAL-${task.id}`,
        level: "critical",
        owner: "CEO",
        title: "HOT lead task overdue >2h",
        description: `Krytyczne opóźnienie HOT leada (${overdueHours.toFixed(1)}h).`,
        taskId: task.id,
      });
    }

    if (task.taskType === "followup" && overdueHours > 24) {
      alerts.push({
        id: `FOLLOWUP-RISK-${task.id}`,
        level: "risk",
        owner: "CEO",
        title: "Follow-up overdue >24h",
        description: `Opóźniony follow-up (${overdueHours.toFixed(1)}h) zwiększa ryzyko utraty sprzedaży.`,
        taskId: task.id,
      });
    }

    if (task.valueAtRisk > 30000) {
      alerts.push({
        id: `VALUE-CEO-${task.id}`,
        level: "warning",
        owner: "CEO",
        title: "Overdue o wartości >30 000 zł",
        description: `Zadanie ${task.id} ma wartość ${task.valueAtRisk.toLocaleString("pl-PL")} zł i wymaga visibility CEO.`,
        taskId: task.id,
      });
    }
  });

  return alerts;
}
