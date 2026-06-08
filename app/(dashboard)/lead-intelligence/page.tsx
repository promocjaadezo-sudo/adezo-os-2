import { BrainCircuit } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { LeadScoringEngine } from "@/components/build013/lead-scoring-engine";
import { LeadTemperatureBoard } from "@/components/build013/lead-temperature-board";
import { BuyingSignalDetector } from "@/components/build013/buying-signal-detector";
import { ModelInterestAttribution } from "@/components/build013/model-interest-attribution";
import { LeadQualityBreakdown } from "@/components/build013/lead-quality-breakdown";
import { NextBestLeadQueue } from "@/components/build013/next-best-lead-queue";
import { createBuild013Snapshot } from "@/lib/build013";

export const dynamic = "force-dynamic";

export default async function LeadIntelligencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild013Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Lead Intelligence"
        description="BUILD 013: scoring jakości leadów, sygnały zakupowe i kolejka najlepszych kontaktów."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <BrainCircuit className="h-3.5 w-3.5" />
          INTELLIGENCE MODE
        </div>
      </PageHeader>

      <LeadScoringEngine
        totalLeads={snapshot.totals.totalLeads}
        hotLeads={snapshot.totals.hotLeads}
        warmLeads={snapshot.totals.warmLeads}
        coldLeads={snapshot.totals.coldLeads}
        avgScore={snapshot.totals.avgScore}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LeadTemperatureBoard leads={snapshot.leads} />
        <NextBestLeadQueue leads={snapshot.nextBestQueue} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BuyingSignalDetector signals={snapshot.signalSummary} />
        <ModelInterestAttribution data={snapshot.modelAttribution} />
      </div>

      <LeadQualityBreakdown campaigns={snapshot.qualityByCampaign} />
    </div>
  );
}
