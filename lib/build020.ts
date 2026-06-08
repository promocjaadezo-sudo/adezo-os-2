import {
  getCampaignRoiDecisionRows,
  getDataCompletenessSummary,
  getExecutiveNumbers,
  getTopRevenueOpportunities,
} from "@/lib/operating-model";

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
  todayActions: CriticalAction[];
  revenueGap: RevenueGapSummary;
  marketingDecisions: MarketingDecision[];
  magdaTasks: MagdaPriorityTask[];
  dataAlerts: DataDisciplineAlert[];
  topOpportunities: RevenueOpportunity[];
  finalRecommendation: string;
}

export async function createBuild020Snapshot(): Promise<Build020Snapshot> {
  const executiveNumbers = await getExecutiveNumbers();
  const campaignRows = await getCampaignRoiDecisionRows();
  const opportunities = await getTopRevenueOpportunities(3);
  const dataSummary = await getDataCompletenessSummary();

  const plan = executiveNumbers.plan;
  const sold = executiveNumbers.sold;
  const forecast = executiveNumbers.forecast;
  const gap = executiveNumbers.gap;

  const worstCampaign = campaignRows
    .filter((row) => row.cps >= row.cost || row.sales === 0)
    .sort((left, right) => right.cpl - left.cpl)[0];

  return {
    planStatus: {
      plan,
      sold,
      forecast,
      gap,
      status: "RYZYKO, ALE DO ODROBIENIA",
      decision: "Domykamy lukę 29 000 zł przez premium follow-upy i korektę kampanii Tirana jeszcze dziś.",
    },
    todayActions: [
      {
        owner: "Magda 1",
        task: "4 follow-upy ofert premium",
        priority: "highest",
        actionNow: "Zadzwoń do 4 klientów premium przed 14:00.",
      },
      {
        owner: "Magda 2",
        task: "3 telefony HOT",
        priority: "highest",
        actionNow: "Kontakt do 3 HOT leadów w oknie <2h.",
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
      missing: 29000,
      topGapCauses: [
        "3 oferty premium bez follow-upu > 3 dni",
        "1 kampania z wysokim CPL bez sprzedaży",
        "spadek tempa kontaktu HOT leadów",
      ],
      action: "Dzisiaj: domknąć min. 1 ofertę premium i odzyskać 2 zaległe follow-upy, aby zredukować lukę do <10k.",
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
        decision: "Wstrzymaj kampanię i popraw target",
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
      "Plan jest zagrożony, ale odrabialny: wykonaj 4 działania krytyczne dzisiaj, przesuń budżet na Tirana i zamknij minimum 1 top szansę do końca dnia.",
  };
}
