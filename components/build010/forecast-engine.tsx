import { TrendingUp, Target, CalendarRange, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ForecastSnapshot } from "@/lib/build010";

interface ForecastEngineProps {
  month: ForecastSnapshot;
  quarter: ForecastSnapshot;
}

function ForecastCard({
  forecast,
  icon: Icon,
}: {
  forecast: ForecastSnapshot;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-gold/20 bg-gradient-to-br from-card to-background/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <span className="rounded-lg bg-gold/10 p-2 text-gold">
            <Icon className="h-4 w-4" />
          </span>
          {forecast.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="mt-1 font-semibold">{formatCurrency(forecast.plan)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Forecast</p>
            <p className="mt-1 font-semibold text-gold">{formatCurrency(forecast.forecast)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Zamknięte</p>
            <p className="mt-1 font-semibold">{formatCurrency(forecast.closed)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Weighted pipeline</p>
            <p className="mt-1 font-semibold">{formatCurrency(forecast.weightedPipeline)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Plan vs wykonanie</span>
            <span className="font-medium text-foreground">{formatPercent(forecast.executionPct, 1)}</span>
          </div>
          <Progress value={Math.min(100, forecast.executionPct)} className="h-2" />
        </div>

        <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Luka do planu</p>
          <p className="mt-1 font-semibold text-warning">{formatCurrency(forecast.gap)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ForecastEngine({ month, quarter }: ForecastEngineProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-gold" />
        <h2 className="font-display text-xl">Revenue Forecast Engine</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ForecastCard forecast={month} icon={Target} />
        <ForecastCard forecast={quarter} icon={TrendingUp} />
      </div>
    </section>
  );
}
