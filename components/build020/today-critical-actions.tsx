import { AlarmClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CriticalAction } from "@/lib/build020";

function variant(priority: CriticalAction["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function TodayCriticalActions({ actions }: { actions: CriticalAction[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlarmClock className="h-4 w-4 text-danger" /> Today Critical Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div key={`${action.owner}-${action.task}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{action.owner}: {action.task}</p>
              <Badge variant={variant(action.priority)}>{action.priority}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Owner dnia: {action.owner}</p>
            <p className="mt-2 text-xs text-gold">Działanie teraz: {action.actionNow}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
