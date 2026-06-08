export interface RevenueGapAnalyzer {
  plan: number;
  sold: number;
  forecast: number;
  gap: number;
  willDeliverPlan: boolean;
  primaryCause: string;
  missingWhat: string;
}

export interface ForecastConfidenceEngine {
  confidencePct: number;
  riskLevel: "high" | "medium" | "low";
  confidenceDrivers: string[];
}

export interface DailyRevenueBrief {
  answer: "TAK" | "NIE";
  summary: string;
  whyNot: string[];
}

export interface AiRecommendation {
  id: string;
  owner: string;
  action: string;
  target: string;
  expectedLift: number;
  priority: "critical" | "high" | "medium";
}

export interface NextBestAction {
  owner: string;
  whatToDoNow: string;
  whyNow: string;
  successMetric: string;
}

export interface RecoveryScenario {
  scenario: string;
  fromForecast: number;
  toForecast: number;
  delta: number;
  chanceToCloseGapPct: number;
}

export interface PriorityLead {
  clientName: string;
  model: "Tirana" | "Astana" | "Chaga" | "Waleta";
  owner: "Magda 1" | "Magda 2";
  reason: string;
  expectedValue: number;
}

export interface Build015Snapshot {
  gap: RevenueGapAnalyzer;
  confidence: ForecastConfidenceEngine;
  brief: DailyRevenueBrief;
  recommendations: AiRecommendation[];
  nextActions: NextBestAction[];
  recoveryScenarios: RecoveryScenario[];
  priorityLeads: PriorityLead[];
  revenueRisks: Array<{
    title: string;
    description: string;
    severity: "danger" | "warning" | "gold";
    owner: string;
  }>;
}

export function createBuild015Snapshot(): Build015Snapshot {
  const plan = 400000;
  const sold = 235000;
  const forecast = 348000;
  const gap = Math.max(0, plan - forecast);
  const willDeliverPlan = forecast >= plan;

  const gapAnalyzer: RevenueGapAnalyzer = {
    plan,
    sold,
    forecast,
    gap,
    willDeliverPlan,
    primaryCause: "Za mało HOT leadów.",
    missingWhat: "Brakuje HOT leadów, pomiarów i follow-upów domykających.",
  };

  const confidence: ForecastConfidenceEngine = {
    confidencePct: 58,
    riskLevel: "medium",
    confidenceDrivers: [
      "Spadek HOT lead rate względem poprzedniego tygodnia.",
      "Za mało pomiarów do leadów premium.",
      "Część ofert czeka na follow-up > 3 dni.",
    ],
  };

  const brief: DailyRevenueBrief = {
    answer: willDeliverPlan ? "TAK" : "NIE",
    summary: willDeliverPlan
      ? "Dowieziemy plan miesiąca przy utrzymaniu bieżącego tempa."
      : "Nie dowieziemy planu bez natychmiastowych działań sprzedażowo-marketingowych.",
    whyNot: [
      "Za mało HOT leadów.",
      "Za mało pomiarów.",
      "Za mało follow-upów.",
    ],
  };

  const recommendations: AiRecommendation[] = [
    {
      id: "R-1",
      owner: "Marketing",
      action: "+6 HOT leadów",
      target: "Dowiezienie +6 HOT leadów z kampanii high-intent",
      expectedLift: 37000,
      priority: "critical",
    },
    {
      id: "R-2",
      owner: "Magda 2",
      action: "+3 pomiary",
      target: "Leady premium z szybkim terminem decyzji",
      expectedLift: 21000,
      priority: "high",
    },
    {
      id: "R-3",
      owner: "Magda 1 + Marketing",
      action: "+2 sprzedaże Tirana",
      target: "Oferty Tirana w negocjacji",
      expectedLift: 66000,
      priority: "critical",
    },
    {
      id: "R-4",
      owner: "Magda 1 + Magda 2",
      action: "Odzyskać 2 utracone leady",
      target: "Leady z konkurencyjną wyceną",
      expectedLift: 15000,
      priority: "high",
    },
  ];

  const nextActions: NextBestAction[] = [
    {
      owner: "Marketing",
      whatToDoNow: "Podnieść budżet Tirana o 20% i włączyć tylko high-intent grupy",
      whyNow: "Najkrótsza droga do pozyskania brakujących HOT leadów",
      successMetric: "+6 HOT leadów do końca tygodnia",
    },
    {
      owner: "Magda 1",
      whatToDoNow: "Domknąć follow-upy ofert Tirana i zamknąć 2 sprzedaże",
      whyNow: "Największy jednorazowy impact na forecast",
      successMetric: "+2 sprzedaże Tirana",
    },
    {
      owner: "Magda 2",
      whatToDoNow: "Umówić +3 pomiary dla leadów premium",
      whyNow: "Zwiększa prawdopodobieństwo przejścia do finalnej oferty",
      successMetric: "3 potwierdzone terminy pomiarów",
    },
  ];

  const recoveryScenarios: RecoveryScenario[] = [
    {
      scenario: "+ 6 HOT leadów",
      fromForecast: 348000,
      toForecast: 385000,
      delta: 37000,
      chanceToCloseGapPct: 71,
    },
    {
      scenario: "+ 3 sprzedaże Tirana",
      fromForecast: 348000,
      toForecast: 414000,
      delta: 66000,
      chanceToCloseGapPct: 100,
    },
    {
      scenario: "+ 2 pomiary tygodniowo",
      fromForecast: 348000,
      toForecast: 392000,
      delta: 44000,
      chanceToCloseGapPct: 85,
    },
  ];

  const priorityLeads: PriorityLead[] = [
    {
      clientName: "Kamil Nowak",
      model: "Tirana",
      owner: "Magda 1",
      reason: "HOT + konkurencja + budżet premium",
      expectedValue: 72000,
    },
    {
      clientName: "Alicja Wrona",
      model: "Tirana",
      owner: "Magda 2",
      reason: "HOT + szybki termin decyzji",
      expectedValue: 68000,
    },
    {
      clientName: "Anna Zaremba",
      model: "Astana",
      owner: "Magda 1",
      reason: "Wysoki potencjał i brak finalnego follow-upu",
      expectedValue: 51000,
    },
  ];

  const revenueRisks: Build015Snapshot["revenueRisks"] = [
    {
      title: "HOT lead bez kontaktu",
      description: "HOT lead czeka bez telefonu ponad 2h.",
      severity: "danger",
      owner: "Magda 1",
    },
    {
      title: "Oferta bez follow-up",
      description: "Oferty bez reakcji handlowca > 3 dni.",
      severity: "warning",
      owner: "Magda 2",
    },
    {
      title: "Spadek HOT lead rate",
      description: "Jakość leadów spadła względem benchmarku tygodniowego.",
      severity: "warning",
      owner: "Marketing",
    },
    {
      title: "Spadek forecastu",
      description: "Forecast tygodniowy spadł względem poprzedniego checkpointu.",
      severity: "danger",
      owner: "CEO + Revenue Ops",
    },
    {
      title: "Kampania o słabej jakości",
      description: "Kampania generuje leady o niskiej konwersji do HOT.",
      severity: "gold",
      owner: "Agencja Performance",
    },
  ];

  return {
    gap: gapAnalyzer,
    confidence,
    brief,
    recommendations,
    nextActions,
    recoveryScenarios,
    priorityLeads,
    revenueRisks,
  };
}
