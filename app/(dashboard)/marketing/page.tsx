import { Megaphone, MousePointer, Eye, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { MarketingChart } from "@/components/charts/marketing-chart";
import { Badge } from "@/components/ui/badge";
import type { Marketing } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  const totalCost = data.marketing.reduce((sum, m) => sum + m.cost, 0);
  const totalLeads = data.marketing.reduce((sum, m) => sum + m.leads_count, 0);
  const totalClicks = data.marketing.reduce((sum, m) => sum + m.clicks, 0);
  const totalImpressions = data.marketing.reduce(
    (sum, m) => sum + m.impressions,
    0
  );
  const cpl = totalLeads > 0 ? totalCost / totalLeads : 0;
  const ctr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const columns = [
    {
      key: "date",
      header: "Data",
      cell: (m: Marketing) => formatDate(m.date),
    },
    {
      key: "source",
      header: "Źródło",
      cell: (m: Marketing) => (
        <Badge variant="gold">{m.source}</Badge>
      ),
    },
    {
      key: "campaign",
      header: "Kampania",
      cell: (m: Marketing) => m.campaign ?? "—",
    },
    {
      key: "cost",
      header: "Koszt",
      cell: (m: Marketing) => formatCurrency(m.cost),
      className: "text-right",
    },
    {
      key: "clicks",
      header: "Kliknięcia",
      cell: (m: Marketing) => formatNumber(m.clicks),
      className: "text-center",
    },
    {
      key: "impressions",
      header: "Wyświetlenia",
      cell: (m: Marketing) => formatNumber(m.impressions),
      className: "text-center",
    },
    {
      key: "leads",
      header: "Leady",
      cell: (m: Marketing) => formatNumber(m.leads_count),
      className: "text-center font-medium",
    },
    {
      key: "cpl",
      header: "Koszt leada (CPL)",
      cell: (m: Marketing) =>
        m.leads_count > 0
          ? formatCurrency(m.cost / m.leads_count)
          : "—",
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Marketing"
        description="Wydajność kampanii i ROI pozyskiwania nowych leadów."
      />

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Całkowite wydatki"
          value={formatCurrency(totalCost)}
          icon={Megaphone}
          variant="gold"
        />
        <KpiCard
          title="Pozyskane leady"
          value={formatNumber(totalLeads)}
          icon={Users}
          variant="success"
        />
        <KpiCard
          title="Koszt za leada"
          value={formatCurrency(cpl)}
          icon={MousePointer}
        />
        <KpiCard
          title="CTR"
          value={`${ctr.toFixed(2)}%`}
          subtitle={`${formatNumber(totalClicks)} kliknięć / ${formatNumber(totalImpressions)} wyświetleń`}
          icon={Eye}
        />
      </KpiGrid>

      <MarketingChart data={data.marketing} />

      <DataTable
        title="Historia kampanii"
        columns={columns}
        data={data.marketing}
        emptyMessage="Brak danych marketingowych"
      />
    </div>
  );
}
