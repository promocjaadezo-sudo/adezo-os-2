import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IncompleteLeadRecord } from "@/lib/build014a";

export function IncompleteLeadAlerts({ leads }: { leads: IncompleteLeadRecord[] }) {
  const incomplete = leads.filter((lead) => lead.dataIncomplete);

  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-4 w-4 text-danger" /> Incomplete Lead Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {incomplete.map((lead) => (
          <div key={lead.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{lead.clientName} · {lead.owner}</p>
              <Badge variant="danger">DATA INCOMPLETE</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Brakuje: {lead.missingFields.join(", ")}</p>
            <p className="text-xs text-gold mt-2">{lead.salespersonMessage}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
