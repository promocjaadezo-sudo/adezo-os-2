import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DataProviderStatus } from "@/lib/providers/data-provider";

export function ProviderStatusPanel({ status }: { status: DataProviderStatus }) {
  const isFallback = status.syncState === "fallback-mock";

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Database className="h-4 w-4 text-gold" /> Provider Status Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Provider żądany: <Badge variant="gold">{status.provider}</Badge>
        </p>
        <p className="text-xs text-muted-foreground">
          Provider aktywny: <Badge variant={isFallback ? "warning" : "gold"}>{status.resolvedProvider}</Badge>
        </p>
        <p className="text-xs text-muted-foreground">
          Status sync: <Badge variant={isFallback ? "warning" : "gold"}>{status.syncState}</Badge>
        </p>
        <p className="text-xs text-muted-foreground">Liczba rekordów: {status.recordCounts.total}</p>
        <p className="text-xs text-muted-foreground">DATA INCOMPLETE — wiersze: {status.incompleteRows}, pola: {status.incompleteFields}</p>
        <p className="text-xs text-muted-foreground">Ostatnia synchronizacja: {new Date(status.lastSyncAt).toLocaleString("pl-PL")}</p>
        <p className="text-xs text-muted-foreground">Komunikat: {status.message}</p>
        {status.errors.length > 0 ? (
          <div className="rounded-md border border-warning/40 bg-warning/5 p-2">
            <p className="text-xs font-medium text-warning">Błędy importu (CEO):</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {status.errors.slice(0, 5).map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
