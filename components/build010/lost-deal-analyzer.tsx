import { AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { LostDealReason } from "@/lib/build010";

export function LostDealAnalyzer({ reasons }: { reasons: LostDealReason[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertOctagon className="h-4 w-4 text-danger" /> Lost Deal Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reasons.map((reason) => (
          <div key={reason.reason} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{reason.reason}</p>
                <p className="text-xs text-muted-foreground">{reason.recommendation}</p>
              </div>
              <Badge variant="danger">{formatPercent(reason.sharePct, 1)}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-md border border-border bg-card/70 p-2">
                <p className="text-muted-foreground">Liczba utrat</p>
                <p className="mt-1 text-sm font-semibold">{formatNumber(reason.deals)}</p>
              </div>
              <div className="rounded-md border border-border bg-card/70 p-2">
                <p className="text-muted-foreground">Wartość utrat</p>
                <p className="mt-1 text-sm font-semibold">{formatCurrency(reason.value)}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
