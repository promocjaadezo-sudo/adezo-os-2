import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CeoFinalRecommendation({ recommendation }: { recommendation: string }) {
  return (
    <Card className="border-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Crown className="h-4 w-4 text-gold" /> CEO Final Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gold">Decyzja końcowa: {recommendation}</p>
      </CardContent>
    </Card>
  );
}
