import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MagdaPriorityTask } from "@/lib/build020";

export function MagdaPriorityTasks({ tasks }: { tasks: MagdaPriorityTask[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <UserCheck className="h-4 w-4 text-warning" /> Magda Priority Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={`${task.owner}-${task.task}`} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{task.owner}: {task.task}</p>
            <p className="mt-1 text-xs text-muted-foreground">Wpływ: {task.expectedImpact}</p>
            <p className="mt-2 text-xs text-gold">Decyzja: {task.decision}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
