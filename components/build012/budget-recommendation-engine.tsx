import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { BudgetRecommendation } from "@/lib/build012";

function variant(value: BudgetRecommendation["action"]) {
  if (value === "skaluj") return "success" as const;
  if (value === "zatrzymaj") return "danger" as const;
  return "warning" as const;
}

export function BudgetRecommendationEngine({ items }: { items: BudgetRecommendation[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wallet className="h-4 w-4 text-gold" /> Budget Recommendation Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.campaignId} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.campaignName}</p>
              <Badge variant={variant(item.action)}>{item.action}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <span className="text-muted-foreground">Budżet: <span className="text-foreground">{formatCurrency(item.currentBudget)}</span></span>
              <span className="text-muted-foreground">Sugestia: <span className="text-foreground">{formatCurrency(item.suggestedBudget)}</span></span>
            </div>
            <p className="mt-2 text-xs text-gold">{item.expectedImpact}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
