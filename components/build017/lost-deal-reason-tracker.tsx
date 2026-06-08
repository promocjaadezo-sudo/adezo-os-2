import { AlertTriangle, FileWarning } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";
import type { ReasonStat } from "@/lib/build017";

export function LostDealReasonTracker({
  reasonStats,
  dataIncompleteCount,
  ceoAlerts,
  salesAlerts,
  operationsAlerts,
}: {
  reasonStats: ReasonStat[];
  dataIncompleteCount: number;
  ceoAlerts: string[];
  salesAlerts: string[];
  operationsAlerts: string[];
}) {
  const topReason = reasonStats[0];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-danger" />
        <h2 className="font-display text-lg">Lost Deal Reason Tracker</h2>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Główny powód przegranych"
          value={topReason?.reason ?? "—"}
          subtitle={topReason ? `${formatPercent(topReason.pct, 1)} wszystkich przegranych` : "Brak danych"}
          variant="danger"
        />
        <KpiCard
          title="Liczba powodów aktywnych"
          value={String(reasonStats.length)}
          subtitle="Ile przyczyn realnie występuje"
          variant="warning"
        />
        <KpiCard
          title="Alerty decyzyjne"
          value={String(ceoAlerts.length + salesAlerts.length + operationsAlerts.length)}
          subtitle="CEO/Sprzedaż/Operacje"
          variant="gold"
        />
        <KpiCard
          title="Data Incomplete"
          value={String(dataIncompleteCount)}
          subtitle="Przegrane bez powodu"
          variant={dataIncompleteCount > 0 ? "danger" : "success"}
          icon={FileWarning}
        />
      </KpiGrid>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="font-display text-lg">Dlaczego realnie przegrywamy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reasonStats.map((item) => (
            <div key={item.reason} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium capitalize">{item.reason}</p>
                <Badge variant={item.pct > 30 ? "danger" : item.pct > 20 ? "warning" : "gold"}>{formatPercent(item.pct, 1)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Wystąpienia: {item.count}</p>
              <p className="mt-2 text-xs text-gold">{item.insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
