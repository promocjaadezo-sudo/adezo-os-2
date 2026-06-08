import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CommissionReadinessStatus({
  ready,
  blockedLeads,
}: {
  ready: boolean;
  blockedLeads: number;
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wallet className="h-4 w-4 text-gold" /> Commission Readiness Status
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p>Status naliczenia prowizji: <span className={ready ? "text-success font-semibold" : "text-danger font-semibold"}>{ready ? "READY" : "BLOCKED"}</span></p>
        <p className="text-muted-foreground">Liczba leadów blokujących: {blockedLeads}</p>
      </CardContent>
    </Card>
  );
}
