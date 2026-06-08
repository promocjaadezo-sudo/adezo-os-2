import { Skull, DollarSign, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData, getDeadLeads } from "@/lib/data";
import { formatCurrency, formatDate, formatNumber, daysAgo } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { TemperatureBadge } from "@/components/data/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeadLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);
  const deadLeads = getDeadLeads(data.leads, data.offers);

  const totalBudget = deadLeads.reduce((sum, l) => sum + Number(l.budget || 0), 0);
  const avgAge =
    deadLeads.length > 0
      ? deadLeads.reduce((sum, l) => sum + daysAgo(l.created_at || new Date().toISOString()), 0) /
        deadLeads.length
      : 0;
  const withBudget = deadLeads.filter((l) => Number(l.budget || 0) > 0).length;

  const columns = [
    {
      key: "client",
      header: "Klient",
      cell: (l: Lead) => (
        <div>
          <p className="font-medium">{l.client_name}</p>
          {l.phone && (
            <p className="text-xs text-muted-foreground">{l.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "city",
      header: "Lokalizacja",
      cell: (l: Lead) => l.city ?? "—",
    },
    {
      key: "model",
      header: "Model",
      cell: (l: Lead) => l.models?.name ?? l.model_name_raw ?? "—",
    },
    {
      key: "salesperson",
      header: "Handlowca",
      cell: (l: Lead) => l.salespeople?.name ?? "—",
    },
    {
      key: "temp",
      header: "Temp.",
      cell: (l: Lead) => <TemperatureBadge temperature={l.temperature} />,
    },
    {
      key: "budget",
      header: "Budżet",
      cell: (l: Lead) => formatCurrency(l.budget),
      className: "text-right",
    },
    {
      key: "age",
      header: "Wiek",
      cell: (l: Lead) => (
        <Badge variant="danger">{daysAgo(l.created_at)}d</Badge>
      ),
      className: "text-center",
    },
    {
      key: "created",
      header: "Utworzono",
      cell: (l: Lead) => formatDate(l.created_at),
      className: "text-right text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Martwe Leady"
        description="Nieaktywne szanse bez oferty po ponad 14 dniach."
      />

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Martwe leady"
          value={formatNumber(deadLeads.length)}
          icon={Skull}
          variant="danger"
        />
        <KpiCard
          title="Utracony budżet"
          value={formatCurrency(totalBudget)}
          icon={DollarSign}
          variant="warning"
        />
        <KpiCard
          title="Średni wiek"
          value={`${Math.round(avgAge)} dni`}
          icon={Calendar}
        />
        <KpiCard
          title="Z budżetem"
          value={formatNumber(withBudget)}
          subtitle="Leady ze zdeklarowanym budżetem"
          icon={MapPin}
        />
      </KpiGrid>

      <DataTable
        title="Rejestr martwych leadów"
        columns={columns}
        data={deadLeads}
        emptyMessage="Brak martwych leadów — lejek jest zdrowy"
      />
    </div>
  );
}
