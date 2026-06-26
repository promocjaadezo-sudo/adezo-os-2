import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export function TiranaBudgetImpact({ snapshot }: { snapshot: TiranaPerformanceSnapshot }) {
  const delta = snapshot.costs.cost7d - snapshot.costs.costPrev7d;
  const budgetWarning = snapshot.alerts.some((alert) => alert.kind === "BUDGET WARNING");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Tirana Budget Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">Koszt 7d: <span className="font-semibold text-foreground">{snapshot.costs.cost7d.toFixed(2)} zł</span></p>
        <p className="text-muted-foreground">Koszt poprzednie 7d: <span className="font-semibold text-foreground">{snapshot.costs.costPrev7d.toFixed(2)} zł</span></p>
        <p className="text-muted-foreground">Zmiana budżetu: <span className="font-semibold text-foreground">{delta >= 0 ? "+" : ""}{delta.toFixed(2)} zł</span></p>
        <Badge variant={budgetWarning ? "warning" : "success"}>{budgetWarning ? "BUDGET WARNING" : "BUDGET OK"}</Badge>
      </CardContent>
    </Card>
  );
}
