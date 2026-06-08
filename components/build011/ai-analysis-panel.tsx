import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BriefOwnerAction } from "@/lib/daily-brief";

function priorityVariant(priority: BriefOwnerAction["priority"]) {
  if (priority === "critical") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function AiAnalysisPanel({
  summary,
  actions,
}: {
  summary: string;
  actions: BriefOwnerAction[];
}) {
  return (
    <Card className="border-gold/20 bg-gradient-to-br from-card to-background/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Sparkles className="h-4 w-4 text-gold" /> AI Analysis Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-gold/20 bg-gold/10 p-3 text-sm text-muted-foreground">
          {summary}
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{action.action}</p>
                <Badge variant={priorityVariant(action.priority)}>{action.priority}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Owner: <span className="text-foreground">{action.owner}</span></span>
                <span>Impact: <span className="text-foreground">{action.expectedImpact}</span></span>
                <span className={action.dueToday ? "text-warning" : ""}>{action.dueToday ? "Do wykonania dziś" : "Planowane"}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
