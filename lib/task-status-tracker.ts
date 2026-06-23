import type { BriefAction } from "@/lib/brief-action-generator";

export type TaskExecutionStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "OVERDUE";
export type TaskExecutionOutcome =
  | "contacted"
  | "offer_sent"
  | "followup_done"
  | "meeting_booked"
  | "sale_won"
  | "sale_lost"
  | "no_answer"
  | "postponed";

export type TaskType = "hot_lead" | "followup" | "marketing" | "ceo_visibility" | "data_discipline" | "general";

export interface TaskExecutionRecord {
  id: string;
  actionId: string;
  ruleCode: string;
  title: string;
  owner: string;
  recipient: "CEO" | "Magda 1" | "Magda 2" | "Marketing";
  priority: "critical" | "high" | "medium";
  deadlineAt: string;
  status: TaskExecutionStatus;
  outcome?: TaskExecutionOutcome;
  blockedReason?: string;
  lostReason?: string;
  completedAt?: string;
  valueAtRisk: number;
  taskType: TaskType;
  dataSources: Array<"GA4" | "Google Ads" | "Excel CRM" | "Revenue Truth Layer">;
}

function parseDeadline(deadline: string): Date {
  const now = new Date();
  const result = new Date(now);

  if (deadline.toLowerCase().includes("jutro")) {
    result.setDate(result.getDate() + 1);
  }

  const timeMatch = deadline.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    result.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  } else {
    result.setHours(17, 0, 0, 0);
  }

  return result;
}

function inferTaskType(task: string): TaskType {
  const text = task.toLowerCase();
  if (text.includes("hot lead") || text.includes("kontaktuj")) return "hot_lead";
  if (text.includes("follow-up") || text.includes("followup")) return "followup";
  if (text.includes("kampani") || text.includes("budżet") || text.includes("budget")) return "marketing";
  if (text.includes("dyscyplin") || text.includes("crm")) return "data_discipline";
  if (text.includes("ceo") || text.includes(">30k") || text.includes("top okazji")) return "ceo_visibility";
  return "general";
}

function defaultOutcome(taskType: TaskType): TaskExecutionOutcome {
  if (taskType === "hot_lead") return "contacted";
  if (taskType === "followup") return "followup_done";
  if (taskType === "marketing") return "meeting_booked";
  if (taskType === "ceo_visibility") return "meeting_booked";
  if (taskType === "data_discipline") return "offer_sent";
  return "postponed";
}

function valueAtRiskByRule(ruleCode: string): number {
  if (ruleCode === "HIGH_VALUE_VISIBILITY") return 50000;
  if (ruleCode === "PLAN_GAP") return 35000;
  if (ruleCode === "HOT_LEAD_NO_CONTACT") return 32000;
  if (ruleCode === "OFFER_FOLLOWUP_DELAY") return 28000;
  if (ruleCode === "TIRANA_LEADS_NO_SALES") return 26000;
  return 18000;
}

export function buildTaskExecutionRecords(actions: BriefAction[]): TaskExecutionRecord[] {
  const now = Date.now();

  return actions.map((action, index) => {
    const ruleCode = action.id.split("-")[0] || "GENERAL";
    const taskType = inferTaskType(action.task);
    const deadline = parseDeadline(action.deadline);

    if (ruleCode === "HOT_LEAD_NO_CONTACT") {
      deadline.setTime(now - 3 * 60 * 60 * 1000);
    }

    if (ruleCode === "OFFER_FOLLOWUP_DELAY") {
      deadline.setTime(now - 30 * 60 * 60 * 1000);
    }

    let status: TaskExecutionStatus = "TODO";

    if (deadline.getTime() < now) {
      status = "OVERDUE";
    } else if (action.priority === "critical") {
      status = "IN_PROGRESS";
    }

    if (status !== "OVERDUE" && index % 6 === 0) {
      status = "DONE";
    } else if (status === "TODO" && index % 7 === 0) {
      status = "BLOCKED";
    }

    const outcome = status === "DONE" ? defaultOutcome(taskType) : undefined;
    const blockedReason = status === "BLOCKED" ? "Oczekiwanie na decyzję klienta / brak potwierdzenia terminu." : undefined;
    const lostReason = outcome === "sale_lost" ? "Cena i timing poza oczekiwaniem klienta." : undefined;

    return {
      id: `TASK-${index + 1}`,
      actionId: action.id,
      ruleCode,
      title: action.task,
      owner: action.owner,
      recipient: action.recipient,
      priority: action.priority,
      deadlineAt: deadline.toISOString(),
      status,
      outcome,
      blockedReason,
      lostReason,
      completedAt: status === "DONE" ? new Date().toISOString() : undefined,
      valueAtRisk: valueAtRiskByRule(ruleCode),
      taskType,
      dataSources: action.dataSources,
    };
  });
}
