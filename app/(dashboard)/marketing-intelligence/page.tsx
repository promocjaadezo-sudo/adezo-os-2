import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { MarketingIntelligenceClient } from "./marketing-intelligence-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketingIntelligencePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  // Pobierz dane z tabeli marketing w celach referencji historycznych
  const marketingRecords = data.marketing || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Marketing Intelligence"
        description="Monitorowanie efektywności kampanii, źródeł wizyt i kosztów pozyskania klienta (CPL/ROAS) z Google Analytics 4, Google Ads oraz Meta Ads."
      />

      <MarketingIntelligenceClient 
        marketingData={marketingRecords}
      />
    </div>
  );
}
