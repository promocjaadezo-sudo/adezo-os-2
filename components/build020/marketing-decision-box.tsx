import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketingDecision } from "@/lib/build020";

export function MarketingDecisionBox({ decisions }: { decisions: MarketingDecision[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Megaphone className="h-4 w-4 text-gold" /> Marketing Decision Box
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.map((item) => (
          <div key={item.campaign} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.campaign}</p>
              <Badge variant={item.owner === "CEO" ? "danger" : "gold"}>{item.owner}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Problem: {item.issue}</p>
            <p className="mt-2 text-xs text-gold">Decyzja: {item.decision}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
