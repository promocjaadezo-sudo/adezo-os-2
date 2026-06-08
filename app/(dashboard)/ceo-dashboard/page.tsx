import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData, computeCeoScore } from "@/lib/data";
import { createBuild009Snapshot } from "@/lib/build009";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { OwnerAlerts } from "@/components/build009/owner-alerts";
import { MonthlyForecast } from "@/components/build009/monthly-forecast";
import { LeadPriorityBoard } from "@/components/build009/lead-priority-board";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CeoDashboardBuild009Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);
  const ceoScore = computeCeoScore(data.kpi, data.moneyLeak);
  const snapshot = createBuild009Snapshot(data, ceoScore);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="CEO Dashboard"
        description="BUILD 009: Owner view z priorytetami sprzedaży, alertami ryzyk i operacyjnym boardem leadów."
      >
        <Link href="/sales-command-center">
          <Button variant="gold" size="sm">
            Sales Command Center
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <KpiGrid className="lg:grid-cols-3">
        <KpiCard
          title="CEO Score Engine"
          value={`${snapshot.ceoScore}/100`}
          subtitle="Zintegrowane z BUILD 008"
          variant="gold"
        />
        <KpiCard
          title="HOT leady"
          value={formatNumber(snapshot.hotLeads.length)}
          subtitle="Najwyższy priorytet ownera"
          variant="warning"
        />
        <KpiCard
          title="Ryzyka operacyjne"
          value={formatNumber(snapshot.ownerAlerts.length)}
          subtitle="Owner Alerts aktywne"
          variant="danger"
        />
      </KpiGrid>

      <MonthlyForecast
        monthlyGoal={snapshot.monthlyGoal}
        closedSales={snapshot.closedSales}
        weightedPipeline={snapshot.weightedPipeline}
        projectedRevenue={snapshot.projectedRevenue}
        forecastGap={snapshot.forecastGap}
        forecastAchievementPct={snapshot.forecastAchievementPct}
      />

      <OwnerAlerts alerts={snapshot.ownerAlerts} />

      <LeadPriorityBoard
        hotLeads={snapshot.hotLeads}
        leadsWithoutContact={snapshot.leadsWithoutContact}
        offersWithoutFollowup={snapshot.offersWithoutFollowup}
      />
    </div>
  );
}
