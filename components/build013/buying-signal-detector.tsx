import { Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BuyingSignalDetector({ signals }: { signals: Array<{ signal: string; count: number }> }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Radar className="h-4 w-4 text-gold" /> Buying Signal Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {signals.map((item) => (
          <div key={item.signal} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
            <span>{item.signal}</span>
            <span className="text-gold font-medium">{item.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
