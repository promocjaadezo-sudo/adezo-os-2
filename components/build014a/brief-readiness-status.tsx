import { FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesOwner } from "@/lib/build014a";

export function BriefReadinessStatus({
  ready,
  blockedOwners,
}: {
  ready: boolean;
  blockedOwners: SalesOwner[];
}) {
  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <FileWarning className="h-4 w-4 text-warning" /> Brief Readiness Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Daily Brief handlowców: <span className={ready ? "text-success font-semibold" : "text-warning font-semibold"}>{ready ? "READY" : "PARTIAL / BLOCKED"}</span></p>
        <p className="text-muted-foreground">Zablokowani: {blockedOwners.length > 0 ? blockedOwners.join(", ") : "—"}</p>
      </CardContent>
    </Card>
  );
}
