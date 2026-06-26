import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export function TiranaLeadQualityPanel({ snapshot }: { snapshot: TiranaPerformanceSnapshot }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Tirana Lead Quality Panel</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Leady (eventy)</p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {snapshot.events.lead_count.toFixed(0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">HOT Leady</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.funnel.hotLeads.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Koszt leada</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.economics.costPerLead.toFixed(2)} zł</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Koszt HOT leada</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.economics.costPerHotLead.toFixed(2)} zł</p>
        </div>
      </CardContent>
    </Card>
  );
}
