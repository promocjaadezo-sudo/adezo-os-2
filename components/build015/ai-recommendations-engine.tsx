import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { AiRecommendation } from "@/lib/build015";

function variant(priority: AiRecommendation["priority"]) {
  if (priority === "critical") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function AiRecommendationsEngine({ items }: { items: AiRecommendation[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Sparkles className="h-4 w-4 text-gold" /> AI Recommendations Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.action}</p>
              <Badge variant={variant(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Owner: {item.owner}</p>
            <p className="text-xs text-muted-foreground">Target: {item.target}</p>
            <p className="text-xs text-gold mt-1">Wpływ: +{formatCurrency(item.expectedLift)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
