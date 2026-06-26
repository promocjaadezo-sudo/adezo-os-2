import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversionAuditSnapshot } from "@/lib/providers/analytics-ads/engines/conversion-audit-engine";

function statusBadge(syncState: string) {
  if (syncState === "ready") return "success" as const;
  if (syncState === "error") return "danger" as const;
  if (syncState === "stub") return "warning" as const;
  return "secondary" as const;
}

export function ConversionHealthPanel({ snapshot }: { snapshot: ConversionAuditSnapshot }) {
  const hasAlerts = snapshot.alerts.length > 0;

  return (
    <Card className="border-gold/20 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Activity className="h-4 w-4 text-gold" /> Conversion Health Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border/80 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Stan audytu</p>
          <div className="mt-2 flex items-center gap-2">
            {hasAlerts ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
            <Badge variant={hasAlerts ? "warning" : "success"}>{hasAlerts ? "ALERTS" : "HEALTHY"}</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">GA4</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={statusBadge(snapshot.providerStatus.ga4.syncState)}>{snapshot.providerStatus.ga4.syncState.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Google Ads</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={statusBadge(snapshot.providerStatus.googleAds.syncState)}>{snapshot.providerStatus.googleAds.syncState.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Koszt reklam 7d</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{snapshot.totals.adsCost7d.toFixed(2)} zł</p>
          <p className="text-xs text-muted-foreground">Leady 7d: {snapshot.totals.leads7d.toFixed(0)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
