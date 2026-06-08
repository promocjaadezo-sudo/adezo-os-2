import { TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { RevenueGapSummary } from "@/lib/build020";

export function RevenueGapSummaryModule({ data }: { data: RevenueGapSummary }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <TrendingDown className="h-4 w-4 text-warning" /> Revenue Gap Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">Brakująca wartość: <span className="text-warning font-medium">{formatCurrency(data.missing)}</span></p>
        <div className="rounded-lg border border-border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Co zagraża planowi:</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {data.topGapCauses.map((cause) => (
              <li key={cause}>• {cause}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gold">Decyzja: {data.action}</p>
      </CardContent>
    </Card>
  );
}
