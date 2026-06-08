import { Coins } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatCurrency } from "@/lib/format";

export function CostMetrics({ cpl, cphl }: { cpl: number; cphl: number }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">CPL / Cost per HOT Lead</h2>
      </div>
      <KpiGrid className="lg:grid-cols-2">
        <KpiCard title="Średni CPL" value={formatCurrency(cpl)} subtitle="Koszt pozyskania leada" variant="warning" />
        <KpiCard title="Średni Cost per HOT Lead" value={formatCurrency(cphl)} subtitle="Koszt pozyskania jakościowego leada" variant="gold" />
      </KpiGrid>
    </section>
  );
}
