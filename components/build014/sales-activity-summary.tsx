import { Activity } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Build014Snapshot } from "@/lib/build014";

export function SalesActivitySummary({
  activity,
  overdueOwners,
}: {
  activity: Build014Snapshot["activitySummary"];
  overdueOwners: Build014Snapshot["overdueOwners"];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Sales Activity Summary</h2>
      </div>

      <KpiGrid className="lg:grid-cols-2">
        {activity.map((item) => (
          <KpiCard
            key={item.owner}
            title={item.owner}
            value={`${item.actionsDoneToday}`}
            subtitle={`Telefony: ${item.callsDone} · Follow-upy: ${item.followupsDone}`}
            variant="gold"
          />
        ))}
      </KpiGrid>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="text-base">Kto zalega z kontaktem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overdueOwners.map((item) => (
            <div key={item.owner} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
              <span>{item.owner}</span>
              <span className="text-danger font-semibold">{item.overdueCount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
