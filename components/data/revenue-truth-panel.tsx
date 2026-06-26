import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { RevenueTruthSnapshot } from "@/lib/revenue-truth-layer";

export function RevenueTruthPanel({ snapshot, dataIncomplete = false }: { snapshot: RevenueTruthSnapshot; dataIncomplete?: boolean }) {
  const hasUnattributed = snapshot.unattributedLeads.length > 0;

  return (
    <Card className="border-gold/20 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BarChart3 className="h-4 w-4 text-gold" /> Revenue Truth Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {dataIncomplete ? (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-warning">
            DATA INCOMPLETE
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg border border-border/80 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Leady</p>
              <p className="mt-1 font-semibold">{snapshot.summary.leads}</p>
              <p className="text-xs text-muted-foreground">GA4 lead_count: {snapshot.summary.ga4LeadCount.toFixed(0)}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Oferty / Sprzedaże</p>
              <p className="mt-1 font-semibold">{snapshot.summary.offers} / {snapshot.summary.sales}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Przychód / Koszt</p>
              <p className="mt-1 font-semibold">{formatCurrency(snapshot.summary.revenue)} / {formatCurrency(snapshot.summary.cost)}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">CPL / CPS</p>
              <p className="mt-1 font-semibold">{formatCurrency(snapshot.summary.costPerLead)} / {formatCurrency(snapshot.summary.costPerSale)}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">ROAS / GAP do planu</p>
              <p className="mt-1 font-semibold">{snapshot.summary.roas.toFixed(2)} / {formatCurrency(snapshot.summary.gapToPlan)}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border/80 bg-background/40 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">TOP źródła przychodu</p>
            <div className="space-y-2">
              {snapshot.topRevenueSources.length ? snapshot.topRevenueSources.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-md border border-border/60 p-2">
                  <p className="truncate pr-2">{row.label}</p>
                  <p className="whitespace-nowrap text-gold">{formatCurrency(row.revenue)} ({row.sales})</p>
                </div>
              )) : <p className="text-xs text-muted-foreground">Brak danych przychodowych.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/40 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Sprzedaż wg kanału</p>
            <div className="space-y-2">
              {snapshot.salesByChannel.map((row) => (
                <div key={row.channel} className="flex items-center justify-between rounded-md border border-border/60 p-2">
                  <p>{row.channel}</p>
                  <p className="text-gold">{row.sales} / {formatCurrency(row.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border/80 bg-background/40 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Kampanie bez sprzedaży</p>
            <div className="space-y-2">
              {snapshot.campaignsWithoutSales.length ? snapshot.campaignsWithoutSales.map((row) => (
                <div key={`${row.channel}-${row.campaignName}`} className="rounded-md border border-border/60 p-2">
                  <p className="font-medium">{row.campaignName}</p>
                  <p className="text-xs text-muted-foreground">{row.channel} · leady {row.leads} · oferty {row.offers} · koszt {formatCurrency(row.cost)}</p>
                </div>
              )) : <p className="text-xs text-muted-foreground">Brak kampanii bez sprzedaży.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Leady bez atrybucji</p>
              <Badge variant={hasUnattributed ? "warning" : "success"}>{hasUnattributed ? "UNATTRIBUTED" : "ATTRIBUTED"}</Badge>
            </div>
            <div className="space-y-2">
              {snapshot.unattributedLeads.length ? snapshot.unattributedLeads.map((row) => (
                <div key={row.leadId} className="rounded-md border border-border/60 p-2 text-xs">
                  {row.clientName} ({row.leadId})
                </div>
              )) : <p className="text-xs text-muted-foreground">Brak leadów UNATTRIBUTED.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
