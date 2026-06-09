import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
  ErrorMonitor,
  IntegrationHealthPanel,
  LastSyncMonitor,
  ProviderStatusDashboard,
  SyncStatusCenter,
} from "@/components/integrations/integration-health-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getIntegrationHealthSnapshot } from "@/lib/integrations-health";

export const dynamic = "force-dynamic";

export default async function IntegrationsHealthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = await getIntegrationHealthSnapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Integrations Health"
        description="BUILD 026A: panel zdrowia integracji i statusów synchronizacji dla CEO."
      />

      <IntegrationHealthPanel activeProvider={snapshot.activeProvider} totalRecords={snapshot.totalRecords} />
      <SyncStatusCenter items={snapshot.items} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LastSyncMonitor items={snapshot.items} globalLastSyncAt={snapshot.lastSyncAt} />
        <ErrorMonitor items={snapshot.items} />
      </div>

      <ProviderStatusDashboard items={snapshot.items} />
    </div>
  );
}
