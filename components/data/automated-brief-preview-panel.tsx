import { Bot, Clock3, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AutomatedRevenueBriefSnapshot } from "@/lib/automated-revenue-brief-engine";
import { formatCurrency } from "@/lib/format";

function priorityVariant(priority: "critical" | "high" | "medium") {
  if (priority === "critical") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "gold" as const;
}

export function AutomatedBriefPreviewPanel({ snapshot }: { snapshot: AutomatedRevenueBriefSnapshot }) {
  return (
    <div className="space-y-6">
      <Card className="border-gold/30 bg-card/90 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-gold">
            <Bot className="h-4 w-4" /> Automated Revenue Brief Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Status planu</p>
            <p className="mt-1 text-sm font-semibold text-gold">{snapshot.planStatus}</p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Przychód / Plan</p>
            <p className="mt-1 text-sm font-semibold">
              {formatCurrency(snapshot.truth.summary.revenue)} / {formatCurrency(snapshot.truth.summary.plan)}
            </p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">ROAS / GAP</p>
            <p className="mt-1 text-sm font-semibold">
              {snapshot.truth.summary.roas.toFixed(2)} / {formatCurrency(snapshot.truth.summary.gapToPlan)}
            </p>
          </div>
          <div className="rounded-lg border border-gold/20 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Źródła danych</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {snapshot.sourceOfTruth.map((source) => (
                <Badge key={source} variant="gold">{source}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {snapshot.briefs.map((brief) => (
          <Card key={brief.recipient} className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 font-display text-base">
                <span>{brief.recipient} Brief</span>
                <Badge variant={snapshot.planStatus === "PLAN AT RISK" ? "warning" : "success"}>{brief.planStatus}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <p className="flex items-center gap-1 text-muted-foreground"><TriangleAlert className="h-3.5 w-3.5 text-warning" /> Największe ryzyko</p>
                <p className="mt-1 font-medium text-foreground">{brief.biggestRisk}</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                <p className="flex items-center gap-1 text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-gold" /> Największa szansa</p>
                <p className="mt-1 font-medium text-foreground">{brief.biggestOpportunity}</p>
              </div>

              <div className="space-y-2">
                {brief.tasksToday.length ? brief.tasksToday.map((task) => (
                  <div key={task.id} className="rounded-md border border-border/70 bg-background/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{task.task}</p>
                      <Badge variant={priorityVariant(task.priority)}>{task.priority.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Właściciel: {task.owner}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Deadline: {task.deadline}</p>
                    <p className="mt-1 text-xs text-gold">Efekt: {task.expectedEffect}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Źródła: {task.dataSources.join(" / ")}</p>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">Brak zadań krytycznych na dziś.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
