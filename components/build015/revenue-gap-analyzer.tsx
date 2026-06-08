import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { RevenueGapAnalyzer } from "@/lib/build015";

export function RevenueGapAnalyzerPanel({ data }: { data: RevenueGapAnalyzer }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-4 w-4 text-danger" /> Revenue Gap Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><span className="text-muted-foreground">PLAN:</span> {formatCurrency(data.plan)}</p>
        <p><span className="text-muted-foreground">SPRZEDANE:</span> {formatCurrency(data.sold)}</p>
        <p><span className="text-muted-foreground">FORECAST:</span> {formatCurrency(data.forecast)}</p>
        <p><span className="text-muted-foreground">BRAKUJE:</span> <span className="text-danger font-semibold">{formatCurrency(data.gap)}</span></p>
        <p><span className="text-muted-foreground">Przyczyna:</span> {data.primaryCause}</p>
        <p><span className="text-muted-foreground">Czego brakuje:</span> {data.missingWhat}</p>
      </CardContent>
    </Card>
  );
}
