import { ClipboardCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { OfferPipelineBoard } from "@/components/build016/offer-pipeline-board";
import { FollowupControlEngine } from "@/components/build016/followup-control-engine";
import { OfferAgingTracker } from "@/components/build016/offer-aging-tracker";
import { HighValueOfferAlerts } from "@/components/build016/high-value-offer-alerts";
import { OfferConversionSummary } from "@/components/build016/offer-conversion-summary";
import { OfferNextBestAction } from "@/components/build016/offer-next-best-action";
import { createBuild016Snapshot } from "@/lib/build016";

export const dynamic = "force-dynamic";

export default async function OfferFollowupEnginePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild016Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Offer & Follow-up Engine"
        description="BUILD 016: system decyzji ofertowych — kto dzwoni dziś, która oferta domyka się najszybciej i co poprawia forecast."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <ClipboardCheck className="h-3.5 w-3.5" />
          CONVERSION CONTROL MODE
        </div>
      </PageHeader>

      <OfferPipelineBoard
        inProgressCount={snapshot.pipeline.inProgressCount}
        totalValue={snapshot.pipeline.totalValue}
        nearCloseCount={snapshot.pipeline.nearCloseCount}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FollowupControlEngine offers={snapshot.followupAlerts} />
        <HighValueOfferAlerts offers={snapshot.highValueAlerts} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OfferAgingTracker offers={snapshot.agingRecovery} />
        <OfferNextBestAction actions={snapshot.nextBestActions} forecastImpactNote={snapshot.forecastImpactNote} />
      </div>

      <OfferConversionSummary
        sent={snapshot.conversionSummary.sent}
        won={snapshot.conversionSummary.won}
        lost={snapshot.conversionSummary.lost}
        conversionPct={snapshot.conversionSummary.conversionPct}
        missingOutcomeReason={snapshot.conversionSummary.missingOutcomeReason}
      />
    </div>
  );
}
