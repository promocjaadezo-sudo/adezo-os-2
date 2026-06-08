import { UserCheck, Target, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SalespersonPerformance } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function SalespeoplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  const activeCount = data.salespeople.filter((s) => s.is_active).length;
  const totalClosed = data.salespersonPerformance.reduce(
    (sum, sp) => sum + sp.closed_sales,
    0
  );
  const totalGoal = data.salespersonPerformance.reduce(
    (sum, sp) => sum + sp.monthly_revenue_goal,
    0
  );
  const goalProgress = totalGoal > 0 ? (totalClosed / totalGoal) * 100 : 0;

  const columns = [
    {
      key: "name",
      header: "Handlowca",
      cell: (sp: SalespersonPerformance) => (
        <span className="font-medium">{sp.name}</span>
      ),
    },
    {
      key: "leads",
      header: "Leady",
      cell: (sp: SalespersonPerformance) => formatNumber(sp.leads_count),
      className: "text-center",
    },
    {
      key: "offers",
      header: "Oferty",
      cell: (sp: SalespersonPerformance) => formatNumber(sp.offers_count),
      className: "text-center",
    },
    {
      key: "closed",
      header: "Zamknięte",
      cell: (sp: SalespersonPerformance) => formatCurrency(sp.closed_sales),
      className: "text-right",
    },
    {
      key: "pipeline",
      header: "Ważone",
      cell: (sp: SalespersonPerformance) =>
        formatCurrency(sp.weighted_pipeline),
      className: "text-right",
    },
    {
      key: "goal",
      header: "Cel",
      cell: (sp: SalespersonPerformance) => {
        const pct =
          sp.monthly_revenue_goal > 0
            ? (sp.closed_sales / sp.monthly_revenue_goal) * 100
            : 0;
        return (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex justify-between text-xs">
              <span>{formatPercent(pct, 0)}</span>
              <span className="text-muted-foreground">
                {formatCurrency(sp.monthly_revenue_goal)}
              </span>
            </div>
            <Progress value={Math.min(pct, 100)} />
          </div>
        );
      },
    },
    {
      key: "dead",
      header: "Martwe",
      cell: (sp: SalespersonPerformance) =>
        sp.dead_leads > 0 ? (
          <Badge variant="danger">{sp.dead_leads}</Badge>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
      className: "text-center",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Handlowcy"
        description="Wydajność zespołu i monitorowanie realizacji celów."
      />

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Aktywny zespół"
          value={formatNumber(activeCount)}
          icon={UserCheck}
          variant="gold"
        />
        <KpiCard
          title="Suma zamkniętych"
          value={formatCurrency(totalClosed)}
          icon={TrendingUp}
          variant="success"
        />
        <KpiCard
          title="Miesięczny cel"
          value={formatCurrency(totalGoal)}
          icon={Target}
        />
        <KpiCard
          title="Postęp celu"
          value={formatPercent(goalProgress, 0)}
          icon={Target}
          variant={goalProgress >= 100 ? "success" : "warning"}
        />
      </KpiGrid>

      <PerformanceBarChart data={data.salespersonPerformance} />

      <DataTable
        title="Szczegóły wyników"
        columns={columns}
        data={data.salespersonPerformance}
        emptyMessage="Brak danych handlowców"
      />
    </div>
  );
}
