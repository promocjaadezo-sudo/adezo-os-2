import { Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfferRecord } from "@/lib/build016";

export function OfferAgingTracker({ offers }: { offers: OfferRecord[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Timer className="h-4 w-4 text-warning" /> Offer Aging Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{offer.clientName}</p>
            <p className="text-xs text-muted-foreground">Wiek oferty: {offer.daysSinceSent} dni</p>
            <p className="text-xs text-gold mt-1">Tryb odzyskania: uruchom teraz</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
