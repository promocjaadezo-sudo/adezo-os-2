import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataDisciplineGatekeeper } from "@/components/build014a/data-discipline-gatekeeper";
import { CriticalFieldsChecklist } from "@/components/build014a/critical-fields-checklist";
import { IncompleteLeadAlerts } from "@/components/build014a/incomplete-lead-alerts";
import { CommissionReadinessStatus } from "@/components/build014a/commission-readiness-status";
import { BriefReadinessStatus } from "@/components/build014a/brief-readiness-status";
import { DataQualityScore } from "@/components/build014a/data-quality-score";
import { createBuild014ASnapshot } from "@/lib/build014a";

export const dynamic = "force-dynamic";

export default async function DataDisciplinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild014ASnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Data Discipline"
        description="BUILD 014A: uzupełnij dane, żeby system mógł policzyć premię, forecast i pełny Daily Brief."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <ShieldAlert className="h-3.5 w-3.5" />
          DATA QUALITY FIRST
        </div>
      </PageHeader>

      <DataDisciplineGatekeeper complete={snapshot.totals.complete} incomplete={snapshot.totals.incomplete} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CriticalFieldsChecklist />
        <DataQualityScore byOwner={snapshot.byOwner} missingFieldStats={snapshot.missingFieldStats} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CommissionReadinessStatus
          ready={snapshot.commissionReadiness.ready}
          blockedLeads={snapshot.commissionReadiness.blockedLeads}
        />
        <BriefReadinessStatus
          ready={snapshot.briefReadiness.ready}
          blockedOwners={snapshot.briefReadiness.blockedOwners}
        />
      </div>

      <IncompleteLeadAlerts leads={snapshot.leads} />
    </div>
  );
}
