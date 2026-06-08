import { Handshake } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralSourceBoardModule } from "@/components/build018/referral-source-board";
import { ArchitectPartnerPipeline } from "@/components/build018/architect-partner-pipeline";
import { ClientRecommendationTracker } from "@/components/build018/client-recommendation-tracker";
import { PartnerLeadQualityEngine } from "@/components/build018/partner-lead-quality-engine";
import { ReferralFollowupQueue } from "@/components/build018/referral-followup-queue";
import { ReferralRevenueSummaryModule } from "@/components/build018/referral-revenue-summary";
import { createBuild018Snapshot } from "@/lib/build018";

export const dynamic = "force-dynamic";

export default async function ReferralArchitectEnginePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild018Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Referral & Architect Engine"
        description="BUILD 018: system decyzji kanału partnerskiego — kto da kolejne leady premium, z kim kontakt dziś i jak rośnie sprzedaż bez paid ads."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Handshake className="h-3.5 w-3.5" />
          PARTNER GROWTH MODE
        </div>
      </PageHeader>

      <Card className="border-gold/30">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <p className="text-sm text-gold">{snapshot.decisionSummary}</p>
          <div className="flex flex-wrap gap-2">
            {snapshot.ceoAlerts.map((alert) => (
              <Badge key={alert} variant="danger">{alert}</Badge>
            ))}
            {snapshot.ceoAlerts.length === 0 && <Badge variant="success">Brak krytycznych alertów partnerskich.</Badge>}
          </div>
        </CardContent>
      </Card>

      <ReferralSourceBoardModule board={snapshot.sourceBoard} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ArchitectPartnerPipeline items={snapshot.architectPipeline} />
        <PartnerLeadQualityEngine items={snapshot.partnerLeadQuality} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ClientRecommendationTracker items={snapshot.clientRecommendationTracker} />
        <ReferralFollowupQueue tasks={snapshot.followupQueue} />
      </div>

      <ReferralRevenueSummaryModule summary={snapshot.revenueSummary} />
    </div>
  );
}
