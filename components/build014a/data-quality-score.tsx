import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Build014ASnapshot } from "@/lib/build014a";

export function DataQualityScore({
  byOwner,
  missingFieldStats,
}: {
  byOwner: Build014ASnapshot["byOwner"];
  missingFieldStats: Build014ASnapshot["missingFieldStats"];
}) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Medal className="h-4 w-4 text-gold" /> Data Quality Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {byOwner.map((owner) => (
          <div key={owner.owner} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{owner.owner}</span>
              <span className="font-semibold">{owner.dataQualityScore}%</span>
            </div>
            <Progress value={owner.dataQualityScore} className="h-2" />
            <p className="text-xs text-muted-foreground">Braki: {owner.incomplete} / {owner.total}</p>
          </div>
        ))}

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Najczęściej brakujące pola</p>
          {missingFieldStats.map((item) => (
            <p key={item.field} className="text-xs text-muted-foreground">{item.field}: <span className="text-foreground">{item.count}</span></p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
