import { ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const REQUIRED_FIELDS = [
  "lead source",
  "lead temperature",
  "investment stage",
  "next step date",
  "commission status",
];

export function CriticalFieldsChecklist() {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ListChecks className="h-4 w-4 text-gold" /> Critical Fields Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {REQUIRED_FIELDS.map((field) => (
          <p key={field} className="rounded-md border border-border bg-background/40 px-3 py-2">{field}</p>
        ))}
      </CardContent>
    </Card>
  );
}
