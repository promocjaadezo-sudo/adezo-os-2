import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { ArchitectPartnerPipelineItem } from "@/lib/build018";

export function ArchitectPartnerPipeline({ items }: { items: ArchitectPartnerPipelineItem[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Building2 className="h-4 w-4 text-warning" /> Architect Partner Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.architect} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.architect}</p>
              <Badge variant={item.vip ? "gold" : "warning"}>{item.vip ? "VIP" : "standard"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Leady: {item.leadsProvided} · Wygrane: {item.wonDeals} · Sprzedaż: {formatCurrency(item.wonRevenue)}
            </p>
            <p className="mt-2 text-xs text-gold">Działanie: {item.nextAction}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
