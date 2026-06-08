import {
  Award,
  TrendingUp,
  Users,
  Skull,
  Droplets,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData, computeCeoScore } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { CeoScoreRing } from "@/components/kpi/ceo-score-ring";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Progress } from "@/components/ui/progress";

export default async function CeoScorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (user && !isCeo) {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);
  const { kpi, moneyLeak } = data;

  const score = computeCeoScore(kpi, moneyLeak);

  const pipelineRatio =
    kpi.active_pipeline > 0
      ? (kpi.weighted_pipeline / kpi.active_pipeline) * 100
      : 0;
  const conversionRate =
    kpi.total_leads > 0 ? (kpi.total_offers / kpi.total_leads) * 100 : 0;
  const deadLeadPenalty =
    kpi.total_leads > 0 ? (kpi.dead_leads / kpi.total_leads) * 100 : 0;
  const totalRevenue = kpi.closed_sales + kpi.active_pipeline;
  const leakRatio =
    totalRevenue > 0
      ? ((moneyLeak.lost_value + moneyLeak.dead_leads_value) / totalRevenue) *
        100
      : 0;

  const components = [
    {
      label: "Jakość lejka",
      value: pipelineRatio,
      weight: 25,
      icon: TrendingUp,
      description: "Stosunek lejka ważonego do aktywnego",
    },
    {
      label: "Konwersja leadów",
      value: conversionRate,
      weight: 25,
      icon: Users,
      description: "Oferty utworzone na leada",
    },
    {
      label: "Zdrowie leadów",
      value: 100 - deadLeadPenalty,
      weight: 25,
      icon: Skull,
      description: "Odwrotność wskaźnika martwych leadów",
    },
    {
      label: "Ochrona przychodów",
      value: 100 - Math.min(leakRatio, 100),
      weight: 25,
      icon: Droplets,
      description: "Odwrotność wskaźnika wycieku pieniędzy",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Wynik CEO"
        description="Zbiorczy wskaźnik kondycji operacji sprzedażowych."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8 border-gold/20">
          <CardContent className="flex flex-col items-center">
            <CeoScoreRing score={score} size={220} />
            <p className="text-sm text-muted-foreground mt-6 text-center max-w-xs">
              Wskaźnik zbiorczy obliczany na podstawie jakości lejka, współczynnika konwersji, zdrowia leadów i poziomu ochrony przychodów.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {components.map((comp) => (
            <Card key={comp.label} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
                      <comp.icon className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comp.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {comp.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatPercent(Math.max(0, Math.min(100, comp.value)), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Waga: {comp.weight}%
                    </p>
                  </div>
                </div>
                <Progress
                  value={Math.max(0, Math.min(100, comp.value))}
                  className="h-2"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Zamknięta sprzedaż"
          value={formatCurrency(kpi.closed_sales)}
          icon={Award}
          variant="gold"
        />
        <KpiCard
          title="Aktywny lejek"
          value={formatCurrency(kpi.active_pipeline)}
          icon={TrendingUp}
        />
        <KpiCard
          title="Martwe leady"
          value={formatNumber(kpi.dead_leads)}
          icon={Skull}
          variant="danger"
        />
        <KpiCard
          title="Wyciek pieniędzy"
          value={formatCurrency(
            moneyLeak.lost_value +
              moneyLeak.dead_leads_value +
              moneyLeak.overdue_offers_value
          )}
          icon={Droplets}
          variant="warning"
        />
      </KpiGrid>
    </div>
  );
}
