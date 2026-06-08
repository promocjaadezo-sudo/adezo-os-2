import { Siren } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgencyFixItem, Build012Snapshot } from "@/lib/build012";

export function CampaignActionCenter({
  summary,
  agencyFixes,
}: {
  summary: Build012Snapshot["actionSummary"];
  agencyFixes: AgencyFixItem[];
}) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Siren className="h-4 w-4 text-danger" /> Campaign Action Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-background/40 p-4 text-sm">
          <p><span className="text-success font-semibold">Skaluj:</span> {summary.scale.join(", ") || "—"}</p>
          <p className="mt-1"><span className="text-danger font-semibold">Zatrzymaj:</span> {summary.stop.join(", ") || "—"}</p>
          <p className="mt-1"><span className="text-warning font-semibold">Obserwuj:</span> {summary.watch.join(", ") || "—"}</p>
          <p className="mt-1"><span className="text-gold font-semibold">Niska jakość leadów:</span> {summary.lowQuality.join(", ") || "—"}</p>
        </div>

        <div className="space-y-3">
          {agencyFixes.map((item) => (
            <div key={`${item.area}-${item.issue}`} className="rounded-lg border border-border bg-background/30 p-4">
              <p className="text-sm font-medium">{item.area}</p>
              <p className="mt-1 text-xs text-muted-foreground">Problem: {item.issue}</p>
              <p className="mt-1 text-xs text-gold">Do poprawy dziś: {item.fixToday}</p>
              <p className="mt-1 text-xs text-muted-foreground">Owner: {item.owner}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
