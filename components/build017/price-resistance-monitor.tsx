import { HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { PriceResistanceModel } from "@/lib/build017";

export function PriceResistanceMonitor({ models }: { models: PriceResistanceModel[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <HandCoins className="h-4 w-4 text-warning" /> Price Resistance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {models.map((item) => (
          <div key={item.model} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.model}</p>
              <Badge variant={item.priceResistancePct > 35 ? "danger" : item.priceResistancePct > 20 ? "warning" : "gold"}>
                {formatPercent(item.priceResistancePct, 1)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Przegrane przez cenę: {item.lossesByPrice}/{item.totalLosses} · Śr. budżet: {formatCurrency(item.avgBudget)}
            </p>
            <p className="mt-2 text-xs text-gold">Ruch: {item.action}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
