import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NextBestAction, PriorityLead } from "@/lib/build015";

export function NextBestActionGenerator({
  actions,
  priorityLeads,
}: {
  actions: NextBestAction[];
  priorityLeads: PriorityLead[];
}) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PhoneCall className="h-4 w-4 text-gold" /> Next Best Action Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={`${action.owner}-${action.whatToDoNow}`} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="text-sm font-medium">{action.owner}: {action.whatToDoNow}</p>
              <p className="text-xs text-muted-foreground mt-1">Dlaczego: {action.whyNow}</p>
              <p className="text-xs text-gold mt-1">Miernik sukcesu: {action.successMetric}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Najważniejsze leady teraz</p>
          {priorityLeads.map((lead) => (
            <div key={`${lead.clientName}-${lead.model}`} className="rounded-lg border border-border bg-background/30 p-3 text-xs">
              <p className="font-medium text-sm">{lead.clientName} ({lead.model})</p>
              <p className="text-muted-foreground">Owner: {lead.owner} · Powód: {lead.reason}</p>
              <p className="text-gold">Potencjał: {lead.expectedValue.toLocaleString("pl-PL")} zł</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
