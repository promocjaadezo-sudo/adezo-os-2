import { Crown } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { ForecastEngine } from "@/components/build010/forecast-engine";
import { RevenuePipeline } from "@/components/build010/revenue-pipeline";
import { WinRateEngine } from "@/components/build010/win-rate-engine";
import { LostDealAnalyzer } from "@/components/build010/lost-deal-analyzer";
import { OwnerCockpitAlerts } from "@/components/build010/owner-cockpit-alerts";
import { PlanVsExecution } from "@/components/build010/plan-vs-execution";
import { createBuild010Snapshot } from "@/lib/build010";
import { formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OwnerCockpitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild010Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Owner Cockpit"
        description="BUILD 010: Revenue Operating System — forecast, plan vs wykonanie, skuteczność i analiza utraconych sprzedaży."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Crown className="h-3.5 w-3.5" />
          BUILD 010
        </div>
      </PageHeader>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Forecast miesiąca"
          value={formatPercent(snapshot.monthForecast.executionPct, 1)}
          subtitle="Poziom realizacji planu miesięcznego"
          variant="gold"
        />
        <KpiCard
          title="Forecast kwartału"
          value={formatPercent(snapshot.quarterForecast.executionPct, 1)}
          subtitle="Poziom realizacji planu kwartalnego"
          variant="warning"
        />
        <KpiCard
          title="Skuteczność sprzedaży"
          value={formatPercent(snapshot.winRate.salesEffectivenessPct, 1)}
          subtitle="Win rate + realizacja planu"
          variant="success"
        />
        <KpiCard
          title="Alarmy"
          value={String(snapshot.alarms.length)}
          subtitle="Sygnały ryzyka Revenue OS"
          variant={snapshot.alarms.length > 0 ? "danger" : "gold"}
        />
      </KpiGrid>

      <ForecastEngine month={snapshot.monthForecast} quarter={snapshot.quarterForecast} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenuePipeline stages={snapshot.revenuePipeline} />
        <PlanVsExecution data={snapshot.planVsExecution} />
      </div>

      <WinRateEngine snapshot={snapshot.winRate} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LostDealAnalyzer reasons={snapshot.lostDealReasons} />
        <OwnerCockpitAlerts alarms={snapshot.alarms} />
      </div>
    </div>
  );
}
