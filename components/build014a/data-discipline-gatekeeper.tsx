import { ShieldCheck } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";

export function DataDisciplineGatekeeper({
  complete,
  incomplete,
}: {
  complete: number;
  incomplete: number;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Data Discipline Gatekeeper</h2>
      </div>
      <KpiGrid className="lg:grid-cols-2">
        <KpiCard title="Leady kompletne" value={`${complete}`} subtitle="Wchodzą do forecastu i prowizji" variant="success" />
        <KpiCard title="Leady z brakami" value={`${incomplete}`} subtitle="DATA INCOMPLETE — blokada AI/commission" variant="danger" />
      </KpiGrid>
    </section>
  );
}
