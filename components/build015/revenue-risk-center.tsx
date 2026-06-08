import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Build015Snapshot } from "@/lib/build015";

function variant(severity: "danger" | "warning" | "gold") {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function RevenueRiskCenter({ risks }: { risks: Build015Snapshot["revenueRisks"] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldAlert className="h-4 w-4 text-danger" /> Revenue Risk Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.title} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{risk.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{risk.description}</p>
              </div>
              <Badge variant={variant(risk.severity)}>{risk.severity}</Badge>
            </div>
            <p className="mt-2 text-xs text-gold">Owner: {risk.owner}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
