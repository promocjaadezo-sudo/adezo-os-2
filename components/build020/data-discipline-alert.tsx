import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DataDisciplineAlert } from "@/lib/build020";

function variant(severity: DataDisciplineAlert["severity"]) {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function DataDisciplineAlertModule({ alerts }: { alerts: DataDisciplineAlert[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldAlert className="h-4 w-4 text-danger" /> Data Discipline Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{alert.title}</p>
              <Badge variant={variant(alert.severity)}>{alert.count}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Próg: {alert.threshold}</p>
            <p className="mt-2 text-xs text-gold">Działanie: {alert.action}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
