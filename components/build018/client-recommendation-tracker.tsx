import { UserRoundPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClientRecommendationItem } from "@/lib/build018";

export function ClientRecommendationTracker({ items }: { items: ClientRecommendationItem[] }) {
  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <UserRoundPlus className="h-4 w-4 text-success" /> Client Recommendation Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.clientName} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.clientName}</p>
              <Badge variant={item.askNow ? "success" : "gold"}>{item.askNow ? "ask now" : "later"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Opiekun: {item.owner} · {item.daysSinceInstall} dni od montażu
            </p>
            <p className="mt-2 text-xs text-gold">{item.action}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
