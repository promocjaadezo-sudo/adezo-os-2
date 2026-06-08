import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { OffersClient } from "./offers-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Oferty"
        description="Aktywne oferty i postęp transakcji."
      />

      <OffersClient 
        initialOffers={data.offers}
        leads={data.leads}
        models={data.models}
        salespeople={data.salespeople}
      />
    </div>
  );
}
