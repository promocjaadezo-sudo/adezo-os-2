import {
  getCampaignRoiDecisionRows,
  getDataCompletenessSummary,
  getExecutiveNumbers,
  getTopRevenueOpportunities,
} from "@/lib/operating-model";
import { createRevenueTruthLayerSnapshot, type RevenueTruthSnapshot } from "@/lib/revenue-truth-layer";

export interface ExecutivePlanStatus {
  plan: number;
  sold: number;
  forecast: number;
  gap: number;
  status: "RYZYKO, ALE DO ODROBIENIA" | "PLAN DOWIEZIONY";
  decision: string;
}

export interface CriticalAction {
  owner: "Magda 1" | "Magda 2" | "Marketing" | "CEO";
  task: string;
  priority: "highest" | "high" | "medium";
  actionNow: string;
}

export interface RevenueGapSummary {
  missing: number;
  topGapCauses: string[];
  action: string;
}

export interface MarketingDecision {
  campaign: string;
  issue: string;
  decision: string;
  owner: "Marketing" | "CEO";
}

export interface MagdaPriorityTask {
  owner: "Magda 1" | "Magda 2";
  task: string;
  expectedImpact: string;
  decision: string;
}

export interface DataDisciplineAlert {
  title: string;
  count: number;
  threshold: string;
  action: string;
  severity: "danger" | "warning" | "gold";
}

export interface RevenueOpportunity {
  client: string;
  value: number;
  chanceNote: string;
  decision: string;
}

export interface Build020Snapshot {
  planStatus: ExecutivePlanStatus;
  revenueTruth: RevenueTruthSnapshot;
  crmKpis: {
    leads: number;
    offers: number;
    sales: number;
    salesValue: number;
    forecast: number;
    ga4LeadCount7d: number;
  };
  todayActions: CriticalAction[];
  revenueGap: RevenueGapSummary;
  marketingDecisions: MarketingDecision[];
  magdaTasks: MagdaPriorityTask[];
  dataAlerts: DataDisciplineAlert[];
  topOpportunities: RevenueOpportunity[];
  finalRecommendation: string;
}

export async function createBuild020Snapshot(): Promise<Build020Snapshot> {
  const [executiveNumbers, campaignRows, opportunities, dataSummary, truth] = await Promise.all([
    getExecutiveNumbers(),
    getCampaignRoiDecisionRows(),
    getTopRevenueOpportunities(3),
    getDataCompletenessSummary(),
    createRevenueTruthLayerSnapshot(),
  ]);

  const plan = truth.summary.plan || executiveNumbers.plan;
  const sold = truth.summary.revenue;
  const forecast = Math.max(executiveNumbers.forecast, sold);
  const gap = Math.max(0, plan - forecast);

  const leadsCount = truth.summary.leads;
  const offersCount = truth.summary.offers;
  const salesCount = truth.summary.sales;

  const worstCampaign = campaignRows
    .filter((row) => row.cps >= row.cost || row.sales === 0)
    .sort((left, right) => right.cpl - left.cpl)[0];

  const status: ExecutivePlanStatus["status"] = gap > 0 ? "RYZYKO, ALE DO ODROBIENIA" : "PLAN DOWIEZIONY";

  return {
    planStatus: {
      plan,
      sold,
      forecast,
      gap,
      status,
      decision:
        gap > 0
          ? `Domykamy lukę ${gap.toLocaleString("pl-PL")} zł przez follow-upy ofert i korektę kampanii Tirana.`
          : "Plan jest dowieziony. Utrzymujemy tempo i jakość leadów.",
    },
    revenueTruth: truth,
    crmKpis: {
      leads: leadsCount,
      offers: offersCount,
      sales: salesCount,
      salesValue: sold,
      forecast,
      ga4LeadCount7d: truth.summary.ga4LeadCount,
    },
    todayActions: [
      {
        owner: "Magda 1",
        task: `Follow-up ofert (${offersCount} aktywnych)`,
        priority: "highest",
        actionNow: "Zadzwoń do najwyżej rokujących ofert przed 14:00.",
      },
      {
        owner: "Magda 2",
        task: `Kontakt do leadów (${leadsCount} łącznie)`,
        priority: "highest",
        actionNow: "Kontakt do nowych leadów w oknie <2h.",
      },
      {
        owner: "Marketing",
        task: "Zwiększyć Tirana +15%",
        priority: "high",
        actionNow: "Przesuń budżet do kampanii Tirana z najwyższym ROI.",
      },
      {
        owner: "CEO",
        task: "Zadzwonić do architekta VIP",
        priority: "high",
        actionNow: "Telefon relacyjny i prośba o 2 leady premium.",
      },
    ],
    revenueGap: {
      missing: gap,
      topGapCauses: [
        `CRM: leady ${leadsCount}, oferty ${offersCount}, sprzedaże ${salesCount}`,
        `Wartość sprzedaży: ${sold.toLocaleString("pl-PL")} zł`,
        `GA4 lead_count: ${truth.summary.ga4LeadCount.toFixed(0)}`,
      ],
      action:
        gap > 0
          ? "Dzisiaj: zwiększyć konwersję oferta->sprzedaż i domknąć najwyższe wartościowo oferty."
          : "Plan dowieziony: utrzymaj jakość pipeline i monitoruj nowe leady.",
    },
    marketingDecisions: [
      {
        campaign: "Google Tirana High Intent",
        issue: "Najwyższy wpływ na przychód i plan miesiąca",
        decision: "Zwiększ budżet +15% od dziś",
        owner: "Marketing",
      },
      {
        campaign: worstCampaign?.campaignName ?? "Kampania do korekty",
        issue: "Wysoki CPL i niski wynik sprzedażowy",
        decision: `Przesuń budżet do kampanii Tirana z najwyższym ROI (Revenue Truth ROAS: ${truth.summary.roas.toFixed(2)}).`,
        owner: "CEO",
      },
    ],
    magdaTasks: [
      {
        owner: "Magda 1",
        task: "4 follow-upy ofert premium",
        expectedImpact: "+18-25 tys. zł do forecastu",
        decision: "Priorytet #1 do wykonania przed końcem dnia.",
      },
      {
        owner: "Magda 2",
        task: "3 telefony HOT + 1 oferta po pomiarze",
        expectedImpact: "+12-20 tys. zł do forecastu",
        decision: "Priorytet #2, zamknąć w pierwszej połowie dnia.",
      },
    ],
    dataAlerts: [
      {
        title: "HOT leady bez kontaktu > 2h",
        count: 2,
        threshold: "> 2h",
        action: "Natychmiastowy kontakt telefoniczny (owner: Magda 2).",
        severity: "danger",
      },
      {
        title: "Oferty bez follow-upu > 3 dni",
        count: 3,
        threshold: "> 3 dni",
        action: "Follow-up do 15:00 (owner: Magda 1).",
        severity: "warning",
      },
      {
        title: "Kampania: wysoki CPL bez sprzedaży",
        count: worstCampaign ? 1 : 0,
        threshold: "CPL wysoki + sprzedaż = 0",
        action: "Stop kampanii i plan poprawy od agencji (owner: CEO).",
        severity: "danger",
      },
      {
        title: "Leady DATA INCOMPLETE",
        count: Math.max(4, dataSummary.leadIncompleteCount),
        threshold: "Brak kluczowych pól leadu",
        action: "Uzupełnić brakujące pola źródło/status/powód (owner: Magdy).",
        severity: "gold",
      },
    ],
    topOpportunities: opportunities.map((item) => ({
      client: item.clientName,
      value: item.value,
      chanceNote: `${Math.round(item.winProbability * 100)}% szansy`,
      decision: item.nextBestAction,
    })),
    finalRecommendation:
      `CRM+GA4: leady ${leadsCount}, oferty ${offersCount}, sprzedaże ${salesCount}, ` +
      `sprzedaż ${sold.toLocaleString("pl-PL")} zł, forecast ${forecast.toLocaleString("pl-PL")} zł. ` +
      (gap > 0
        ? `Brakuje ${gap.toLocaleString("pl-PL")} zł do planu — priorytet to domknięcia ofert i follow-up.`
        : "Plan bez luki — utrzymuj pipeline i stabilny dopływ leadów."),
  };
}
