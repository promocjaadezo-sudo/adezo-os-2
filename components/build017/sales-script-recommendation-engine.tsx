import { Mic2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScriptRecommendation } from "@/lib/build017";

function ownerVariant(owner: ScriptRecommendation["owner"]) {
  if (owner === "CEO") return "danger" as const;
  if (owner === "Marketing") return "warning" as const;
  return "gold" as const;
}

export function SalesScriptRecommendationEngine({ recommendations }: { recommendations: ScriptRecommendation[] }) {
  return (
    <Card className="border-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Mic2 className="h-4 w-4 text-gold" /> Sales Script Recommendation Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((item) => (
          <div key={`${item.scenario}-${item.owner}`} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.scenario}</p>
              <Badge variant={ownerVariant(item.owner)}>{item.owner}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Kiedy użyć: {item.whenUse}</p>
            <p className="mt-2 text-xs text-gold">Skrypt: {item.scriptArgument}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
