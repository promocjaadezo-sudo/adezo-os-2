import { TrendingUp, Target, Wallet, AlertCircle } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";

interface MonthlyForecastProps {
  monthlyGoal: number;
  closedSales: number;
  weightedPipeline: number;
  projectedRevenue: number;
  forecastGap: number;
  forecastAchievementPct: number;
}

export function MonthlyForecast({
  monthlyGoal,
  closedSales,
  weightedPipeline,
  projectedRevenue,
  forecastGap,
  forecastAchievementPct,
}: MonthlyForecastProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Monthly Forecast</h2>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Cel miesiąca"
          value={formatCurrency(monthlyGoal)}
          icon={Target}
          variant="gold"
        />
        <KpiCard
          title="Zamknięta sprzedaż"
          value={formatCurrency(closedSales)}
          icon={Wallet}
          variant="success"
        />
        <KpiCard
          title="Forecast (Closed + 65% Weighted)"
          value={formatCurrency(projectedRevenue)}
          subtitle={`Weighted pipeline: ${formatCurrency(weightedPipeline)}`}
          icon={TrendingUp}
          variant="warning"
        />
        <KpiCard
          title="Luka do celu"
          value={formatCurrency(forecastGap)}
          icon={AlertCircle}
          variant={forecastGap > 0 ? "danger" : "success"}
        />
      </KpiGrid>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-base">Realizacja prognozy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Postęp wobec celu</span>
            <span className="font-medium text-gold">{formatPercent(forecastAchievementPct, 1)}</span>
          </div>
          <Progress value={forecastAchievementPct} />
        </CardContent>
      </Card>
    </section>
  );
}
