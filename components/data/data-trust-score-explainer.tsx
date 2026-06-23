import { BarChart3, Gauge, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataTrustActionPlan } from "@/lib/data-trust-action-list";
import type { LiveDataStatusSnapshot } from "@/lib/live-data-status";

export function DataTrustScoreExplainer({
  live,
  plan,
}: {
  live: LiveDataStatusSnapshot;
  plan: DataTrustActionPlan;
}) {
  const trustVariant = live.dataTrustScore < 70 ? "warning" : "success";

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Gauge className="h-4 w-4 text-gold" /> Data Trust Score Explainer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Aktualny Data Trust</p>
          <Badge variant={trustVariant}>{live.dataTrustScore}%</Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <p className="rounded-md border border-border/60 px-2 py-2">CRM completeness: {live.completeness.crm}%</p>
          <p className="rounded-md border border-border/60 px-2 py-2">GA4 completeness: {live.completeness.ga4}%</p>
          <p className="rounded-md border border-border/60 px-2 py-2">Ads completeness: {live.completeness.ads}%</p>
        </div>

        <div className="rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <BarChart3 className="h-3.5 w-3.5" /> Jak liczony jest wynik
          </p>
          <p className="mt-1">Data Trust = średnia z trzech filarów: CRM, GA4, Ads (0-100 każdy).</p>
        </div>

        <div className="rounded-lg border border-border/70 p-3 text-xs">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Potencjał po cleanup CRM
          </p>
          <p className="mt-1 text-muted-foreground">
            Możliwy odzysk po samym CRM: +{plan.recoverablePointsFromCrm} pkt. Prognoza po cleanup CRM: {plan.projectedScoreAfterCrmFix}%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
