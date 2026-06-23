import { Activity, AlertTriangle, Database, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LiveDataStatusSnapshot } from "@/lib/live-data-status";

function freshnessBadge(level: LiveDataStatusSnapshot["freshness"]["level"]) {
  if (level === "critical") return "danger" as const;
  if (level === "warning") return "warning" as const;
  if (level === "incomplete") return "warning" as const;
  return "success" as const;
}

export function LiveDataStatusPanel({ snapshot }: { snapshot: LiveDataStatusSnapshot }) {
  const trustVariant = snapshot.dataTrustScore < 70 ? "warning" : "success";

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Database className="h-4 w-4 text-gold" /> LIVE Data Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">Data source active</p>
            <p className="mt-1 font-semibold">{snapshot.activeDataSource}</p>
            <p className="text-xs text-muted-foreground">Requested: {snapshot.requestedDataSource}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">CRM freshness</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={freshnessBadge(snapshot.freshness.level)}>{snapshot.freshness.level.toUpperCase()}</Badge>
              <span className="text-xs text-muted-foreground">
                {snapshot.freshness.daysSinceLastData === null
                  ? "No dated records"
                  : `${snapshot.freshness.daysSinceLastData} day(s) since last CRM record`}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">Last sync</p>
            <p className="mt-1 font-semibold">{new Date(snapshot.lastSyncAt).toLocaleString("pl-PL")}</p>
          </div>
        </div>

        {snapshot.dataIncomplete ? (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-warning">
              <ShieldAlert className="h-4 w-4" /> DATA INCOMPLETE
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              CRM is empty or unavailable. KPI cards are intentionally hidden to avoid fake numbers.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="mt-1 font-semibold">{snapshot.leads}</p>
            </div>
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">Offers</p>
              <p className="mt-1 font-semibold">{snapshot.offers}</p>
            </div>
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">Sales</p>
              <p className="mt-1 font-semibold">{snapshot.sales}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Data Trust Score
            </p>
            <Badge variant={trustVariant}>{snapshot.dataTrustScore}%</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 text-xs">
            <p className="rounded-md border border-border/60 px-2 py-1">CRM completeness: {snapshot.completeness.crm}%</p>
            <p className="rounded-md border border-border/60 px-2 py-1">GA4 completeness: {snapshot.completeness.ga4}%</p>
            <p className="rounded-md border border-border/60 px-2 py-1">Ads completeness: {snapshot.completeness.ads}%</p>
          </div>
        </div>

        {snapshot.missingData.length > 0 ? (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Missing data / blockers
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {snapshot.missingData.slice(0, 8).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
