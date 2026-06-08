import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgencyAccountabilityItem } from "@/lib/build019";

function variant(severity: AgencyAccountabilityItem["severity"]) {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function AgencyAccountabilityPanel({ items, monthlyPlanImpact }: { items: AgencyAccountabilityItem[]; monthlyPlanImpact: string }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldAlert className="h-4 w-4 text-danger" /> Agency Accountability Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.campaignName}-${index}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.campaignName}</p>
              <Badge variant={variant(item.severity)}>{item.owner}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Problem: {item.issue}</p>
            <p className="mt-2 text-xs text-warning">Fix: {item.expectedFix}</p>
            <p className="mt-1 text-xs text-gold">Deadline: {item.deadline}</p>
          </div>
        ))}
        <p className="text-xs text-gold rounded-md border border-gold/20 bg-gold/10 px-3 py-2">{monthlyPlanImpact}</p>
      </CardContent>
    </Card>
  );
}
