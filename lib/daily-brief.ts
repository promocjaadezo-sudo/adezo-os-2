export type BriefSeverity = "danger" | "warning" | "gold";

export interface BriefOwnerAction {
  id: string;
  owner: string;
  action: string;
  expectedImpact: string;
  dueToday: boolean;
  priority: "critical" | "high" | "medium";
}

export interface MarketingRecommendation {
  channel: "Google Ads" | "Meta Ads" | "Remarketing" | "Landing Page";
  recommendation: string;
  reason: string;
  expectedResult: string;
  owner: string;
}

export interface CeoAlert {
  title: string;
  description: string;
  severity: BriefSeverity;
  metric: string;
}

export interface DailyRevenueBriefSnapshot {
  dateLabel: string;
  planToday: number;
  forecastToday: number;
  gapToday: number;
  monthlyPlan: number;
  monthlyForecast: number;
  riskDeliveryPct: number;
  likelyToDeliverPlan: boolean;
  whyNotDelivering: string[];
  aiAnalysisSummary: string;
  aiTopMoves: BriefOwnerAction[];
  magdaActionBoard: BriefOwnerAction[];
  marketingRecommendations: MarketingRecommendation[];
  ceoAlerts: CeoAlert[];
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function createDailyRevenueBriefSnapshot(): DailyRevenueBriefSnapshot {
  const now = new Date();
  const dateLabel = formatDateLabel(now);

  const planToday = 58000;
  const forecastToday = 41300;
  const gapToday = Math.max(0, planToday - forecastToday);

  const monthlyPlan = 1200000;
  const monthlyForecast = 1018000;
  const riskDeliveryPct = Math.min(100, (Math.max(monthlyPlan - monthlyForecast, 0) / monthlyPlan) * 100);
  const likelyToDeliverPlan = monthlyForecast >= monthlyPlan;

  const whyNotDelivering: string[] = [
    "Za mało domknięć ofert z wysokim prawdopodobieństwem (negocjacje > 70%).",
    "Część follow-upów po ofertach przekroczyła SLA 24h.",
    "Leady z kampanii Meta mają niższą jakość niż benchmark tygodniowy.",
  ];

  const aiTopMoves: BriefOwnerAction[] = [
    {
      id: "AI-1",
      owner: "Magda K",
      action: "Wykonaj 6 follow-upów do ofert > 80 tys. PLN z ostatnich 3 dni.",
      expectedImpact: "+95 tys. PLN weighted revenue",
      dueToday: true,
      priority: "critical",
    },
    {
      id: "AI-2",
      owner: "Magda B",
      action: "Zamknij 2 negocjacje z rabatem warunkowym do 3% i terminem dziś.",
      expectedImpact: "+72 tys. PLN closed revenue",
      dueToday: true,
      priority: "critical",
    },
    {
      id: "AI-3",
      owner: "Marketing",
      action: "Przesuń 20% budżetu z Meta prospecting do Google high-intent fraz.",
      expectedImpact: "Poprawa jakości leadów w 48h",
      dueToday: true,
      priority: "high",
    },
  ];

  const magdaActionBoard: BriefOwnerAction[] = [
    {
      id: "MK-1",
      owner: "Magda K",
      action: "Kontakt telefoniczny do klientów: Nordline, Novum, Riva do 12:00.",
      expectedImpact: "Odblokowanie 2 decyzji zakupowych",
      dueToday: true,
      priority: "critical",
    },
    {
      id: "MK-2",
      owner: "Magda K",
      action: "Wyślij 3 zaktualizowane oferty z ROI kalkulacją.",
      expectedImpact: "Skrócenie cyklu decyzji",
      dueToday: true,
      priority: "high",
    },
    {
      id: "MB-1",
      owner: "Magda B",
      action: "Domknij terminy montażu dla ofert zalegających > 5 dni.",
      expectedImpact: "Spadek utraconych szans",
      dueToday: true,
      priority: "high",
    },
  ];

  const marketingRecommendations: MarketingRecommendation[] = [
    {
      channel: "Google Ads",
      recommendation: "Podbij stawki +12% dla fraz z intencją zakupową.",
      reason: "Najwyższa konwersja lead→oferta w ostatnich 14 dniach.",
      expectedResult: "+6 leadów jakości HOT/tydzień",
      owner: "Marketing Lead",
    },
    {
      channel: "Meta Ads",
      recommendation: "Wyłącz 2 grupy o CPA > 30% powyżej celu.",
      reason: "Niska jakość leadów i wysoki koszt pozyskania.",
      expectedResult: "Redukcja kosztu o ~18%",
      owner: "Performance Specialist",
    },
    {
      channel: "Remarketing",
      recommendation: "Uruchom kampanię follow-up dla otwartych ofert 7-dniowych.",
      reason: "Brak domknięć z segmentu mid-ticket.",
      expectedResult: "+2 dodatkowe domknięcia / tydzień",
      owner: "Marketing Automation",
    },
    {
      channel: "Landing Page",
      recommendation: "Dodaj sekcję porównania modeli i FAQ ceny.",
      reason: "Najczęstszy powód porzucenia: niejasność konfiguracji.",
      expectedResult: "+9% CR formularza",
      owner: "Growth Designer",
    },
  ];

  const ceoAlerts: CeoAlert[] = [
    {
      title: "Ryzyko niedowiezienia planu dziennego",
      description: "Forecast dzisiaj jest poniżej celu. Potrzebne działania handlowe do 14:00.",
      severity: gapToday > 10000 ? "danger" : "warning",
      metric: `${Math.round(gapToday / 1000)} tys. PLN gap`,
    },
    {
      title: "SLA follow-up zagrożone",
      description: "Część ofert nie dostała kontaktu w 24h od wysyłki.",
      severity: "warning",
      metric: "8 ofert",
    },
    {
      title: "Jakość leadów z Meta poniżej benchmarku",
      description: "Wskaźnik HOT leadów spadł względem średniej 7-dniowej.",
      severity: "gold",
      metric: "-14% quality",
    },
  ];

  const aiAnalysisSummary = likelyToDeliverPlan
    ? "Plan miesięczny jest w zasięgu. Priorytetem jest utrzymanie tempa domknięć i jakości follow-upów."
    : "Przy obecnym tempie nie dowieziemy planu. Największa dźwignia na dziś to domknięcia negocjacji i natychmiastowe follow-upy po ofertach.";

  return {
    dateLabel,
    planToday,
    forecastToday,
    gapToday,
    monthlyPlan,
    monthlyForecast,
    riskDeliveryPct,
    likelyToDeliverPlan,
    whyNotDelivering,
    aiAnalysisSummary,
    aiTopMoves,
    magdaActionBoard,
    marketingRecommendations,
    ceoAlerts,
  };
}
