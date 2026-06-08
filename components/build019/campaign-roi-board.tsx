import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";
import type { CampaignRoiRow } from "@/lib/build019";

function decisionBadge(decision: CampaignRoiRow["decision"]) {
  if (decision === "scale") return "success" as const;
  if (decision === "stop") return "danger" as const;
  if (decision === "optimize-quality") return "warning" as const;
  if (decision === "scale-carefully") return "gold" as const;
  return "warning" as const;
}

export function CampaignRoiBoard({ rows }: { rows: CampaignRoiRow[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Target className="h-4 w-4 text-warning" /> Campaign ROI Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.campaignName} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{row.campaignName}</p>
              <Badge variant={decisionBadge(row.decision)}>{row.decision}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ROAS: {row.roas.toFixed(2)} · CPL: {Math.round(row.cpl)} zł · CPS: {Math.round(row.cps)} zł · HOT Rate: {formatPercent(row.hotLeadRate, 1)}
            </p>
            <p className="mt-2 text-xs text-gold">{row.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
