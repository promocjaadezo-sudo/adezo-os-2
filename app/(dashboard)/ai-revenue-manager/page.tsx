import { Bot } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { RevenueGapAnalyzerPanel } from "@/components/build015/revenue-gap-analyzer";
import { ForecastConfidenceEnginePanel } from "@/components/build015/forecast-confidence-engine";
import { DailyRevenueBriefGenerator } from "@/components/build015/daily-revenue-brief-generator";
import { AiRecommendationsEngine } from "@/components/build015/ai-recommendations-engine";
import { NextBestActionGenerator } from "@/components/build015/next-best-action-generator";
import { PlanRecoverySimulator } from "@/components/build015/plan-recovery-simulator";
import { RevenueRiskCenter } from "@/components/build015/revenue-risk-center";
import { RevenueTruthPanel } from "@/components/data/revenue-truth-panel";
import { HotLeadPriorityBoard } from "@/components/data/hot-lead-priority-board";
import { createBuild015Snapshot } from "@/lib/build015";
import { createHotLeadResponseSnapshot } from "@/lib/hot-lead-response-engine";
import { createRevenueTruthLayerSnapshot } from "@/lib/revenue-truth-layer";

export const dynamic = "force-dynamic";

export default async function AiRevenueManagerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const [snapshot, revenueTruth, hotLeadSnapshot] = await Promise.all([
    createBuild015Snapshot(),
    createRevenueTruthLayerSnapshot(),
    createHotLeadResponseSnapshot(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="AI Revenue Manager"
        description="BUILD 015: jedna odpowiedź na dziś — czy dowieziemy plan i co konkretnie trzeba zrobić, aby dowieźć wynik."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Bot className="h-3.5 w-3.5" />
          DECISION MODE
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueGapAnalyzerPanel data={snapshot.gap} />
        <ForecastConfidenceEnginePanel data={snapshot.confidence} />
      </div>

      <DailyRevenueBriefGenerator brief={snapshot.brief} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AiRecommendationsEngine items={snapshot.recommendations} />
        <NextBestActionGenerator actions={snapshot.nextActions} priorityLeads={snapshot.priorityLeads} />
      </div>

      <RevenueRiskCenter risks={snapshot.revenueRisks} />

      <RevenueTruthPanel snapshot={revenueTruth} />

      <HotLeadPriorityBoard snapshot={hotLeadSnapshot} />

      <PlanRecoverySimulator scenarios={snapshot.recoveryScenarios} />
    </div>
  );
}
