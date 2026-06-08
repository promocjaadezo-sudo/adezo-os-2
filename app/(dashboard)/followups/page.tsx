import { CalendarClock, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData, getOpenFollowups, getOverdueFollowups } from "@/lib/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { PriorityBadge, StatusBadge } from "@/components/data/status-badge";
import type { Followup } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);

  const open = getOpenFollowups(data.followups);
  const overdue = getOverdueFollowups(data.followups);
  const done = data.followups.filter((f) => f.status === "done");
  const critical = open.filter((f) => f.priority === "critical");
  const totalValue = open.reduce((sum, f) => sum + f.value_snapshot, 0);

  const columns = [
    {
      key: "client",
      header: "Klient",
      cell: (f: Followup) => (
        <div>
          <p className="font-medium">
            {f.leads?.client_name ?? f.client_name ?? "—"}
          </p>
          {(f.leads?.city ?? f.city) && (
            <p className="text-xs text-muted-foreground">
              {f.leads?.city ?? f.city}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "salesperson",
      header: "Handlowca",
      cell: (f: Followup) =>
        f.salespeople?.name ?? f.salesperson_name ?? "—",
    },
    {
      key: "due",
      header: "Termin",
      cell: (f: Followup) => formatDate(f.due_date),
    },
    {
      key: "priority",
      header: "Priorytet",
      cell: (f: Followup) => <PriorityBadge priority={f.priority} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (f: Followup) => <StatusBadge status={f.status} />,
    },
    {
      key: "value",
      header: "Wartość",
      cell: (f: Followup) => formatCurrency(f.value_snapshot),
      className: "text-right font-medium",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Followupy"
        description="Zaplanowane działania i zadania kontaktowe."
      />

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Otwarte zadania"
          value={formatNumber(open.length)}
          icon={CalendarClock}
          variant="gold"
        />
        <KpiCard
          title="Zaległe"
          value={formatNumber(overdue.length)}
          icon={AlertTriangle}
          variant={overdue.length > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="Krytyczne"
          value={formatNumber(critical.length)}
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          title="Zrealizowane"
          value={formatNumber(done.length)}
          icon={CheckCircle}
          variant="success"
        />
      </KpiGrid>

      <KpiCard
        title="Otwarte oferty zagrożone"
        value={formatCurrency(totalValue)}
        subtitle={`${open.length} oczekujących zadań`}
        variant="warning"
        className="max-w-sm"
      />

      <DataTable
        title="Wszystkie followupy"
        columns={columns}
        data={data.followups}
        emptyMessage="Brak zaplanowanych followupów"
      />
    </div>
  );
}
