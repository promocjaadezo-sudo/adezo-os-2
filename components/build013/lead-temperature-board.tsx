import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScoredLead } from "@/lib/build013";

function variant(temp: ScoredLead["temperature"]) {
  if (temp === "HOT") return "success" as const;
  if (temp === "WARM") return "warning" as const;
  return "danger" as const;
}

export function LeadTemperatureBoard({ leads }: { leads: ScoredLead[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Thermometer className="h-4 w-4 text-gold" /> Lead Temperature Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{lead.clientName}</p>
                <p className="text-xs text-muted-foreground">{lead.modelInterest} · {lead.campaignSource}</p>
              </div>
              <Badge variant={variant(lead.temperature)}>{lead.temperature} · {lead.score} pkt</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Budżet: {lead.budget.toLocaleString("pl-PL")} zł · Termin: {lead.purchaseWindowMonths} mies. · Etap: {lead.investmentStage}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
