import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { ImportClient } from "./import-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Import CSV / Excel"
        description="Masowy import bazy leadów z plików zewnętrznych do bazy produkcyjnej Supabase."
      />

      <ImportClient 
        salespeople={data.salespeople}
      />
    </div>
  );
}
