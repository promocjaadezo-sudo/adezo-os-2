import { Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ReferralRevenueSummary } from "@/lib/build018";

export function ReferralRevenueSummaryModule({ summary }: { summary: ReferralRevenueSummary }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Referral Revenue Summary</h2>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard title="Wygrane z referral" value={String(summary.wonDeals)} subtitle="Liczba sprzedaży" variant="success" />
        <KpiCard title="Sprzedaż z referral" value={formatCurrency(summary.wonRevenue)} subtitle="Przychód kanału" variant="gold" />
        <KpiCard title="Konwersja kanału" value={formatPercent(summary.conversionPct, 1)} subtitle="Won / wszystkie leady" variant="warning" />
        <KpiCard title="Pipeline referral" value={formatCurrency(summary.referralPipelineValue)} subtitle="Wartość w toku" variant="gold" />
      </KpiGrid>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-base">Wpływ na paid ads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gold">{summary.paidDependencyReductionNote}</p>
        </CardContent>
      </Card>
    </section>
  );
}
