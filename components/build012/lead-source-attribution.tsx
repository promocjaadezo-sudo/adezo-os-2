import { Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Build012Snapshot } from "@/lib/build012";

export function LeadSourceAttribution({ attribution }: { attribution: Build012Snapshot["attribution"] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Link2 className="h-4 w-4 text-gold" /> Lead Source Attribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attribution.map((item) => (
          <div key={item.source} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{item.source}</p>
              <p className="text-xs text-muted-foreground">HOT Rate: {formatPercent(item.hotRatePct, 1)}</p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">Leady</p><p className="font-semibold">{formatNumber(item.leads)}</p></div>
              <div><p className="text-muted-foreground">HOT</p><p className="font-semibold">{formatNumber(item.hotLeads)}</p></div>
              <div><p className="text-muted-foreground">Przychód</p><p className="font-semibold">{formatCurrency(item.revenue)}</p></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
