import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastConfidenceEngine } from "@/lib/build015";

export function ForecastConfidenceEnginePanel({ data }: { data: ForecastConfidenceEngine }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldCheck className="h-4 w-4 text-gold" /> Forecast Confidence Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">Pewność forecastu: <span className="text-gold font-semibold">{data.confidencePct}%</span></p>
        <p className="text-sm">Poziom ryzyka: <span className="font-medium">{data.riskLevel}</span></p>
        <div className="space-y-1 text-xs text-muted-foreground">
          {data.confidenceDrivers.map((item) => (
            <p key={item} className="rounded-md border border-border bg-background/40 px-2 py-1">{item}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
