import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReferralFollowupTask } from "@/lib/build018";

function variant(priority: ReferralFollowupTask["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function ReferralFollowupQueue({ tasks }: { tasks: ReferralFollowupTask[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PhoneCall className="h-4 w-4 text-danger" /> Referral Follow-up Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{task.who}</p>
              <Badge variant={variant(task.priority)}>{task.priority}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Typ: {task.type} · Owner: {task.owner}</p>
            <p className="mt-2 text-xs text-gold">Zadanie: {task.task}</p>
            <p className="mt-1 text-xs text-warning">Dlaczego dziś: {task.whyNow}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
