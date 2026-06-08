import { Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { CampaignAttributionRow } from "@/lib/build019";

export function CampaignRevenueAttribution({ rows }: { rows: CampaignAttributionRow[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Link2 className="h-4 w-4 text-gold" /> Campaign Revenue Attribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.campaignName} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{row.campaignName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Leady: {row.leads} · HOT: {row.hotLeads} · Oferty: {row.offers} · Sprzedaże: {row.sales}
            </p>
            <p className="mt-2 text-xs text-gold">Przychód: {formatCurrency(row.revenue)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
