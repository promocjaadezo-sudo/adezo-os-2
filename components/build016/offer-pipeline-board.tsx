import { Layers } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatCurrency, formatNumber } from "@/lib/format";

export function OfferPipelineBoard({
  inProgressCount,
  totalValue,
  nearCloseCount,
}: {
  inProgressCount: number;
  totalValue: number;
  nearCloseCount: number;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Offer Pipeline Board</h2>
      </div>
      <KpiGrid className="lg:grid-cols-3">
        <KpiCard title="Oferty w toku" value={formatNumber(inProgressCount)} subtitle="Aktywne oferty" variant="gold" />
        <KpiCard title="Wartość ofert" value={formatCurrency(totalValue)} subtitle="Potencjał przychodu" variant="warning" />
        <KpiCard title="Najbliżej zamknięcia" value={formatNumber(nearCloseCount)} subtitle="Negocjacje i po pomiarze" variant="success" />
      </KpiGrid>
    </section>
  );
}
