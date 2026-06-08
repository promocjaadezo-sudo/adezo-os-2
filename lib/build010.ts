export type AlarmSeverity = "danger" | "warning" | "gold";

export interface RevenuePipelineStage {
  stage: string;
  deals: number;
  value: number;
  weightedValue: number;
  conversionToNextPct: number;
}

export interface ForecastSnapshot {
  label: string;
  plan: number;
  closed: number;
  weightedPipeline: number;
  forecast: number;
  executionPct: number;
  gap: number;
}

export interface PlanExecutionPoint {
  period: string;
  plan: number;
  execution: number;
}

export interface WinRateSnapshot {
  wonDeals: number;
  lostDeals: number;
  activeDeals: number;
  winRatePct: number;
  avgWonDealValue: number;
  salesEffectivenessPct: number;
}

export interface LostDealReason {
  reason: string;
  deals: number;
  value: number;
  sharePct: number;
  recommendation: string;
}

export interface OwnerAlarm {
  title: string;
  description: string;
  severity: AlarmSeverity;
  metric: string;
}

export interface Build010Snapshot {
  monthForecast: ForecastSnapshot;
  quarterForecast: ForecastSnapshot;
  planVsExecution: PlanExecutionPoint[];
  revenuePipeline: RevenuePipelineStage[];
  winRate: WinRateSnapshot;
  lostDealReasons: LostDealReason[];
  alarms: OwnerAlarm[];
}

const MOCK_PIPELINE_BASE: RevenuePipelineStage[] = [
  {
    stage: "Nowe leady",
    deals: 58,
    value: 2290000,
    weightedValue: 572500,
    conversionToNextPct: 61,
  },
  {
    stage: "Discovery",
    deals: 35,
    value: 1810000,
    weightedValue: 814500,
    conversionToNextPct: 49,
  },
  {
    stage: "Oferta wysłana",
    deals: 17,
    value: 1230000,
    weightedValue: 861000,
    conversionToNextPct: 41,
  },
  {
    stage: "Negocjacje",
    deals: 8,
    value: 740000,
    weightedValue: 555000,
    conversionToNextPct: 37,
  },
  {
    stage: "Domknięcie",
    deals: 3,
    value: 320000,
    weightedValue: 288000,
    conversionToNextPct: 100,
  },
];

const MOCK_LOST_REASONS: Array<Omit<LostDealReason, "sharePct">> = [
  {
    reason: "Cena / budżet klienta",
    deals: 11,
    value: 418000,
    recommendation: "Wzmocnij pakiety wartości i alternatywy finansowania.",
  },
  {
    reason: "Brak follow-up po ofercie",
    deals: 7,
    value: 236000,
    recommendation: "Wymuś SLA follow-up do 24h od wysłania oferty.",
  },
  {
    reason: "Wygrana konkurencji",
    deals: 6,
    value: 281000,
    recommendation: "Dodaj sekcję przewag konkurencyjnych do playbooka.",
  },
  {
    reason: "Niedopasowanie modelu",
    deals: 4,
    value: 144000,
    recommendation: "Uruchom check-listę potrzeb przed ofertowaniem.",
  },
];

function toForecast(label: string, plan: number, closed: number, weightedPipeline: number): ForecastSnapshot {
  const forecast = closed + weightedPipeline;
  const executionPct = Math.min(100, (forecast / Math.max(plan, 1)) * 100);
  const gap = Math.max(0, plan - forecast);

  return {
    label,
    plan,
    closed,
    weightedPipeline,
    forecast,
    executionPct,
    gap,
  };
}

function getQuarterLabel(now: Date): string {
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
}

export function createBuild010Snapshot(): Build010Snapshot {
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const quarterLabel = getQuarterLabel(now);

  const monthForecast = toForecast(monthLabel, 1200000, 462000, 534000);
  const quarterForecast = toForecast(quarterLabel, 3600000, 1410000, 1375000);

  const planVsExecution: PlanExecutionPoint[] = [
    { period: "M-2", plan: 980000, execution: 891000 },
    { period: "M-1", plan: 1100000, execution: 1014000 },
    { period: "M", plan: monthForecast.plan, execution: monthForecast.forecast },
  ];

  const revenuePipeline = MOCK_PIPELINE_BASE;

  const wonDeals = 23;
  const lostDeals = 28;
  const activeDeals = revenuePipeline.reduce((sum, stage) => sum + stage.deals, 0);
  const winRatePct = (wonDeals / Math.max(1, wonDeals + lostDeals)) * 100;
  const avgWonDealValue = 1410000 / wonDeals;
  const salesEffectivenessPct = winRatePct * 0.6 + (monthForecast.executionPct / 100) * 40;

  const winRate: WinRateSnapshot = {
    wonDeals,
    lostDeals,
    activeDeals,
    winRatePct,
    avgWonDealValue,
    salesEffectivenessPct,
  };

  const totalLostDeals = MOCK_LOST_REASONS.reduce((sum, item) => sum + item.deals, 0);
  const lostDealReasons: LostDealReason[] = MOCK_LOST_REASONS.map((item) => ({
    ...item,
    sharePct: (item.deals / Math.max(totalLostDeals, 1)) * 100,
  })).sort((a, b) => b.deals - a.deals);

  const alarms: OwnerAlarm[] = [];

  if (monthForecast.gap > 200000) {
    alarms.push({
      title: "Ryzyko niedowiezienia planu miesięcznego",
      description: "Forecast miesiąca pokazuje lukę względem planu. Potrzebna akcja na górze lejka i w negocjacjach.",
      severity: "danger",
      metric: `${Math.round(monthForecast.gap / 1000)} tys. PLN`,
    });
  }

  if (winRate.winRatePct < 45) {
    alarms.push({
      title: "Win rate poniżej celu",
      description: "Konwersja wygranych transakcji spadła poniżej poziomu docelowego 45%.",
      severity: "warning",
      metric: `${winRate.winRatePct.toFixed(1)}%`,
    });
  }

  const followupLossReason = lostDealReasons.find((item) => item.reason.includes("follow-up"));
  if (followupLossReason && followupLossReason.deals >= 6) {
    alarms.push({
      title: "Utracone oferty bez follow-up",
      description: "Znaczący udział utrat wynika z braku działań po wysłaniu oferty.",
      severity: "gold",
      metric: `${followupLossReason.deals} spraw`,
    });
  }

  return {
    monthForecast,
    quarterForecast,
    planVsExecution,
    revenuePipeline,
    winRate,
    lostDealReasons,
    alarms,
  };
}
