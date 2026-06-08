import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { RecoveryOpportunity } from "@/lib/build017";

function priorityVariant(priority: RecoveryOpportunity["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function RecoveryOpportunityQueue({ queue }: { queue: RecoveryOpportunity[] }) {
  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <RotateCcw className="h-4 w-4 text-success" /> Recovery Opportunity Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queue.map((item) => (
          <div key={item.leadId} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.clientName} · {item.model}</p>
              <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.leadId} · Powód: {item.reason} · Budżet: {formatCurrency(item.budget)} · Przegrane {item.lostDaysAgo} dni temu
            </p>
            <p className="mt-2 text-xs text-gold">Zadanie: {item.task}</p>
            <p className="mt-1 text-xs text-warning">Owner: {item.assignee}</p>
            <p className="mt-1 text-xs text-muted-foreground">Dlaczego do odzysku: {item.whyRecoverable}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
