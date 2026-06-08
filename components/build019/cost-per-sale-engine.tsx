import { Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { CostPerSaleItem } from "@/lib/build019";

export function CostPerSaleEngine({ items }: { items: CostPerSaleItem[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Coins className="h-4 w-4 text-danger" /> Cost Per Sale Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.campaignName} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.campaignName}</p>
              <Badge variant={item.sales === 0 ? "danger" : "gold"}>{item.sales === 0 ? "no sales" : `${item.sales} sales`}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Koszt kampanii: {formatCurrency(item.cost)} · Przychód: {formatCurrency(item.revenue)}</p>
            <p className="mt-2 text-xs text-gold">Koszt sprzedaży: {formatCurrency(item.costPerSale)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
