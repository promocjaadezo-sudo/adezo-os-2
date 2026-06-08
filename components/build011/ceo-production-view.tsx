import { ShieldAlert, Clock3, FileWarning, Boxes } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { Build011Snapshot } from "@/lib/build011";

function alertVariant(severity: "danger" | "warning" | "gold") {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function CeoProductionView({ snapshot }: { snapshot: Build011Snapshot }) {
  return (
    <section className="space-y-4">
      <KpiGrid className="lg:grid-cols-6">
        <KpiCard
          title="W produkcji"
          value={formatNumber(snapshot.totals.inProduction)}
          subtitle="Aktywne i zablokowane"
          icon={Boxes}
          variant="gold"
        />
        <KpiCard
          title="Terminy 7 dni"
          value={formatNumber(snapshot.totals.dueThisWeek)}
          subtitle="Zamówienia blisko deadline"
          icon={Clock3}
          variant="warning"
        />
        <KpiCard
          title="Ryzyko opóźnień"
          value={formatNumber(snapshot.totals.delayedRisk)}
          subtitle="Warning + danger"
          icon={ShieldAlert}
          variant="danger"
        />
        <KpiCard
          title="Braki techniczne"
          value={formatNumber(snapshot.totals.missingTechnicalData)}
          subtitle="Niepełne specyfikacje"
          icon={FileWarning}
          variant="warning"
        />
        <KpiCard
          title="Handoff niepełny"
          value={formatNumber(snapshot.totals.incompleteHandoffs)}
          subtitle="Sales → Production"
          variant="gold"
        />
        <KpiCard
          title="Alerty krytyczne"
          value={formatNumber(snapshot.totals.criticalAlerts)}
          subtitle="Wymagają interwencji CEO"
          variant={snapshot.totals.criticalAlerts > 0 ? "danger" : "success"}
        />
      </KpiGrid>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-lg">CEO Production Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant={alertVariant(alert.severity)}>{alert.metric}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
