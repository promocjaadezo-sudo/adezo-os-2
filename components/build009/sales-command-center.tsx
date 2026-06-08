import { ClipboardList, CalendarClock, Flame, TriangleAlert } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { DataTable } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { DailySalesTrendChart } from "@/components/build009/daily-sales-trend-chart";
import { formatDate, formatNumber } from "@/lib/format";
import type { Followup, Lead, Offer } from "@/lib/types";
import type { DailyTrendPoint, MagdaTask } from "@/lib/build009";

interface SalesCommandCenterProps {
  dailyOpenFollowups: Followup[];
  dailyOverdueFollowups: Followup[];
  dailyNewLeads: Lead[];
  dailyActiveOffers: Offer[];
  tasksForMagdas: MagdaTask[];
  dailyTrend: DailyTrendPoint[];
}

export function SalesCommandCenter({
  dailyOpenFollowups,
  dailyOverdueFollowups,
  dailyNewLeads,
  dailyActiveOffers,
  tasksForMagdas,
  dailyTrend,
}: SalesCommandCenterProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl">Sales Command Center</h2>

      <KpiGrid className="lg:grid-cols-5">
        <KpiCard
          title="Dzisiaj: otwarte follow-upy"
          value={formatNumber(dailyOpenFollowups.length)}
          icon={CalendarClock}
          variant="warning"
        />
        <KpiCard
          title="Dzisiaj: nowe leady"
          value={formatNumber(dailyNewLeads.length)}
          icon={Flame}
          variant="gold"
        />
        <KpiCard
          title="Dzisiaj: aktywne oferty"
          value={formatNumber(dailyActiveOffers.length)}
          icon={ClipboardList}
          variant="success"
        />
        <KpiCard
          title="Przeterminowane zadania"
          value={formatNumber(dailyOverdueFollowups.length)}
          icon={TriangleAlert}
          variant={dailyOverdueFollowups.length > 0 ? "danger" : "success"}
        />
        <KpiCard
          title="Zadania dla Magd"
          value={formatNumber(tasksForMagdas.length)}
          icon={CalendarClock}
          variant="gold"
        />
      </KpiGrid>

      <DataTable
        title="Widok dzienny sprzedaży — zadania dla Magd"
        columns={[
          {
            key: "owner",
            header: "Właściciel",
            cell: (task: MagdaTask) => task.owner,
          },
          {
            key: "client",
            header: "Klient",
            cell: (task: MagdaTask) => task.client_name,
          },
          {
            key: "task",
            header: "Zadanie",
            cell: (task: MagdaTask) => task.task_type,
          },
          {
            key: "due",
            header: "Termin",
            cell: (task: MagdaTask) => formatDate(task.due_date),
          },
          {
            key: "priority",
            header: "Priorytet",
            cell: (task: MagdaTask) => {
              const variant =
                task.priority === "critical"
                  ? "danger"
                  : task.priority === "high"
                    ? "warning"
                    : "gold";
              return <Badge variant={variant}>{task.priority}</Badge>;
            },
          },
        ]}
        data={tasksForMagdas}
        emptyMessage="Brak zadań dla Magd na dziś."
      />

      <DailySalesTrendChart data={dailyTrend} />
    </section>
  );
}
