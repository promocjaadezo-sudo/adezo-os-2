import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BriefOwnerAction } from "@/lib/daily-brief";

function priorityVariant(priority: BriefOwnerAction["priority"]) {
  if (priority === "critical") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function MagdaActionBoard({ actions }: { actions: BriefOwnerAction[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <UserCheck className="h-4 w-4 text-gold" /> Magda Action Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div key={action.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{action.action}</p>
              <Badge variant={priorityVariant(action.priority)}>{action.priority}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Właściciel: <span className="text-foreground">{action.owner}</span></span>
              <span>Efekt: <span className="text-foreground">{action.expectedImpact}</span></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
