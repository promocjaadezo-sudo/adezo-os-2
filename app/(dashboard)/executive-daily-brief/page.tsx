import { Crown } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ExecutivePlanStatusModule } from "@/components/build020/executive-plan-status";
import { TodayCriticalActions } from "@/components/build020/today-critical-actions";
import { RevenueGapSummaryModule } from "@/components/build020/revenue-gap-summary";
import { MarketingDecisionBox } from "@/components/build020/marketing-decision-box";
import { MagdaPriorityTasks } from "@/components/build020/magda-priority-tasks";
import { DataDisciplineAlertModule } from "@/components/build020/data-discipline-alert";
import { TopRevenueOpportunities } from "@/components/build020/top-revenue-opportunities";
import { CeoFinalRecommendation } from "@/components/build020/ceo-final-recommendation";
import { ProviderStatusPanel } from "@/components/data/provider-status-panel";
import { CrmDataQualityPanel } from "@/components/data/crm-data-quality-panel";
import { RevenueTruthPanel } from "@/components/data/revenue-truth-panel";
import { HotLeadPriorityBoard } from "@/components/data/hot-lead-priority-board";
import { createBuild020Snapshot } from "@/lib/build020";
import { createHotLeadResponseSnapshot } from "@/lib/hot-lead-response-engine";
import { getProviderStatus } from "@/lib/providers/data-provider";

export const dynamic = "force-dynamic";

export default async function ExecutiveDailyBriefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const [snapshot, providerStatus, hotLeadSnapshot] = await Promise.all([
    createBuild020Snapshot(),
    getProviderStatus(),
    createHotLeadResponseSnapshot(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Executive Daily Brief"
        description="BUILD 020: poranny ekran dowodzenia CEO — plan, ryzyka, działania dnia i finalna decyzja operacyjna."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Crown className="h-3.5 w-3.5" />
          MORNING COMMAND MODE
        </div>
      </PageHeader>

      <ExecutivePlanStatusModule data={snapshot.planStatus} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TodayCriticalActions actions={snapshot.todayActions} />
        <RevenueGapSummaryModule data={snapshot.revenueGap} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MarketingDecisionBox decisions={snapshot.marketingDecisions} />
        <MagdaPriorityTasks tasks={snapshot.magdaTasks} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DataDisciplineAlertModule alerts={snapshot.dataAlerts} />
        <TopRevenueOpportunities items={snapshot.topOpportunities} />
      </div>

      <ProviderStatusPanel status={providerStatus} />

      <CrmDataQualityPanel status={providerStatus} kpis={snapshot.crmKpis} />

      <RevenueTruthPanel snapshot={snapshot.revenueTruth} />

      <HotLeadPriorityBoard snapshot={hotLeadSnapshot} />

      <CeoFinalRecommendation recommendation={snapshot.finalRecommendation} />
    </div>
  );
}
