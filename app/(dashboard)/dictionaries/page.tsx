import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { DictionariesClient } from "./dictionaries-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DictionariesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Ustawienia / Słowniki"
        description="Zarządzaj zespołem handlowców oraz modelami domów dostępnymi w systemie Adezo OS 2.0."
      />

      <DictionariesClient 
        initialSalespeople={data.salespeople}
        initialModels={data.models}
      />
    </div>
  );
}
