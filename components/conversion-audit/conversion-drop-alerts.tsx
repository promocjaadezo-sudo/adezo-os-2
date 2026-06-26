import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversionAuditAlert } from "@/lib/providers/analytics-ads/engines/conversion-audit-engine";

function typeVariant(type: ConversionAuditAlert["type"]) {
  if (type === "DROP ALERT" || type === "ADS WASTE ALERT" || type === "LANDING PROBLEM") return "danger" as const;
  if (type === "FUNNEL LEAK" || type === "PHONE TRACKING WARNING" || type === "WARNING") return "warning" as const;
  return "secondary" as const;
}

export function ConversionDropAlerts({ alerts }: { alerts: ConversionAuditAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-4 w-4 text-warning" /> Conversion Drop Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak aktywnych alertów konwersji.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <Badge variant={typeVariant(alert.type)}>{alert.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
