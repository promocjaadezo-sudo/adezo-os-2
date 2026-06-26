import { AlertTriangle, ListChecks, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CrmMissingFieldsReport } from "@/lib/crm-missing-fields-report";
import type { DataTrustActionPlan } from "@/lib/data-trust-action-list";

export function CrmCleanupPriorityPanel({
  report,
  plan,
}: {
  report: CrmMissingFieldsReport;
  plan: DataTrustActionPlan;
}) {
  const topGroups = report.grouped.filter((item) => item.count > 0).slice(0, 5);

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wrench className="h-4 w-4 text-gold" /> CRM Cleanup Priority
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">Rekordy do poprawy</p>
            <p className="mt-1 font-semibold">{report.recordsToFix}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">Źródło CRM</p>
            <p className="mt-1 font-semibold">{report.sourceFile || "brak"}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">Potencjał odzysku trust</p>
            <p className="mt-1 font-semibold">+{plan.recoverablePointsFromCrm} pkt</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Top 5 pól psujących Data Trust
          </p>
          <div className="space-y-2">
            {topGroups.length > 0 ? (
              topGroups.map((group) => (
                <div key={group.field} className="rounded-md border border-border/60 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p>{group.label}</p>
                    <Badge variant="warning">{group.count}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Rekordy: {group.records.slice(0, 5).join(", ")}
                    {group.records.length > 5 ? " ..." : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Brak wykrytych braków CRM.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border/70 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" /> DATA TRUST ACTION LIST
          </p>
          <ol className="space-y-2 text-xs">
            {plan.actions.slice(0, 5).map((action, index) => (
              <li key={action.field} className="rounded-md border border-border/60 p-2">
                {index + 1}. Uzupełnij {action.label} w {action.recordsToFix} rekordach: +{action.recoverablePoints} pkt
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-border/70 p-3 text-xs">
          <p className="font-medium text-foreground">Minimalny zestaw poprawek do 70%</p>
          {plan.minimalSetToTarget.length > 0 ? (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {plan.minimalSetToTarget.map((item) => (
                <li key={`min-${item.field}`}>- {item.label}: {item.recordsToFix} rekordów, +{item.recoverablePoints} pkt</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">Brak akcji wymaganych - cel już osiągnięty.</p>
          )}

          {!plan.canReachTargetWithCrmOnly && plan.blockers.length > 0 ? (
            <div className="mt-3 rounded-md border border-warning/40 bg-warning/5 p-2 text-warning">
              {plan.blockers[0]}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
