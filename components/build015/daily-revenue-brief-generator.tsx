import { MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyRevenueBrief } from "@/lib/build015";

export function DailyRevenueBriefGenerator({ brief }: { brief: DailyRevenueBrief }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <MessageSquareText className="h-4 w-4 text-gold" /> Daily Revenue Brief Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Odpowiedź na dziś: <span className={brief.answer === "NIE" ? "text-danger font-semibold" : "text-success font-semibold"}>{brief.answer}</span></p>
        <p className="text-muted-foreground">{brief.summary}</p>
        <div className="space-y-1">
          {brief.whyNot.map((reason) => (
            <p key={reason} className="rounded-md border border-border bg-background/40 px-2 py-1 text-xs">{reason}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
