import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { RevenuePipelineStage } from "@/lib/build010";

export function RevenuePipeline({ stages }: { stages: RevenuePipelineStage[] }) {
  const maxDeals = Math.max(...stages.map((stage) => stage.deals), 1);

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Filter className="h-4 w-4 text-gold" /> Revenue Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => {
          const dealShare = (stage.deals / maxDeals) * 100;
          return (
            <div key={stage.stage} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{stage.stage}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(stage.deals)} szans</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-gold">{formatCurrency(stage.value)}</p>
                  <p className="text-xs text-muted-foreground">Weighted: {formatCurrency(stage.weightedValue)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Progress value={dealShare} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Siła etapu</span>
                  <span>Konwersja dalej: {formatPercent(stage.conversionToNextPct, 0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
