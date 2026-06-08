import { PhoneCall } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { MagdaDailyTaskBoard } from "@/components/build014/magda-daily-task-board";
import { NextBestActionEngine } from "@/components/build014/next-best-action-engine";
import { FollowupPriorityEngine } from "@/components/build014/followup-priority-engine";
import { OfferDeadlineTracker } from "@/components/build014/offer-deadline-tracker";
import { LeadRecoveryEngine } from "@/components/build014/lead-recovery-engine";
import { SalesActivitySummary } from "@/components/build014/sales-activity-summary";
import { createBuild014Snapshot } from "@/lib/build014";

export const dynamic = "force-dynamic";

export default async function MagdaActionEnginePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild014Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Magda Action Engine"
        description="BUILD 014: dzienna lista decyzji — kto dzwoni, do kogo, dlaczego teraz i jaki status kliknąć po wykonaniu."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <PhoneCall className="h-3.5 w-3.5" />
          DAILY DECISION MODE
        </div>
      </PageHeader>

      <NextBestActionEngine tasks={snapshot.dailyTasks} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MagdaDailyTaskBoard tasks={snapshot.dailyTasks} />
        <FollowupPriorityEngine tasks={snapshot.followupTasks} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OfferDeadlineTracker leads={snapshot.leads} />
        <LeadRecoveryEngine tasks={snapshot.recoveryTasks} />
      </div>

      <SalesActivitySummary activity={snapshot.activitySummary} overdueOwners={snapshot.overdueOwners} />
    </div>
  );
}
