import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketingRecommendation } from "@/lib/daily-brief";

export function MarketingRecommendations({
  recommendations,
}: {
  recommendations: MarketingRecommendation[];
}) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Megaphone className="h-4 w-4 text-gold" /> Marketing Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((item) => (
          <div key={`${item.channel}-${item.recommendation}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.recommendation}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <Badge variant="gold">{item.channel}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Expected: <span className="text-foreground">{item.expectedResult}</span></span>
              <span>Owner: <span className="text-foreground">{item.owner}</span></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
