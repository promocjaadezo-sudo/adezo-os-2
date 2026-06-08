import { Home, Layers, Percent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import type { Model } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  const activeModels = data.models.filter((m) => m.is_active);
  const categories = new Set(
    data.models.map((m) => m.category).filter(Boolean)
  );

  const modelStats = data.models.map((model) => {
    const leads = data.leads.filter((l) => l.model_id === model.id);
    const offers = data.offers.filter((o) => o.model_id === model.id);
  const closedOffers = offers.filter((o) =>
    o.status.toLowerCase().includes("wygr")
  );
    return { model, leads: leads.length, offers: offers.length, closed: closedOffers.length };
  });

  const columns = [
    {
      key: "name",
      header: "Model",
      cell: (row: { model: Model; leads: number; offers: number; closed: number }) => (
        <span className="font-medium">{row.model.name}</span>
      ),
    },
    {
      key: "category",
      header: "Kategoria",
      cell: (row: { model: Model }) =>
        row.model.category ? (
          <Badge variant="gold">{row.model.category}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "margin",
      header: "Docelowa marża",
      cell: (row: { model: Model }) =>
        row.model.target_margin_pct
          ? formatPercent(row.model.target_margin_pct, 1)
          : "—",
      className: "text-center",
    },
    {
      key: "leads",
      header: "Leady",
      cell: (row: { leads: number }) => formatNumber(row.leads),
      className: "text-center",
    },
    {
      key: "offers",
      header: "Oferty",
      cell: (row: { offers: number }) => formatNumber(row.offers),
      className: "text-center",
    },
    {
      key: "closed",
      header: "Zamknięte",
      cell: (row: { closed: number }) => formatNumber(row.closed),
      className: "text-center",
    },
    {
      key: "status",
      header: "Status",
      cell: (row: { model: Model }) =>
        row.model.is_active ? (
          <Badge variant="success">Aktywny</Badge>
        ) : (
          <Badge variant="secondary">Nieaktywny</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Modele"
        description="Katalog produktów i wydajność poszczególnych modeli."
      />

      <KpiGrid className="lg:grid-cols-3">
        <KpiCard
          title="Wszystkie modele"
          value={formatNumber(data.models.length)}
          icon={Home}
          variant="gold"
        />
        <KpiCard
          title="Aktywne"
          value={formatNumber(activeModels.length)}
          icon={Layers}
          variant="success"
        />
        <KpiCard
          title="Kategorie"
          value={formatNumber(categories.size)}
          icon={Percent}
        />
      </KpiGrid>

      <DataTable
        title="Katalog modeli"
        columns={columns}
        data={modelStats}
        emptyMessage="Brak skonfigurowanych modeli"
      />
    </div>
  );
}
