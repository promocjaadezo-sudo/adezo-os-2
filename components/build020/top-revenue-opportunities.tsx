import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { RevenueOpportunity } from "@/lib/build020";

export function TopRevenueOpportunities({ items }: { items: RevenueOpportunity[] }) {
  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Star className="h-4 w-4 text-success" /> Top Revenue Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.client} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{item.client}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(item.value)} · {item.chanceNote}</p>
            <p className="mt-2 text-xs text-gold">Działanie: {item.decision}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
