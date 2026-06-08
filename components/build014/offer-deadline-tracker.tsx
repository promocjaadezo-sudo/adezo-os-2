import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionLead } from "@/lib/build014";

export function OfferDeadlineTracker({ leads }: { leads: ActionLead[] }) {
  const offersToTrack = leads.filter((lead) => lead.hasOffer);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Clock3 className="h-4 w-4 text-gold" /> Offer Deadline Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {offersToTrack.map((lead) => (
          <div key={lead.id} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{lead.clientName}</p>
            <p className="text-xs text-muted-foreground">Model: {lead.model} · Owner: {lead.owner}</p>
            <p className="text-xs mt-1">Dni od follow-upu: <span className="text-foreground">{lead.offerLastFollowupDaysAgo ?? 0}</span></p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
