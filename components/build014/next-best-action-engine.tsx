import { BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyDecisionTask } from "@/lib/build014";

export function NextBestActionEngine({ tasks }: { tasks: DailyDecisionTask[] }) {
  const top = tasks.slice(0, 5);

  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BrainCircuit className="h-4 w-4 text-gold" /> Next Best Action Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.map((task) => (
          <div key={task.id} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">Kto dzwoni: {task.owner}</p>
            <p className="text-sm">Do kogo: <span className="text-gold">{task.clientName}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Dlaczego: {task.whyNow}</p>
            <p className="text-xs text-muted-foreground">Cel: {task.callGoal}</p>
            <p className="text-xs mt-1">Kliknij status: <span className="text-foreground">{task.nextStatusToClick}</span></p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
