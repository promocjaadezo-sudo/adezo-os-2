import { Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { CompetitorLoss } from "@/lib/build017";

export function CompetitorLossBoard({ board }: { board: CompetitorLoss[] }) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Swords className="h-4 w-4 text-danger" /> Competitor Loss Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {board.map((entry) => (
          <div key={entry.competitor} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{entry.competitor}</p>
              <Badge variant={entry.losses >= 2 ? "danger" : "warning"}>{entry.losses} przegr.</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Modele: {entry.models.join(", ")} · Utracona wartość: {formatCurrency(entry.totalValue)}
            </p>
            <p className="mt-2 text-xs text-warning">Top powód: {entry.topReason}</p>
            <p className="mt-1 text-xs text-gold">Kontra: {entry.counterMove}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
