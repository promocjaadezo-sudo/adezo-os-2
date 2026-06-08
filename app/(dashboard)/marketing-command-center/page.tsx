import { Megaphone } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { CampaignPerformanceBoard } from "@/components/build012/campaign-performance-board";
import { LeadSourceAttribution } from "@/components/build012/lead-source-attribution";
import { HotLeadRate } from "@/components/build012/hot-lead-rate";
import { CostMetrics } from "@/components/build012/cost-metrics";
import { BudgetRecommendationEngine } from "@/components/build012/budget-recommendation-engine";
import { CampaignActionCenter } from "@/components/build012/campaign-action-center";
import { createBuild012Snapshot } from "@/lib/build012";
import { formatCurrency, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MarketingCommandCenterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild012Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Marketing Command Center"
        description="BUILD 012: decyzje budżetowe i działania agencyjne oparte na jakości leadów i przychodzie."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Megaphone className="h-3.5 w-3.5" />
          ACTION-DRIVEN
        </div>
      </PageHeader>

      <KpiGrid className="lg:grid-cols-5">
        <KpiCard title="Leady" value={formatNumber(snapshot.totals.leads)} subtitle="Wszystkie źródła" variant="gold" />
        <KpiCard title="HOT leady" value={formatNumber(snapshot.totals.hotLeads)} subtitle="Lead quality" variant="warning" />
        <KpiCard title="Oferty" value={formatNumber(snapshot.totals.offers)} subtitle="Lead → offer" variant="success" />
        <KpiCard title="Sprzedaże" value={formatNumber(snapshot.totals.sales)} subtitle="Offer → sale" variant="success" />
        <KpiCard title="Przychód" value={formatCurrency(snapshot.totals.revenue)} subtitle="Wpływ kampanii" variant="gold" />
      </KpiGrid>

      <CampaignPerformanceBoard campaigns={snapshot.campaigns} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LeadSourceAttribution attribution={snapshot.attribution} />
        <HotLeadRate rate={snapshot.totals.hotLeadRatePct} />
      </div>

      <CostMetrics cpl={snapshot.totals.avgCpl} cphl={snapshot.totals.avgCostPerHotLead} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BudgetRecommendationEngine items={snapshot.budgetRecommendations} />
        <CampaignActionCenter summary={snapshot.actionSummary} agencyFixes={snapshot.agencyFixes} />
      </div>
    </div>
  );
}
