import { Flag } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ExecutivePlanStatus } from "@/lib/build020";

export function ExecutivePlanStatusModule({ data }: { data: ExecutivePlanStatus }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Executive Plan Status</h2>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard title="Plan" value={formatCurrency(data.plan)} subtitle="Cel miesiąca" variant="gold" />
        <KpiCard title="Sprzedane" value={formatCurrency(data.sold)} subtitle="Wynik bieżący" variant="success" />
        <KpiCard title="Forecast" value={formatCurrency(data.forecast)} subtitle="Prognoza końca miesiąca" variant="warning" />
        <KpiCard title="Brakuje" value={formatCurrency(data.gap)} subtitle={data.status} variant="danger" />
      </KpiGrid>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-base">Decyzja</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gold">{data.decision}</p>
        </CardContent>
      </Card>
    </section>
  );
}
