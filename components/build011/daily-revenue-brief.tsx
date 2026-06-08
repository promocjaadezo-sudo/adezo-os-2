import { BriefcaseBusiness, Target, TrendingDown } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { DailyRevenueBriefSnapshot } from "@/lib/daily-brief";

export function DailyRevenueBrief({ snapshot }: { snapshot: DailyRevenueBriefSnapshot }) {
  return (
    <section className="space-y-4">
      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Plan dzienny"
          value={formatCurrency(snapshot.planToday)}
          subtitle={snapshot.dateLabel}
          icon={Target}
          variant="gold"
        />
        <KpiCard
          title="Forecast dzienny"
          value={formatCurrency(snapshot.forecastToday)}
          subtitle="Prognoza na dziś"
          icon={BriefcaseBusiness}
          variant="warning"
        />
        <KpiCard
          title="Luka dzisiaj"
          value={formatCurrency(snapshot.gapToday)}
          subtitle="Brakująca kwota do celu"
          icon={TrendingDown}
          variant={snapshot.gapToday > 0 ? "danger" : "success"}
        />
        <KpiCard
          title="Ryzyko niedowiezienia"
          value={formatPercent(snapshot.riskDeliveryPct, 1)}
          subtitle="Miesięczny plan vs forecast"
          variant={snapshot.riskDeliveryPct > 10 ? "danger" : "warning"}
        />
      </KpiGrid>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-lg">Dlaczego możemy nie dowieźć planu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.whyNotDelivering.map((item) => (
            <p key={item} className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
              {item}
            </p>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
