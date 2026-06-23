import { AlertTriangle, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { TaskExecutionSnapshot } from "@/lib/task-execution-engine";

function statusVariant(status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "OVERDUE") {
  if (status === "DONE") return "success" as const;
  if (status === "OVERDUE") return "danger" as const;
  if (status === "BLOCKED") return "warning" as const;
  if (status === "IN_PROGRESS") return "gold" as const;
  return "secondary" as const;
}

export function TaskExecutionPanel({ snapshot }: { snapshot: TaskExecutionSnapshot }) {
  return (
    <div className="space-y-6">
      <Card className="border-gold/30 bg-card/90 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-gold">
            <ListChecks className="h-4 w-4" /> Task Execution Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Status planu</p>
            <p className="mt-1 text-sm font-semibold text-gold">{snapshot.planStatus}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Statusy</p>
            <p className="mt-1 text-sm font-semibold">TODO {snapshot.summary.todo} · IN_PROGRESS {snapshot.summary.inProgress}</p>
            <p className="text-xs text-muted-foreground">DONE {snapshot.summary.done} · BLOCKED {snapshot.summary.blocked} · OVERDUE {snapshot.summary.overdue}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Forecast at risk</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(snapshot.summary.totalAtRisk)}</p>
            <p className="text-xs text-muted-foreground">Overdue: {formatCurrency(snapshot.summary.overdueAtRisk)}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Blocked at risk</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(snapshot.summary.blockedAtRisk)}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Done realized</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(snapshot.summary.doneRealized)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="h-4 w-4 text-gold" /> Wpływ na forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{snapshot.forecastImpactNote}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Overdue & CEO Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.alerts.length ? snapshot.alerts.map((alert) => (
              <div key={alert.id} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.level === "critical" ? "danger" : alert.level === "risk" ? "warning" : "gold"}>
                    {alert.level.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{alert.description}</p>
              </div>
            )) : <p className="text-xs text-muted-foreground">Brak alertów overdue.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-gold" /> Walidacja wykonania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.validationIssues.length ? snapshot.validationIssues.map((issue) => (
              <div key={issue.id} className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{issue.message}</p>
                  <Badge variant={issue.level === "critical" ? "danger" : "warning"}>{issue.level.toUpperCase()}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">Task ID: {issue.taskId}</p>
              </div>
            )) : <p className="text-xs text-muted-foreground">Walidacja OK: DONE ma outcome, BLOCKED ma reason, sale_lost ma lost_reason.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-base">Task Status Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.tasks.slice(0, 18).map((task) => (
            <div key={task.id} className="rounded-md border border-border/70 bg-background/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{task.title}</p>
                <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Owner: {task.owner} · Deadline: {new Date(task.deadlineAt).toLocaleString("pl-PL")} · Rule: {task.ruleCode}
              </p>
              <p className="mt-1 text-xs text-gold">
                Outcome: {task.outcome || "—"} · Impact: {formatCurrency(task.forecastDelta)} · Value: {formatCurrency(task.valueAtRisk)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Źródła: {task.dataSources.join(" / ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
