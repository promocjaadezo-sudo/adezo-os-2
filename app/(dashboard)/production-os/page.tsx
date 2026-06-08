import { Factory } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CeoProductionView } from "@/components/build011/ceo-production-view";
import { ProductionQueue } from "@/components/build011/production-queue";
import { OrderHandoff } from "@/components/build011/order-handoff";
import { ProductionRiskEngine } from "@/components/build011/production-risk-engine";
import { createBuild011Snapshot } from "@/lib/build011";

export const dynamic = "force-dynamic";

export default async function ProductionOsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = createBuild011Snapshot();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Production OS"
        description="BUILD 011: Production Queue, Order Handoff, Risk Engine i CEO Production View."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Factory className="h-3.5 w-3.5" />
          BUILD 011
        </div>
      </PageHeader>

      <CeoProductionView snapshot={snapshot} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProductionRiskEngine risks={snapshot.risks} />
        <OrderHandoff items={snapshot.handoffItems} />
      </div>

      <ProductionQueue orders={snapshot.productionQueue} />
    </div>
  );
}
