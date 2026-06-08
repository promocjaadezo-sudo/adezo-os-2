import { LineChart } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignRevenueAttribution } from "@/components/build019/campaign-revenue-attribution";
import { CampaignRoiBoard } from "@/components/build019/campaign-roi-board";
import { CostPerSaleEngine } from "@/components/build019/cost-per-sale-engine";
import { ModelCampaignPerformance } from "@/components/build019/model-campaign-performance";
import { BudgetShiftRecommendationEngine } from "@/components/build019/budget-shift-recommendation-engine";
import { AgencyAccountabilityPanel } from "@/components/build019/agency-accountability-panel";
import { createBuild019Snapshot } from "@/lib/build019";

export const dynamic = "force-dynamic";

export default async function CampaignRoiEnginePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = await createBuild019Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Campaign ROI Engine"
        description="BUILD 019: panel odpowiedzialności reklam — które kampanie zarabiają, które przepalają budżet i co powiedzieć agencji dziś."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <LineChart className="h-3.5 w-3.5" />
          ACCOUNTABILITY MODE
        </div>
      </PageHeader>

      <Card className="border-gold/30">
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-gold">{snapshot.monthlyPlanImpact}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CampaignRevenueAttribution rows={snapshot.attribution} />
        <CampaignRoiBoard rows={snapshot.roiBoard} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CostPerSaleEngine items={snapshot.costPerSale} />
        <ModelCampaignPerformance items={snapshot.modelPerformance} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BudgetShiftRecommendationEngine items={snapshot.budgetShift} />
        <AgencyAccountabilityPanel items={snapshot.agencyPanel} monthlyPlanImpact={snapshot.monthlyPlanImpact} />
      </div>
    </div>
  );
}
