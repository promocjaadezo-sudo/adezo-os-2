import { MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ObjectionPattern } from "@/lib/build017";

export function ObjectionPatternAnalyzer({ patterns }: { patterns: ObjectionPattern[] }) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <MessageSquareWarning className="h-4 w-4 text-warning" /> Objection Pattern Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map((pattern) => (
          <div key={pattern.objection} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">„{pattern.objection}”</p>
              <Badge variant={pattern.count >= 2 ? "warning" : "gold"}>x{pattern.count}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Źródło przegranej: {pattern.relatedReason}</p>
            <p className="mt-2 text-xs text-gold">Argument na następną rozmowę: {pattern.recommendation}</p>
            {pattern.marketingSignal && <p className="mt-2 text-xs text-warning">{pattern.marketingSignal}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
