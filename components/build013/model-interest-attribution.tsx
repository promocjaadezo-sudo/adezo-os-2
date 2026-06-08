import { DoorOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModelInterestAttribution({
  data,
}: {
  data: Array<{ model: string; leads: number; hotLeads: number; avgScore: number }>;
}) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <DoorOpen className="h-4 w-4 text-gold" /> Model Interest Attribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.model} className="rounded-lg border border-border bg-background/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.model}</p>
              <p className="text-gold">Avg score: {item.avgScore.toFixed(1)}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leady: {item.leads} · HOT: {item.hotLeads}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
