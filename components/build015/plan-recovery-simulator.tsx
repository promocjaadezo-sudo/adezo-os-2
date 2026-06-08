import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { RecoveryScenario } from "@/lib/build015";

export function PlanRecoverySimulator({ scenarios }: { scenarios: RecoveryScenario[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <FlaskConical className="h-4 w-4 text-warning" /> Plan Recovery Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scenarios.map((scenario) => (
          <div key={scenario.scenario} className="rounded-lg border border-border bg-background/40 p-4 text-sm">
            <p className="font-medium">Jeżeli: {scenario.scenario}</p>
            <p className="mt-1 text-muted-foreground">Forecast: {formatCurrency(scenario.fromForecast)} → {formatCurrency(scenario.toForecast)}</p>
            <p className="text-gold">Zmiana: +{formatCurrency(scenario.delta)} · Szansa domknięcia luki: {formatPercent(scenario.chanceToCloseGapPct, 0)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
