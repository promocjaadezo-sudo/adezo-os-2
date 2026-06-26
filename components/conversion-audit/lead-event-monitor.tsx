import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeadEventStat } from "@/lib/providers/analytics-ads/engines/conversion-audit-engine";

function dropBadge(dropPct: number) {
  if (dropPct > 40) return <Badge variant="danger">DROP {dropPct.toFixed(1)}%</Badge>;
  if (dropPct > 15) return <Badge variant="warning">DROP {dropPct.toFixed(1)}%</Badge>;
  return <Badge variant="success">OK</Badge>;
}

export function LeadEventMonitor({ events }: { events: LeadEventStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Lead Event Monitor</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">24h</th>
              <th className="py-2 pr-3">7d</th>
              <th className="py-2 pr-3">Prev 7d</th>
              <th className="py-2 pr-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.eventName} className="border-b border-border/60">
                <td className="py-2 pr-3 font-medium text-foreground">{event.eventName}</td>
                <td className="py-2 pr-3 text-muted-foreground">{event.count24h.toFixed(0)}</td>
                <td className="py-2 pr-3 text-muted-foreground">{event.count7d.toFixed(0)}</td>
                <td className="py-2 pr-3 text-muted-foreground">{event.countPrev7d.toFixed(0)}</td>
                <td className="py-2 pr-3">{dropBadge(event.dropPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
