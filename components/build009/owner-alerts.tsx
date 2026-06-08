import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OwnerAlert } from "@/lib/build009";

function getAlertIcon(severity: OwnerAlert["severity"]) {
  if (severity === "danger") return AlertTriangle;
  if (severity === "warning") return AlertTriangle;
  if (severity === "gold") return Sparkles;
  return ShieldCheck;
}

function getBadgeVariant(severity: OwnerAlert["severity"]) {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

export function OwnerAlerts({ alerts }: { alerts: OwnerAlert[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg">Owner Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.severity);
          return (
            <div
              key={`${alert.title}-${alert.metric}`}
              className="rounded-lg border border-border bg-background/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-gold/10 p-2 text-gold">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                </div>
                <Badge variant={getBadgeVariant(alert.severity)}>{alert.metric}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
