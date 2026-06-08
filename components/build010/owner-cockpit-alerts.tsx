import { TriangleAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OwnerAlarm } from "@/lib/build010";

function alarmVariant(severity: OwnerAlarm["severity"]) {
  if (severity === "danger") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "gold" as const;
}

function alarmIcon(severity: OwnerAlarm["severity"]) {
  if (severity === "gold") return Sparkles;
  return TriangleAlert;
}

export function OwnerCockpitAlerts({ alarms }: { alarms: OwnerAlarm[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg">Alarmy Owner Cockpit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alarms.map((alarm) => {
          const Icon = alarmIcon(alarm.severity);
          return (
            <div key={alarm.title} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-gold/10 p-2 text-gold">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{alarm.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{alarm.description}</p>
                  </div>
                </div>
                <Badge variant={alarmVariant(alarm.severity)}>{alarm.metric}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
