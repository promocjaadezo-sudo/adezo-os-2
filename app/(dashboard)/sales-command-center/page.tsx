import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData, computeCeoScore } from "@/lib/data";
import { createBuild009Snapshot } from "@/lib/build009";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SalesCommandCenter } from "@/components/build009/sales-command-center";
import { OwnerAlerts } from "@/components/build009/owner-alerts";

export const dynamic = "force-dynamic";

export default async function SalesCommandCenterBuild009Page() {
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
        title="Centrum Sprzedaży"
        description="BUILD 009: dzienny pulpit operacyjny sprzedaży z priorytetami i zadaniami dla Magd."
      >
        <Link href="/ceo-dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Pulpit CEO
          </Button>
        </Link>
      </PageHeader>

      <SalesCommandCenter
        dailyOpenFollowups={snapshot.dailyOpenFollowups}
        dailyOverdueFollowups={snapshot.dailyOverdueFollowups}
        dailyNewLeads={snapshot.dailyNewLeads}
        dailyActiveOffers={snapshot.dailyActiveOffers}
        tasksForMagdas={snapshot.tasksForMagdas}
        dailyTrend={snapshot.dailyTrend}
      />

      <OwnerAlerts alerts={snapshot.ownerAlerts} />
    </div>
  );
}
