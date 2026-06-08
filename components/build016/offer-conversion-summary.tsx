import { CheckCheck } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatNumber, formatPercent } from "@/lib/format";

export function OfferConversionSummary({
  sent,
  won,
  lost,
  conversionPct,
  missingOutcomeReason,
}: {
  sent: number;
  won: number;
  lost: number;
  conversionPct: number;
  missingOutcomeReason: number;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCheck className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Offer Conversion Summary</h2>
      </div>
      <KpiGrid className="lg:grid-cols-5">
        <KpiCard title="W toku" value={formatNumber(sent)} variant="gold" />
        <KpiCard title="Wygrane" value={formatNumber(won)} variant="success" />
        <KpiCard title="Przegrane" value={formatNumber(lost)} variant="danger" />
        <KpiCard title="Konwersja" value={formatPercent(conversionPct, 1)} variant="warning" />
        <KpiCard title="Brak powodu wyniku" value={formatNumber(missingOutcomeReason)} subtitle="Uzupełnij reason" variant={missingOutcomeReason > 0 ? "danger" : "success"} />
      </KpiGrid>
    </section>
  );
}
