import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();

  if (lower.includes("wygr") || lower.includes("won") || lower === "done") {
    return <Badge variant="success">{status}</Badge>;
  }
  if (lower.includes("przegr") || lower.includes("lost") || lower === "cancelled") {
    return <Badge variant="danger">{status}</Badge>;
  }
  if (lower === "open" || lower === "new" || lower.includes("draft")) {
    return <Badge variant="gold">{status}</Badge>;
  }
  if (lower === "hot" || lower === "critical") {
    return <Badge variant="danger">{status}</Badge>;
  }
  if (lower === "warm" || lower === "high") {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (lower === "cold" || lower === "low") {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, "danger" | "warning" | "gold" | "secondary"> = {
    critical: "danger",
    high: "warning",
    medium: "gold",
    low: "secondary",
  };
  return (
    <Badge variant={map[priority] ?? "outline"} className="capitalize">
      {priority}
    </Badge>
  );
}

export function TemperatureBadge({
  temperature,
}: {
  temperature: string | null;
}) {
  if (!temperature) return <span className="text-muted-foreground">—</span>;
  const map: Record<string, "danger" | "warning" | "secondary"> = {
    hot: "danger",
    warm: "warning",
    cold: "secondary",
  };
  return (
    <Badge variant={map[temperature] ?? "outline"} className="capitalize">
      {temperature}
    </Badge>
  );
}
