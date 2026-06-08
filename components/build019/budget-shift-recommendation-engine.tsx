import { MoveRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BudgetShiftRecommendation } from "@/lib/build019";

function variant(priority: BudgetShiftRecommendation["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function BudgetShiftRecommendationEngine({ items }: { items: BudgetShiftRecommendation[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <MoveRight className="h-4 w-4 text-warning" /> Budget Shift Recommendation Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.action}-${index}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.action}</p>
              <Badge variant={variant(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Z: {item.fromCampaign ?? "—"} → Do: {item.toCampaign ?? "—"} · Skala: {item.amountSuggestion}
            </p>
            <p className="mt-2 text-xs text-gold">{item.why}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
