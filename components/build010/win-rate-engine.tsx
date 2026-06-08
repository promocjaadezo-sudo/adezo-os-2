import { GaugeCircle, Trophy, CircleX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { WinRateSnapshot } from "@/lib/build010";

export function WinRateEngine({ snapshot }: { snapshot: WinRateSnapshot }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <GaugeCircle className="h-4 w-4 text-gold" />
        <h2 className="font-display text-xl">Win Rate Engine</h2>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Skuteczność sprzedaży"
          value={formatPercent(snapshot.salesEffectivenessPct, 1)}
          subtitle="Wynik łączony konwersji i realizacji planu"
          variant="gold"
        />
        <KpiCard
          title="Win rate"
          value={formatPercent(snapshot.winRatePct, 1)}
          subtitle="Wygrane / (wygrane + przegrane)"
          icon={Trophy}
          variant="success"
        />
        <KpiCard
          title="Przegrane transakcje"
          value={formatNumber(snapshot.lostDeals)}
          subtitle="Do analizy przyczyn"
          icon={CircleX}
          variant="danger"
        />
        <KpiCard
          title="Średnia wartość wygranej"
          value={formatCurrency(snapshot.avgWonDealValue)}
          subtitle={`Aktywne szanse: ${formatNumber(snapshot.activeDeals)}`}
          variant="warning"
        />
      </KpiGrid>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Konwersja transakcji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-success/20 bg-success/10 p-3">
              <p className="text-xs text-muted-foreground">Wygrane</p>
              <p className="mt-1 text-lg font-semibold text-success">{formatNumber(snapshot.wonDeals)}</p>
            </div>
            <div className="rounded-lg border border-danger/20 bg-danger/10 p-3">
              <p className="text-xs text-muted-foreground">Przegrane</p>
              <p className="mt-1 text-lg font-semibold text-danger">{formatNumber(snapshot.lostDeals)}</p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-gold/10 p-3">
              <p className="text-xs text-muted-foreground">Aktywne</p>
              <p className="mt-1 text-lg font-semibold text-gold">{formatNumber(snapshot.activeDeals)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
