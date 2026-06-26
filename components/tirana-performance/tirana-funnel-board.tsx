import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TiranaPerformanceSnapshot } from "@/lib/landing-tirana-performance";

export function TiranaFunnelBoard({ snapshot }: { snapshot: TiranaPerformanceSnapshot }) {
  const stages = [
    { label: "Formularz Start", value: snapshot.events.formularz_start },
    { label: "Lead Form", value: snapshot.events.lead_form },
    { label: "Lead Tel", value: snapshot.events.lead_tel },
    { label: "Lead Email", value: snapshot.events.lead_email },
    { label: "Lead Messenger", value: snapshot.events.lead_messenger },
    { label: "Lead Count", value: snapshot.events.lead_count },
    { label: "HOT Leady", value: snapshot.funnel.hotLeads },
    { label: "Oferty", value: snapshot.funnel.offers },
    { label: "Sprzedaże", value: snapshot.funnel.sales },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Tirana Funnel Board</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-lg border border-border/70 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{stage.label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{stage.value.toFixed(0)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
