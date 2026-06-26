import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export function TiranaNextDecisionBox({ snapshot }: { snapshot: TiranaPerformanceSnapshot }) {
  const priority = snapshot.alerts[0];

  const decision = priority
    ? `${priority.kind}: ${priority.message}`
    : "Brak krytycznych alertów. Można kontynuować test Tirana.";

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg">Tirana Next Decision Box</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{decision}</p>
        <div className="flex flex-wrap gap-2">
          {snapshot.alerts.length === 0 ? (
            <Badge variant="success">CONTINUE</Badge>
          ) : (
            snapshot.alerts.map((alert) => (
              <Badge key={alert.id} variant={alert.kind === "SCALE SIGNAL" || alert.kind === "CONTINUE" ? "success" : alert.kind === "BUDGET WARNING" || alert.kind === "QUALITY PROBLEM" ? "warning" : "danger"}>
                {alert.kind}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
