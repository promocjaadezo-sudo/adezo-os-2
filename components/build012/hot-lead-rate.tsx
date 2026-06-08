import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/format";

export function HotLeadRate({ rate }: { rate: number }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Flame className="h-4 w-4 text-gold" /> HOT Lead Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-display font-semibold text-gold">{formatPercent(rate, 1)}</p>
        <Progress value={Math.min(100, rate)} className="h-2" />
        <p className="text-xs text-muted-foreground">Wskaźnik jakości leadów: HOT / wszystkie leady</p>
      </CardContent>
    </Card>
  );
}
