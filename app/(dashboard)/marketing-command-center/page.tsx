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
import { getGa4LiveMetrics } from "@/lib/ga4-live";

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
  const ga4Live = await getGa4LiveMetrics();
  const ga4StatusMessage = ga4Live.status === "ok" ? "" : `${ga4Live.status}: ${ga4Live.message}`;
  const trackedLeads7d =
    ga4Live.metrics.events7d.generate_lead.eventCount +
    ga4Live.metrics.events7d.premium_form_submit.eventCount +
    ga4Live.metrics.events7d.phone_call_lead.eventCount;

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

      {ga4Live.status !== "ok" && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          GA4 Live status: {ga4StatusMessage}. KPI pokazują fallback z BUILD 012.
        </div>
      )}

      <KpiGrid className="lg:grid-cols-5">
        {ga4Live.status === "ok" ? (
          <>
            <KpiCard
              title="Active Users (Realtime)"
              value={formatNumber(ga4Live.metrics.realtimeActiveUsers)}
              subtitle="GA4 live"
              variant="gold"
            />
            <KpiCard
              title="Sessions 7d"
              value={formatNumber(ga4Live.metrics.sessions7d)}
              subtitle="Google Analytics 4"
              variant="warning"
            />
            <KpiCard
              title="Active Users 7d"
              value={formatNumber(ga4Live.metrics.activeUsers7d)}
              subtitle="Google Analytics 4"
              variant="success"
            />
            <KpiCard
              title="Conversions 7d"
              value={formatNumber(ga4Live.metrics.conversions7d)}
              subtitle="Google Analytics 4"
              variant="success"
            />
            <KpiCard title="Lead Events 7d" value={formatNumber(trackedLeads7d)} subtitle="3 kluczowe eventy" variant="gold" />
          </>
        ) : (
          <>
            <KpiCard title="Leady" value={formatNumber(snapshot.totals.leads)} subtitle="Fallback BUILD 012" variant="gold" />
            <KpiCard title="HOT leady" value={formatNumber(snapshot.totals.hotLeads)} subtitle="Fallback BUILD 012" variant="warning" />
            <KpiCard title="Oferty" value={formatNumber(snapshot.totals.offers)} subtitle="Fallback BUILD 012" variant="success" />
            <KpiCard title="Sprzedaże" value={formatNumber(snapshot.totals.sales)} subtitle="Fallback BUILD 012" variant="success" />
            <KpiCard title="Przychód" value={formatCurrency(snapshot.totals.revenue)} subtitle="Fallback BUILD 012" variant="gold" />
          </>
        )}
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
