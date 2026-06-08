import { Factory } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProductionOrder } from "@/lib/build011";

function statusVariant(status: ProductionOrder["status"]) {
  if (status === "blocked") return "danger" as const;
  if (status === "in_progress") return "warning" as const;
  if (status === "ready_for_dispatch") return "success" as const;
  return "gold" as const;
}

function priorityVariant(priority: ProductionOrder["priority"]) {
  if (priority === "critical") return "danger" as const;
  if (priority === "high") return "warning" as const;
  if (priority === "medium") return "gold" as const;
  return "default" as const;
}

export function ProductionQueue({ orders }: { orders: ProductionOrder[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Factory className="h-4 w-4 text-gold" /> Production Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            {
              key: "order",
              header: "Zamówienie",
              cell: (order: ProductionOrder) => (
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.clientName}</p>
                </div>
              ),
            },
            {
              key: "model",
              header: "Model",
              cell: (order: ProductionOrder) => order.modelName,
            },
            {
              key: "status",
              header: "Status",
              cell: (order: ProductionOrder) => <Badge variant={statusVariant(order.status)}>{order.status}</Badge>,
            },
            {
              key: "priority",
              header: "Priorytet",
              cell: (order: ProductionOrder) => <Badge variant={priorityVariant(order.priority)}>{order.priority}</Badge>,
            },
            {
              key: "deadline",
              header: "Termin",
              cell: (order: ProductionOrder) => formatDate(order.deadline),
            },
            {
              key: "value",
              header: "Wartość",
              cell: (order: ProductionOrder) => formatCurrency(order.estimatedValue),
            },
          ]}
          data={orders}
          emptyMessage="Brak zamówień w kolejce produkcyjnej."
        />
      </CardContent>
    </Card>
  );
}
