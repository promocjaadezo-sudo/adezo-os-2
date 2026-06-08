import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";
import type { PartnerLeadQualityItem } from "@/lib/build018";

export function PartnerLeadQualityEngine({ items }: { items: PartnerLeadQualityItem[] }) {
  return (
    <Card className="border-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Gauge className="h-4 w-4 text-gold" /> Partner Lead Quality Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={`${item.source}-${item.partnerName}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.partnerName}</p>
              <Badge variant={item.qualityScore >= 60 ? "success" : item.qualityScore >= 35 ? "warning" : "danger"}>
                score {item.qualityScore.toFixed(0)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Źródło: {item.source} · Leady: {item.leadCount} · HOT: {formatPercent(item.hotLeadPct, 1)} · Won: {formatPercent(item.wonPct, 1)}
            </p>
            <p className="mt-2 text-xs text-gold">{item.insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
