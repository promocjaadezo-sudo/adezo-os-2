import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TiranaLandingHealthPanel } from "@/components/tirana-performance/tirana-landing-health-panel";
import { TiranaFunnelBoard } from "@/components/tirana-performance/tirana-funnel-board";
import { TiranaBudgetImpact } from "@/components/tirana-performance/tirana-budget-impact";
import { TiranaLeadQualityPanel } from "@/components/tirana-performance/tirana-lead-quality-panel";
import { TiranaNextDecisionBox } from "@/components/tirana-performance/tirana-next-decision-box";
import { createClient } from "@/lib/supabase/server";
import { getLandingTiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export const dynamic = "force-dynamic";

export default async function LandingTiranaPerformancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = await getLandingTiranaPerformanceSnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Tirana Performance"
        description="BUILD 029: monitor skuteczności modelu Tirana od ruchu, przez leady i oferty, aż po sprzedaż."
      />

      <TiranaLandingHealthPanel snapshot={snapshot} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TiranaFunnelBoard snapshot={snapshot} />
        <TiranaLeadQualityPanel snapshot={snapshot} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TiranaBudgetImpact snapshot={snapshot} />
        <TiranaNextDecisionBox snapshot={snapshot} />
      </div>
    </div>
  );
}
