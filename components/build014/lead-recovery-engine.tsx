import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyDecisionTask } from "@/lib/build014";

export function LeadRecoveryEngine({ tasks }: { tasks: DailyDecisionTask[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <RotateCcw className="h-4 w-4 text-gold" /> Lead Recovery Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak leadów do odzyskania.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="text-sm font-medium">{task.clientName}</p>
              <p className="text-xs text-muted-foreground">{task.whyNow}</p>
              <p className="text-xs text-gold mt-1">Następny ruch: {task.callGoal}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
