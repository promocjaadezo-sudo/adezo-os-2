import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OfferAction } from "@/lib/build016";

function variant(priority: OfferAction["priority"]) {
  if (priority === "highest") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function OfferNextBestAction({ actions, forecastImpactNote }: { actions: OfferAction[]; forecastImpactNote: string }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PhoneCall className="h-4 w-4 text-danger" /> Offer Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div key={`${action.offerId}-${action.whatNow}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{action.owner} → {action.clientName}</p>
              <Badge variant={variant(action.priority)}>{action.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Co teraz: {action.whatNow}</p>
            <p className="text-xs text-muted-foreground">Dlaczego: {action.whyNow}</p>
            <p className="text-xs text-gold mt-1">Wpływ: {action.expectedImpact}</p>
          </div>
        ))}
        <p className="text-xs text-gold rounded-md border border-gold/20 bg-gold/10 px-3 py-2">{forecastImpactNote}</p>
      </CardContent>
    </Card>
  );
}
