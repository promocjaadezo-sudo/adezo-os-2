import { SearchX } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LostDealReasonTracker } from "@/components/build017/lost-deal-reason-tracker";
import { ObjectionPatternAnalyzer } from "@/components/build017/objection-pattern-analyzer";
import { CompetitorLossBoard } from "@/components/build017/competitor-loss-board";
import { PriceResistanceMonitor } from "@/components/build017/price-resistance-monitor";
import { SalesScriptRecommendationEngine } from "@/components/build017/sales-script-recommendation-engine";
import { RecoveryOpportunityQueue } from "@/components/build017/recovery-opportunity-queue";
import { createBuild017Snapshot } from "@/lib/build017";

export const dynamic = "force-dynamic";

export default async function LostDealAnalyzerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild017Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Lost Deal Analyzer"
        description="BUILD 017: system decyzji po przegranej ofercie — dlaczego przegrywamy, co zmienić w rozmowie i które leady odzyskać."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <SearchX className="h-3.5 w-3.5" />
          LOSS TO WIN MODE
        </div>
      </PageHeader>

      <Card className="border-gold/30">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <p className="text-sm text-gold">{snapshot.executiveSummary}</p>
          <div className="flex flex-wrap gap-2">
            {snapshot.ceoAlerts.map((alert) => (
              <Badge key={alert} variant="danger">{alert}</Badge>
            ))}
            {snapshot.salesAlerts.map((alert) => (
              <Badge key={alert} variant="warning">{alert}</Badge>
            ))}
            {snapshot.operationsAlerts.map((alert) => (
              <Badge key={alert} variant="gold">{alert}</Badge>
            ))}
            {snapshot.ceoAlerts.length + snapshot.salesAlerts.length + snapshot.operationsAlerts.length === 0 && (
              <Badge variant="success">Brak alertów progowych — utrzymuj obecną jakość procesu.</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <LostDealReasonTracker
        reasonStats={snapshot.reasonStats}
        dataIncompleteCount={snapshot.dataIncompleteCount}
        ceoAlerts={snapshot.ceoAlerts}
        salesAlerts={snapshot.salesAlerts}
        operationsAlerts={snapshot.operationsAlerts}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ObjectionPatternAnalyzer patterns={snapshot.objectionPatterns} />
        <CompetitorLossBoard board={snapshot.competitorBoard} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PriceResistanceMonitor models={snapshot.priceResistance} />
        <SalesScriptRecommendationEngine recommendations={snapshot.scriptRecommendations} />
      </div>

      <RecoveryOpportunityQueue queue={snapshot.recoveryQueue} />
    </div>
  );
}
