import { PhoneForwarded } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyDecisionTask } from "@/lib/build014";

export function FollowupPriorityEngine({ tasks }: { tasks: DailyDecisionTask[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PhoneForwarded className="h-4 w-4 text-warning" /> Follow-up Priority Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zaległych follow-upów.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="text-sm font-medium">{task.clientName}</p>
              <p className="text-xs text-muted-foreground">{task.whyNow}</p>
              <p className="text-xs text-gold mt-1">Owner: {task.owner}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
