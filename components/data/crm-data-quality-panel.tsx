import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataProviderStatus } from "@/lib/providers/data-provider";

export function CrmDataQualityPanel({
  status,
  kpis,
}: {
  status: DataProviderStatus;
  kpis: {
    leads: number;
    offers: number;
    sales: number;
    salesValue: number;
    forecast: number;
    ga4LeadCount7d: number;
  };
}) {
  const qualityState = status.incompleteRows > 0 ? "warning" : "success";

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldAlert className="h-4 w-4 text-gold" /> CRM Data Quality Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={qualityState}>DATA QUALITY</Badge>
          <p className="text-xs text-muted-foreground">Provider: {status.resolvedProvider}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">Leady</p>
            <p className="font-semibold">{kpis.leads}</p>
          </div>
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">Oferty</p>
            <p className="font-semibold">{kpis.offers}</p>
          </div>
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">Sprzedaże</p>
            <p className="font-semibold">{kpis.sales}</p>
          </div>
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">Wartość sprzedaży</p>
            <p className="font-semibold">{kpis.salesValue.toLocaleString("pl-PL")} zł</p>
          </div>
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">Forecast</p>
            <p className="font-semibold">{kpis.forecast.toLocaleString("pl-PL")} zł</p>
          </div>
          <div className="rounded-md border border-border/70 p-2">
            <p className="text-xs text-muted-foreground">GA4 lead_count 7d</p>
            <p className="font-semibold">{kpis.ga4LeadCount7d.toFixed(0)}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          DATA INCOMPLETE: wiersze {status.incompleteRows}, pola {status.incompleteFields}
        </p>
      </CardContent>
    </Card>
  );
}
