import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ConversionHealthPanel } from "@/components/conversion-audit/conversion-health-panel";
import { ConversionDropAlerts } from "@/components/conversion-audit/conversion-drop-alerts";
import { LeadEventMonitor } from "@/components/conversion-audit/lead-event-monitor";
import { LandingTiranaTracker } from "@/components/conversion-audit/landing-tirana-tracker";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getConversionAuditSnapshot } from "@/lib/conversion-audit";
import { getPreviewDataModeLabel, isPreviewTestModeEnabled } from "@/lib/preview-test-mode";

export const dynamic = "force-dynamic";

export default async function ConversionAuditPage() {
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

  const snapshot = await getConversionAuditSnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Conversion Audit"
        description="BUILD 028: audyt konwersji GA4, Google Ads i landingu Tirana z alertami wycieków lejka."
      />

      {previewTestMode ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2">
          <Badge variant="warning">PREVIEW TEST MODE</Badge>
          <p className="text-sm text-muted-foreground">Data mode: {previewDataMode}</p>
        </div>
      ) : null}

      <ConversionHealthPanel snapshot={snapshot} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionDropAlerts alerts={snapshot.alerts} />
        <LandingTiranaTracker tracker={snapshot.landingTirana} />
      </div>

      <LeadEventMonitor events={snapshot.events} />
    </div>
  );
}
