import { Gem } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { OfferRecord } from "@/lib/build016";

export function HighValueOfferAlerts({ offers }: { offers: OfferRecord[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Gem className="h-4 w-4 text-gold" /> High Value Offer Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{offer.clientName} · {offer.model}</p>
            <p className="text-xs text-muted-foreground">Wartość: {formatCurrency(offer.value)}</p>
            <p className="text-xs text-gold mt-1">Priorytet: telefon dzisiaj</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
