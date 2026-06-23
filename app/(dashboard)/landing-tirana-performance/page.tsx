import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TiranaLandingHealthPanel } from "@/components/tirana-performance/tirana-landing-health-panel";
import { TiranaFunnelBoard } from "@/components/tirana-performance/tirana-funnel-board";
import { TiranaBudgetImpact } from "@/components/tirana-performance/tirana-budget-impact";
import { TiranaLeadQualityPanel } from "@/components/tirana-performance/tirana-lead-quality-panel";
import { TiranaNextDecisionBox } from "@/components/tirana-performance/tirana-next-decision-box";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getLandingTiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";
import { getPreviewDataModeLabel, isPreviewTestModeEnabled } from "@/lib/preview-test-mode";

export const dynamic = "force-dynamic";

export default async function LandingTiranaPerformancePage() {
  const previewTestMode = isPreviewTestModeEnabled();
  const previewDataMode = getPreviewDataModeLabel();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (!previewTestMode && user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = await getLandingTiranaPerformanceSnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Tirana Performance"
        description="BUILD 029: monitor skuteczności modelu Tirana od ruchu, przez leady i oferty, aż po sprzedaż."
      />

      {previewTestMode ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2">
          <Badge variant="warning">PREVIEW TEST MODE</Badge>
          <p className="text-sm text-muted-foreground">Data mode: {previewDataMode}</p>
        </div>
      ) : null}

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
