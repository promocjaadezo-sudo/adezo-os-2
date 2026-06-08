import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { ProductionRisk } from "@/lib/build011";

function riskVariant(severity: ProductionRisk["severity"]) {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function ProductionRiskEngine({ risks }: { risks: ProductionRisk[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-4 w-4 text-danger" /> Production Risk Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{risk.orderId} · {risk.clientName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{risk.reason}</p>
              </div>
              <Badge variant={riskVariant(risk.severity)}>{risk.severity}</Badge>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Potencjalne opóźnienie: <span className="text-foreground font-medium">{formatNumber(risk.delayDays)} dni</span></span>
              <span>Owner: <span className="text-foreground font-medium">{risk.owner}</span></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
