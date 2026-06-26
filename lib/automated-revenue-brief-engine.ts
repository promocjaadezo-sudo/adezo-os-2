import { generateBriefActions, type BriefAction } from "@/lib/brief-action-generator";
import { evaluateBriefPriorityRules, type BriefRuleFinding } from "@/lib/brief-priority-rules";
import { routeBriefsByRecipient, type RecipientBrief } from "@/lib/brief-recipient-router";
import { getProviderStatus, getProviderStore } from "@/lib/providers/data-provider";
import { createRevenueTruthLayerSnapshot, type RevenueTruthSnapshot } from "@/lib/revenue-truth-layer";

export interface AutomatedRevenueBriefSnapshot {
  generatedAt: string;
  previewMode: boolean;
  planStatus: "PLAN AT RISK" | "PLAN ON TRACK";
  sourceOfTruth: Array<"GA4" | "Google Ads" | "Excel CRM" | "Revenue Truth Layer">;
  truth: RevenueTruthSnapshot;
  findings: BriefRuleFinding[];
  actions: BriefAction[];
  briefs: RecipientBrief[];
}

export async function createAutomatedRevenueBriefSnapshot(params?: {
  previewMode?: boolean;
}): Promise<AutomatedRevenueBriefSnapshot> {
  const [truth, providerStatus, store] = await Promise.all([
    createRevenueTruthLayerSnapshot(),
    getProviderStatus(),
    getProviderStore(),
  ]);

  const findings = evaluateBriefPriorityRules({
    truth,
    store,
    providerStatus,
  });

  const actions = generateBriefActions(findings);
  const planStatus: AutomatedRevenueBriefSnapshot["planStatus"] =
    truth.summary.gapToPlan > 0 ? "PLAN AT RISK" : "PLAN ON TRACK";

  const briefs = routeBriefsByRecipient({
    planStatus,
    findings,
    actions,
  });

  return {
    generatedAt: new Date().toISOString(),
    previewMode: Boolean(params?.previewMode),
    planStatus,
    sourceOfTruth: ["GA4", "Google Ads", "Excel CRM", "Revenue Truth Layer"],
    truth,
    findings,
    actions,
    briefs,
  };
}
