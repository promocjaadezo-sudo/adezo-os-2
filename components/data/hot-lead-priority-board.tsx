import { AlertTriangle, Crown, Flame, ShieldCheck, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { HotLeadResponseSnapshot } from "@/lib/hot-lead-response-engine";

function severityVariant(level: "CRITICAL" | "WARNING" | "INFO") {
  if (level === "CRITICAL") return "danger" as const;
  if (level === "WARNING") return "warning" as const;
  return "gold" as const;
}

export function HotLeadPriorityBoard({ snapshot }: { snapshot: HotLeadResponseSnapshot }) {
  return (
    <div className="space-y-6">
      <Card className="border-gold/30 bg-card/90 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-gold">
            <Flame className="h-4 w-4" /> SLA Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Średni czas reakcji</p>
            <p className="mt-1 text-sm font-semibold">{snapshot.summary.avgResponseMinutes} min</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">% SLA compliance</p>
            <p className="mt-1 text-sm font-semibold">{snapshot.summary.slaCompliancePct}%</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Utracone szanse</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(snapshot.summary.lostOpportunitiesNoResponse)}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Forecast impact</p>
            <p className="mt-1 text-sm font-semibold text-danger">-{formatCurrency(snapshot.summary.forecastPenalty)}</p>
            <p className="text-xs text-success">+{formatCurrency(snapshot.summary.forecastRecovery)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-base">Hot Lead Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.hotLeadQueue.slice(0, 10).map((lead) => (
              <div key={lead.leadId} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{lead.clientName}</p>
                  <Badge variant={lead.minutesWithoutContact > 60 ? "danger" : lead.minutesWithoutContact > 15 ? "warning" : "gold"}>
                    {lead.minutesWithoutContact} min
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">Owner: {lead.owner} · Budżet: {formatCurrency(lead.budget)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Overdue Lead Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.overdueLeadAlerts.length ? snapshot.overdueLeadAlerts.slice(0, 12).map((alert) => (
              <div key={alert.leadId} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{alert.clientName}</p>
                  <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{alert.message}</p>
              </div>
            )) : <p className="text-xs text-muted-foreground">Brak alertów overdue.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-gold" /> Response Time Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.responseTimeRanking.map((row, index) => (
              <div key={row.owner} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <p className="font-medium">#{index + 1} {row.owner}</p>
                <p className="mt-1 text-muted-foreground">Śr. czas: {row.avgResponseMinutes} min · SLA: {row.slaCompliancePct}%</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-gold" /> Lead Owner Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.leadOwnerPerformance.map((row) => (
              <div key={row.owner} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <p className="font-medium">{row.owner}</p>
                <p className="mt-1 text-muted-foreground">Leady: {row.leads} · Odzyskane przed SLA: {row.recoveredBeforeSla}</p>
                <p className="mt-1 text-gold">At risk: {formatCurrency(row.atRiskValue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-danger/30 bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-danger" /> CEO Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.ceoCriticalAlerts.length ? snapshot.ceoCriticalAlerts.slice(0, 12).map((alert, index) => (
            <div key={`${alert.title}-${index}`} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
              <p className="font-medium">{alert.title}</p>
              <p className="mt-1 text-muted-foreground">{alert.description}</p>
            </div>
          )) : <p className="text-xs text-muted-foreground">Brak krytycznych alertów CEO.</p>}
          <p className="text-xs text-gold">{snapshot.forecastImpactNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}
