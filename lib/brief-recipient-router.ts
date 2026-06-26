import type { BriefAction } from "@/lib/brief-action-generator";
import type { BriefRuleFinding } from "@/lib/brief-priority-rules";

export type BriefRecipient = "CEO" | "Magda 1" | "Magda 2" | "Marketing";

export interface RecipientBrief {
  recipient: BriefRecipient;
  planStatus: string;
  biggestRisk: string;
  biggestOpportunity: string;
  tasksToday: BriefAction[];
}

function pickBiggestRisk(findings: BriefRuleFinding[], recipient: BriefRecipient): string {
  const owned = findings.filter((finding) => finding.owners.includes(recipient));
  if (!owned.length) return "Brak krytycznych ryzyk na dziś.";
  return owned[0].title;
}

function pickBiggestOpportunity(findings: BriefRuleFinding[], recipient: BriefRecipient): string {
  const opportunity = findings.find(
    (finding) => finding.owners.includes(recipient) && (finding.code === "HIGH_VALUE_VISIBILITY" || finding.code === "PLAN_GAP"),
  );
  return opportunity ? opportunity.title : "Utrzymaj tempo domknięć i jakość danych.";
}

export function routeBriefsByRecipient(input: {
  planStatus: string;
  findings: BriefRuleFinding[];
  actions: BriefAction[];
}): RecipientBrief[] {
  const recipients: BriefRecipient[] = ["CEO", "Magda 1", "Magda 2", "Marketing"];

  return recipients.map((recipient) => {
    const recipientActions = input.actions
      .filter((action) => action.recipient === recipient)
      .slice(0, 6);

    return {
      recipient,
      planStatus: input.planStatus,
      biggestRisk: pickBiggestRisk(input.findings, recipient),
      biggestOpportunity: pickBiggestOpportunity(input.findings, recipient),
      tasksToday: recipientActions,
    };
  });
}
