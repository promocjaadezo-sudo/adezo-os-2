import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfferRecord } from "@/lib/build016";

export function FollowupControlEngine({ offers }: { offers: OfferRecord[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BellRing className="h-4 w-4 text-danger" /> Follow-up Control Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{offer.clientName} · {offer.owner}</p>
            <p className="text-xs text-muted-foreground">Bez follow-upu: {offer.daysSinceFollowup} dni</p>
            <p className="text-xs text-gold mt-1">Działanie: follow-up dzisiaj</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
