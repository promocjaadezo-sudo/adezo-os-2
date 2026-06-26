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
import { LiveDataStatusPanel } from "@/components/data/live-data-status-panel";
import { DataTrustScoreExplainer } from "@/components/data/data-trust-score-explainer";
import { CrmCleanupPriorityPanel } from "@/components/data/crm-cleanup-priority-panel";
import { RevenueTruthPanel } from "@/components/data/revenue-truth-panel";
import { HotLeadPriorityBoard } from "@/components/data/hot-lead-priority-board";
import { createBuild015Snapshot } from "@/lib/build015";
import { createHotLeadResponseSnapshot } from "@/lib/hot-lead-response-engine";
import { createCrmMissingFieldsReport } from "@/lib/crm-missing-fields-report";
import { createDataTrustActionList } from "@/lib/data-trust-action-list";
import { createLiveDataStatusSnapshot } from "@/lib/live-data-status";
import { createRevenueTruthLayerSnapshot } from "@/lib/revenue-truth-layer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

  const [liveDataStatus, revenueTruth, hotLeadSnapshot, crmMissingReport] = await Promise.all([
    createLiveDataStatusSnapshot(),
    createRevenueTruthLayerSnapshot(),
    createHotLeadResponseSnapshot(),
    createCrmMissingFieldsReport(),
  ]);

  const dataTrustActions = createDataTrustActionList({
    live: liveDataStatus,
    report: crmMissingReport,
    targetScore: 70,
  });

  const snapshot = await createBuild015Snapshot({ dataTrustScore: liveDataStatus.dataTrustScore });

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

      {snapshot.forecastLowConfidence ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Badge variant="warning">FORECAST LOW CONFIDENCE</Badge>
              <p className="text-sm text-muted-foreground">
                Data Trust Score {snapshot.dataTrustScore}% jest poniżej 70%. Decyzje forecastowe wymagają ręcznej walidacji.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <LiveDataStatusPanel snapshot={liveDataStatus} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DataTrustScoreExplainer live={liveDataStatus} plan={dataTrustActions} />
        <CrmCleanupPriorityPanel report={crmMissingReport} plan={dataTrustActions} />
      </div>

      <DailyRevenueBriefGenerator brief={snapshot.brief} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AiRecommendationsEngine items={snapshot.recommendations} />
        <NextBestActionGenerator actions={snapshot.nextActions} priorityLeads={snapshot.priorityLeads} />
      </div>

      <RevenueRiskCenter risks={snapshot.revenueRisks} />

      <RevenueTruthPanel snapshot={revenueTruth} dataIncomplete={liveDataStatus.dataIncomplete} />

      <HotLeadPriorityBoard snapshot={hotLeadSnapshot} />

      <PlanRecoverySimulator scenarios={snapshot.recoveryScenarios} />
    </div>
  );
}
