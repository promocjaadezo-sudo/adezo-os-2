import { LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ModelCampaignPerformanceItem } from "@/lib/build019";

function variant(priority: ModelCampaignPerformanceItem["budgetPriority"]) {
  if (priority === "highest") return "gold" as const;
  if (priority === "high") return "warning" as const;
  return "secondary" as const;
}

export function ModelCampaignPerformance({ items }: { items: ModelCampaignPerformanceItem[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <LayoutGrid className="h-4 w-4 text-gold" /> Model Campaign Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.model} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.model}</p>
              <Badge variant={variant(item.budgetPriority)}>{item.budgetPriority}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Kampanie: {item.campaigns} · ROAS: {item.roas.toFixed(2)} · HOT Rate: {formatPercent(item.hotLeadRate, 1)}
            </p>
            <p className="mt-2 text-xs text-gold">Koszt: {formatCurrency(item.cost)} · Przychód: {formatCurrency(item.revenue)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
