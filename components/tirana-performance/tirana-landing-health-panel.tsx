import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export function TiranaLandingHealthPanel({ snapshot }: { snapshot: TiranaPerformanceSnapshot }) {
  const hasCritical = snapshot.alerts.some((alert) =>
    ["LANDING PROBLEM", "FORM FRICTION", "QUALITY PROBLEM", "BUDGET WARNING"].includes(alert.kind),
  );

  return (
    <Card className="border-gold/20 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Activity className="h-4 w-4 text-gold" /> Tirana Landing Health Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Stan</p>
          <div className="mt-2 flex items-center gap-2">
            {hasCritical ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
            <Badge variant={hasCritical ? "warning" : "success"}>{hasCritical ? "REVIEW" : "GOOD"}</Badge>
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ruch 7d</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.traffic.sessions7d.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Koszt Tirana 7d</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.costs.cost7d.toFixed(2)} zł</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Przychód</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.funnel.revenue.toFixed(2)} zł</p>
        </div>
      </CardContent>
    </Card>
  );
}
