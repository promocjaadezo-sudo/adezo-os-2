import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LandingTiranaAudit } from "@/lib/providers/analytics-ads/engines/conversion-audit-engine";

export function LandingTiranaTracker({ tracker }: { tracker: LandingTiranaAudit }) {
  const isProblem = tracker.status === "LANDING PROBLEM";

  return (
    <Card className={isProblem ? "border-danger/40" : "border-gold/20"}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Landing Tirana Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">Ruch 7d: <span className="font-semibold text-foreground">{tracker.sessions7d.toFixed(0)}</span></p>
        <p className="text-muted-foreground">Leady 7d: <span className="font-semibold text-foreground">{tracker.leads7d.toFixed(0)}</span></p>
        <Badge variant={isProblem ? "danger" : "success"}>{tracker.status}</Badge>
      </CardContent>
    </Card>
  );
}
