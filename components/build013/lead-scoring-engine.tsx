import { GaugeCircle } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatNumber } from "@/lib/format";

export function LeadScoringEngine({
  totalLeads,
  hotLeads,
  warmLeads,
  coldLeads,
  avgScore,
}: {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <GaugeCircle className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Lead Scoring Engine</h2>
      </div>
      <KpiGrid className="lg:grid-cols-5">
        <KpiCard title="Wszystkie leady" value={formatNumber(totalLeads)} variant="gold" />
        <KpiCard title="HOT" value={formatNumber(hotLeads)} variant="success" />
        <KpiCard title="WARM" value={formatNumber(warmLeads)} variant="warning" />
        <KpiCard title="COLD" value={formatNumber(coldLeads)} variant="danger" />
        <KpiCard title="Średni score" value={avgScore.toFixed(1)} subtitle="Skala 0–13" variant="gold" />
      </KpiGrid>
    </section>
  );
}
