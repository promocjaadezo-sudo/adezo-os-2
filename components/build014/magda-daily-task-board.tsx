import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DailyDecisionTask } from "@/lib/build014";

function priorityVariant(priority: DailyDecisionTask["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  if (priority === "medium") return "gold" as const;
  return "default" as const;
}

export function MagdaDailyTaskBoard({ tasks }: { tasks: DailyDecisionTask[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ClipboardList className="h-4 w-4 text-gold" /> Magda Daily Task Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{task.owner} → {task.clientName}</p>
                <p className="text-xs text-muted-foreground mt-1">Dlaczego teraz: {task.whyNow}</p>
              </div>
              <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
            </div>
            <p className="text-xs text-gold mt-2">Cel rozmowy: {task.callGoal}</p>
            <p className="text-xs text-muted-foreground mt-1">Status po wykonaniu: <span className="text-foreground">{task.nextStatusToClick}</span></p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
