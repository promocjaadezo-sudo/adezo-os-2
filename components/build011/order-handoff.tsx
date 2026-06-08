import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { HandoffItem } from "@/lib/build011";

function handoffVariant(status: HandoffItem["status"]) {
  if (status === "completed") return "success" as const;
  if (status === "incomplete") return "warning" as const;
  return "danger" as const;
}

export function OrderHandoff({ items }: { items: HandoffItem[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ClipboardCheck className="h-4 w-4 text-gold" /> Order Handoff
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.orderId} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium">{item.orderId} · {item.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  Sales: {item.salesperson} → Production: {item.productionOwner}
                </p>
              </div>
              <Badge variant={handoffVariant(item.status)}>{item.status}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {item.missingFields.length === 0 ? (
                <span className="text-success">Komplet danych technicznych</span>
              ) : (
                item.missingFields.map((field) => (
                  <span key={`${item.orderId}-${field}`} className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-warning">
                    {field}
                  </span>
                ))
              )}
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">Aktualizacja: {formatDate(item.updatedAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
