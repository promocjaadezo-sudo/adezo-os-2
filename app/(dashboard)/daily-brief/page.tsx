import { Brain } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DailyRevenueBrief } from "@/components/build011/daily-revenue-brief";
import { AiAnalysisPanel } from "@/components/build011/ai-analysis-panel";
import { MagdaActionBoard } from "@/components/build011/magda-action-board";
import { MarketingRecommendations } from "@/components/build011/marketing-recommendations";
import { CeoAlertCenter } from "@/components/build011/ceo-alert-center";
import { createDailyRevenueBriefSnapshot } from "@/lib/daily-brief";

export const dynamic = "force-dynamic";

export default async function DailyBriefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createDailyRevenueBriefSnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Daily Revenue Brief"
        description="Poranny briefing CEO: czy dowieziemy plan, dlaczego nie, co robimy dzisiaj i kto dowozi wynik."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Brain className="h-3.5 w-3.5" />
          ACTION-FIRST MODE
        </div>
      </PageHeader>

      <DailyRevenueBrief snapshot={snapshot} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AiAnalysisPanel summary={snapshot.aiAnalysisSummary} actions={snapshot.aiTopMoves} />
        <CeoAlertCenter alerts={snapshot.ceoAlerts} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MagdaActionBoard actions={snapshot.magdaActionBoard} />
        <MarketingRecommendations recommendations={snapshot.marketingRecommendations} />
      </div>
    </div>
  );
}
