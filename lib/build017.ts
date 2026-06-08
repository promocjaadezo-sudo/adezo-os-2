export type LostDealOwner = "Magda 1" | "Magda 2";
export type DealModel = "Tirana" | "Astana" | "Chaga" | "Waleta";
export type LostReason =
  | "cena"
  | "konkurencja"
  | "termin realizacji"
  | "brak decyzji"
  | "klient odłożył inwestycję"
  | "design/model"
  | "brak kontaktu"
  | "architekt wybrał inaczej"
  | "inny wykonawca";

export interface LostDealRecord {
  id: string;
  leadId: string;
  clientName: string;
  owner: LostDealOwner;
  model: DealModel;
  budget: number;
  offerValue: number;
  lostDaysAgo: number;
  reason?: LostReason;
  competitor?: string;
  objections: string[];
  stageLost: "offer_sent" | "negotiation" | "post_measurement";
  canReopen: boolean;
}

export interface ReasonStat {
  reason: LostReason;
  count: number;
  pct: number;
  insight: string;
}

export interface ObjectionPattern {
  objection: string;
  count: number;
  relatedReason: LostReason;
  recommendation: string;
  marketingSignal?: string;
}

export interface CompetitorLoss {
  competitor: string;
  losses: number;
  totalValue: number;
  models: DealModel[];
  topReason: LostReason;
  counterMove: string;
}

export interface PriceResistanceModel {
  model: DealModel;
  lossesByPrice: number;
  totalLosses: number;
  priceResistancePct: number;
  avgBudget: number;
  action: string;
}

export interface ScriptRecommendation {
  scenario: string;
  scriptArgument: string;
  owner: "Magda team" | "CEO" | "Marketing";
  whenUse: string;
}

export interface RecoveryOpportunity {
  leadId: string;
  clientName: string;
  owner: LostDealOwner;
  model: DealModel;
  reason: LostReason;
  budget: number;
  lostDaysAgo: number;
  task: string;
  assignee: "Magda 1" | "Magda 2" | "CEO" | "Senior Follow-up";
  priority: "highest" | "high" | "medium";
  whyRecoverable: string;
}

export interface Build017Snapshot {
  lostDeals: LostDealRecord[];
  reasonStats: ReasonStat[];
  objectionPatterns: ObjectionPattern[];
  competitorBoard: CompetitorLoss[];
  priceResistance: PriceResistanceModel[];
  scriptRecommendations: ScriptRecommendation[];
  recoveryQueue: RecoveryOpportunity[];
  dataIncompleteCount: number;
  ceoAlerts: string[];
  salesAlerts: string[];
  operationsAlerts: string[];
  executiveSummary: string;
}

const REASONS: LostReason[] = [
  "cena",
  "konkurencja",
  "termin realizacji",
  "brak decyzji",
  "klient odłożył inwestycję",
  "design/model",
  "brak kontaktu",
  "architekt wybrał inaczej",
  "inny wykonawca",
];

const MOCK_LOST_DEALS: LostDealRecord[] = [
  {
    id: "LD-017-001",
    leadId: "LEAD-9821",
    clientName: "Piotr Nawrocki",
    owner: "Magda 1",
    model: "Tirana",
    budget: 46000,
    offerValue: 52000,
    lostDaysAgo: 34,
    reason: "cena",
    objections: ["Za drogo", "Konkurencja daje raty 0%"],
    competitor: "Solaris Glass",
    stageLost: "negotiation",
    canReopen: true,
  },
  {
    id: "LD-017-002",
    leadId: "LEAD-9827",
    clientName: "Agnieszka Polak",
    owner: "Magda 2",
    model: "Astana",
    budget: 28000,
    offerValue: 35000,
    lostDaysAgo: 11,
    reason: "termin realizacji",
    objections: ["Termin za długi"],
    competitor: "Nordic Systems",
    stageLost: "post_measurement",
    canReopen: false,
  },
  {
    id: "LD-017-003",
    leadId: "LEAD-9830",
    clientName: "Marcin Leśny",
    owner: "Magda 1",
    model: "Waleta",
    budget: 39000,
    offerValue: 42000,
    lostDaysAgo: 43,
    reason: "brak decyzji",
    objections: ["Musimy się jeszcze zastanowić"],
    stageLost: "offer_sent",
    canReopen: true,
  },
  {
    id: "LD-017-004",
    leadId: "LEAD-9832",
    clientName: "Ewa Mierzejewska",
    owner: "Magda 2",
    model: "Chaga",
    budget: 32000,
    offerValue: 37000,
    lostDaysAgo: 17,
    reason: "konkurencja",
    objections: ["Lepsza oferta pakietowa"],
    competitor: "LuxeBuild",
    stageLost: "negotiation",
    canReopen: false,
  },
  {
    id: "LD-017-005",
    leadId: "LEAD-9838",
    clientName: "Paweł Kurek",
    owner: "Magda 1",
    model: "Tirana",
    budget: 27000,
    offerValue: 33000,
    lostDaysAgo: 9,
    reason: "cena",
    objections: ["Przekracza budżet"],
    competitor: "BudgetHouse",
    stageLost: "offer_sent",
    canReopen: false,
  },
  {
    id: "LD-017-006",
    leadId: "LEAD-9841",
    clientName: "Łukasz Tracz",
    owner: "Magda 2",
    model: "Astana",
    budget: 51000,
    offerValue: 56000,
    lostDaysAgo: 36,
    reason: "cena",
    objections: ["Nie mamy bufora na upgrade"],
    competitor: "Nordic Systems",
    stageLost: "post_measurement",
    canReopen: true,
  },
  {
    id: "LD-017-007",
    leadId: "LEAD-9845",
    clientName: "Renata Książek",
    owner: "Magda 1",
    model: "Waleta",
    budget: 25000,
    offerValue: 31000,
    lostDaysAgo: 27,
    reason: "konkurencja",
    objections: ["Konkurencja ma szybszy montaż"],
    competitor: "Solaris Glass",
    stageLost: "negotiation",
    canReopen: true,
  },
  {
    id: "LD-017-008",
    leadId: "LEAD-9850",
    clientName: "Tomasz Roszak",
    owner: "Magda 2",
    model: "Chaga",
    budget: 36000,
    offerValue: 41000,
    lostDaysAgo: 19,
    reason: "termin realizacji",
    objections: ["Potrzebujemy realizacji przed wakacjami"],
    stageLost: "offer_sent",
    canReopen: true,
  },
  {
    id: "LD-017-009",
    leadId: "LEAD-9853",
    clientName: "Iwona Duda",
    owner: "Magda 1",
    model: "Astana",
    budget: 34000,
    offerValue: 39000,
    lostDaysAgo: 33,
    reason: "brak decyzji",
    objections: ["Wrócimy po wakacjach"],
    stageLost: "post_measurement",
    canReopen: true,
  },
  {
    id: "LD-017-010",
    leadId: "LEAD-9856",
    clientName: "Damian Olejnik",
    owner: "Magda 2",
    model: "Tirana",
    budget: 30000,
    offerValue: 37000,
    lostDaysAgo: 7,
    reason: "design/model",
    objections: ["Model nie pasuje do elewacji"],
    stageLost: "offer_sent",
    canReopen: false,
  },
  {
    id: "LD-017-011",
    leadId: "LEAD-9861",
    clientName: "Marta Wysocka",
    owner: "Magda 1",
    model: "Waleta",
    budget: 29000,
    offerValue: 34000,
    lostDaysAgo: 14,
    reason: "architekt wybrał inaczej",
    objections: ["Architekt promuje inny system"],
    competitor: "LuxeBuild",
    stageLost: "offer_sent",
    canReopen: false,
  },
  {
    id: "LD-017-012",
    leadId: "LEAD-9864",
    clientName: "Krzysztof Minda",
    owner: "Magda 2",
    model: "Chaga",
    budget: 44000,
    offerValue: 49000,
    lostDaysAgo: 21,
    objections: ["Brak odpowiedzi klienta po ofercie"],
    stageLost: "negotiation",
    canReopen: true,
  },
];

function getReasonInsight(reason: LostReason): string {
  if (reason === "cena") return "Klient nie widzi wartości pakietu względem ceny — trzeba lepiej sprzedać ROI i oszczędności.";
  if (reason === "konkurencja") return "Przegrywamy framingiem oferty, nie tylko ceną — potrzebne kontr-argumenty pod konkurencję.";
  if (reason === "termin realizacji") return "Termin jest barierą zakupową — operacje muszą dać szybsze sloty dla leadów HOT.";
  if (reason === "brak decyzji") return "Brak domknięcia decyzji po ofercie — trzeba prowadzić klienta do konkretnego terminu decyzji.";
  if (reason === "klient odłożył inwestycję") return "Lead wymaga sekwencji podtrzymującej i reaktywacji po czasie.";
  if (reason === "design/model") return "Prezentacja modelu jest niedopasowana do estetyki klienta.";
  if (reason === "brak kontaktu") return "Proces follow-up nie domyka kontaktu, potrzebna sekwencja multi-touch.";
  if (reason === "architekt wybrał inaczej") return "Brakuje narracji i materiałów dla architektów.";
  return "Potrzebna analiza wykonawcy i jakości argumentów przewagi.";
}

function createReasonStats(deals: LostDealRecord[]): ReasonStat[] {
  const dealsWithReason = deals.filter((deal): deal is LostDealRecord & { reason: LostReason } => Boolean(deal.reason));
  const denominator = Math.max(1, dealsWithReason.length);

  return REASONS.map((reason) => {
    const count = dealsWithReason.filter((deal) => deal.reason === reason).length;
    return {
      reason,
      count,
      pct: count / denominator * 100,
      insight: getReasonInsight(reason),
    };
  })
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
}

function createObjectionPatterns(deals: LostDealRecord[]): ObjectionPattern[] {
  const map = new Map<string, ObjectionPattern>();

  deals.forEach((deal) => {
    if (!deal.reason) return;
    const reason = deal.reason;

    deal.objections.forEach((objection) => {
      const current = map.get(objection);
      if (current) {
        current.count += 1;
        return;
      }

      const recommendation =
        reason === "cena"
          ? "Dodaj argument: całkowity koszt 5-letni i trwałość materiału."
          : reason === "konkurencja"
            ? "Dodaj kontrę: porównanie gwarancji, jakości i serwisu 1:1."
            : reason === "termin realizacji"
              ? "W rozmowie od razu podawaj 2 warianty harmonogramu realizacji."
              : "Domykaj rozmowę pytaniem o konkretną datę decyzji i kolejny krok.";

      const marketingSignal =
        reason === "cena"
          ? "Marketing: case ROI + porównanie oszczędności"
          : reason === "konkurencja"
            ? "Agencja: landing z porównaniem ADEZO vs konkurencja"
            : undefined;

      map.set(objection, {
        objection,
        count: 1,
        relatedReason: reason,
        recommendation,
        marketingSignal,
      });
    });
  });

  return Array.from(map.values()).sort((left, right) => right.count - left.count).slice(0, 8);
}

function createCompetitorBoard(deals: LostDealRecord[]): CompetitorLoss[] {
  const competitorDeals = deals.filter((deal) => Boolean(deal.competitor));
  const competitors = Array.from(new Set(competitorDeals.map((deal) => deal.competitor as string)));

  return competitors.map((competitor) => {
    const losses = competitorDeals.filter((deal) => deal.competitor === competitor);
    const reasonCount = new Map<LostReason, number>();

    losses.forEach((deal) => {
      if (!deal.reason) return;
      reasonCount.set(deal.reason, (reasonCount.get(deal.reason) ?? 0) + 1);
    });

    const topReason = Array.from(reasonCount.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "konkurencja";

    const counterMove =
      topReason === "cena"
        ? "Włącz ofertę warstwową: pakiet bazowy + rozszerzenia premium."
        : topReason === "termin realizacji"
          ? "Sprzedawaj priorytetowy slot produkcyjny dla leadów z decyzją < 7 dni."
          : "Dostarcz Magdom gotową kontrę jakościowo-serwisową na pierwszej rozmowie.";

    return {
      competitor,
      losses: losses.length,
      totalValue: losses.reduce((sum, deal) => sum + deal.offerValue, 0),
      models: Array.from(new Set(losses.map((deal) => deal.model))),
      topReason,
      counterMove,
    };
  }).sort((left, right) => right.losses - left.losses);
}

function createPriceResistance(deals: LostDealRecord[]): PriceResistanceModel[] {
  const models: DealModel[] = ["Tirana", "Astana", "Chaga", "Waleta"];

  return models.map((model) => {
    const modelDeals = deals.filter((deal) => deal.model === model);
    const lossesByPrice = modelDeals.filter((deal) => deal.reason === "cena").length;
    const totalLosses = modelDeals.length;

    return {
      model,
      lossesByPrice,
      totalLosses,
      priceResistancePct: lossesByPrice / Math.max(1, totalLosses) * 100,
      avgBudget: modelDeals.reduce((sum, deal) => sum + deal.budget, 0) / Math.max(1, modelDeals.length),
      action:
        lossesByPrice > 0
          ? "W rozmowie zacznij od wartości i kosztu całkowitego, nie od ceny końcowej."
          : "Ten model rzadko odpada na cenie — utrzymaj obecny framing oferty.",
    };
  }).sort((left, right) => right.priceResistancePct - left.priceResistancePct);
}

function createScriptRecommendations(reasonStats: ReasonStat[]): ScriptRecommendation[] {
  const hasPrice = reasonStats.some((item) => item.reason === "cena");
  const hasCompetition = reasonStats.some((item) => item.reason === "konkurencja");
  const hasDeadline = reasonStats.some((item) => item.reason === "termin realizacji");

  const recommendations: ScriptRecommendation[] = [
    {
      scenario: "Klient mówi: za drogo",
      scriptArgument:
        "Rozbij cenę na koszt miesięczny i pokaż różnicę jakości, serwisu i trwałości vs tańsza alternatywa.",
      owner: "Magda team",
      whenUse: "Pierwszy sygnał oporu cenowego w negocjacjach",
    },
    {
      scenario: "Klient porównuje z konkurencją",
      scriptArgument:
        "Użyj matrycy 3 punktów: gwarancja, czas reakcji serwisu, jakość wykonania po montażu.",
      owner: "Magda team",
      whenUse: "Gdy pada nazwa konkurencji lub tańszej oferty",
    },
    {
      scenario: "Klient odkłada decyzję",
      scriptArgument: "Domknij rozmowę wyborem daty: 'Czy wracamy do tematu we wtorek czy czwartek o 16:00?'",
      owner: "Magda team",
      whenUse: "Brak decyzji po wysłaniu oferty",
    },
  ];

  if (hasPrice) {
    recommendations.push({
      scenario: "Wysoka utrata przez cenę",
      scriptArgument: "CEO przygotowuje pakiet argumentów wartości premium dla ofert > 30 tys. zł.",
      owner: "CEO",
      whenUse: "Gdy udział powodu 'cena' przekracza próg alarmowy",
    });
    recommendations.push({
      scenario: "Cena dominuje w przegranych",
      scriptArgument: "Marketing dostarcza case study ROI i kalkulator oszczędności do użycia w rozmowie.",
      owner: "Marketing",
      whenUse: "Aktualizacja materiałów sprzedażowych na ten tydzień",
    });
  }

  if (hasCompetition) {
    recommendations.push({
      scenario: "Rosną przegrane na konkurencję",
      scriptArgument: "Agencja przygotowuje landing 'Dlaczego ADEZO vs konkurencja' z realnymi porównaniami.",
      owner: "Marketing",
      whenUse: "Gdy udział powodu 'konkurencja' przekracza próg alarmowy",
    });
  }

  if (hasDeadline) {
    recommendations.push({
      scenario: "Klient ciśnie na termin",
      scriptArgument: "Dodaj do rozmowy dwa realne okna realizacji + wariant priorytetowy.",
      owner: "CEO",
      whenUse: "Gdy termin staje się główną obiekcją",
    });
  }

  return recommendations.slice(0, 8);
}

function createRecoveryQueue(deals: LostDealRecord[]): RecoveryOpportunity[] {
  return deals
    .filter((deal) => {
      if (!deal.reason) return false;
      if (deal.reason === "brak decyzji" && deal.lostDaysAgo >= 30) return true;
      if (deal.reason === "cena" && deal.budget > 30000) return true;
      return deal.canReopen;
    })
    .map((deal) => {
      const reason = deal.reason as LostReason;
      const isNoDecisionRecovery = reason === "brak decyzji" && deal.lostDaysAgo >= 30;
      const isPriceHighBudget = reason === "cena" && deal.budget > 30000;
      const assignee: RecoveryOpportunity["assignee"] = isPriceHighBudget ? "Senior Follow-up" : deal.owner;
      const priority: RecoveryOpportunity["priority"] = isPriceHighBudget ? "highest" : isNoDecisionRecovery ? "high" : "medium";

      return {
        leadId: deal.leadId,
        clientName: deal.clientName,
        owner: deal.owner,
        model: deal.model,
        reason,
        budget: deal.budget,
        lostDaysAgo: deal.lostDaysAgo,
        task: isNoDecisionRecovery
          ? "Uruchom reaktywację po 30 dniach i zaproponuj nowy termin decyzji"
          : isPriceHighBudget
            ? "CEO/Senior follow-up: rozmowa o wartości i wariantach finansowania"
            : "Wykonaj follow-up odzyskowy z nową propozycją argumentacji",
        assignee,
        priority,
        whyRecoverable: isPriceHighBudget
          ? "Budżet klienta przekracza 30 tys. — wysoka szansa odzysku po zmianie narracji wartości"
          : isNoDecisionRecovery
            ? "Brak decyzji, nie twarde 'nie' — okno reaktywacji po 30 dniach"
            : "Lead już zna ofertę i wymaga nowego bodźca do decyzji",
      };
    })
    .sort((left, right) => {
      const priorityOrder: Record<RecoveryOpportunity["priority"], number> = { highest: 3, high: 2, medium: 1 };
      return priorityOrder[right.priority] - priorityOrder[left.priority];
    })
    .slice(0, 10);
}

export function createBuild017Snapshot(): Build017Snapshot {
  const lostDeals = MOCK_LOST_DEALS;
  const dataIncompleteCount = lostDeals.filter((deal) => !deal.reason).length;
  const reasonStats = createReasonStats(lostDeals);

  const pricePct = reasonStats.find((item) => item.reason === "cena")?.pct ?? 0;
  const competitionPct = reasonStats.find((item) => item.reason === "konkurencja")?.pct ?? 0;
  const deadlinePct = reasonStats.find((item) => item.reason === "termin realizacji")?.pct ?? 0;

  const ceoAlerts: string[] = [];
  const salesAlerts: string[] = [];
  const operationsAlerts: string[] = [];

  if (dataIncompleteCount > 0) {
    ceoAlerts.push(`DATA INCOMPLETE: ${dataIncompleteCount} przegranych ofert bez powodu przegranej.`);
  }
  if (pricePct > 35) {
    ceoAlerts.push(`ALERT CEO: powód 'cena' = ${pricePct.toFixed(1)}% (>35%). Wymagana korekta narracji wartości.`);
  }
  if (competitionPct > 25) {
    salesAlerts.push(`ALERT SPRZEDAŻ: 'konkurencja' = ${competitionPct.toFixed(1)}% (>25%). Potrzebna kontra handlowa.`);
  }
  if (deadlinePct > 20) {
    operationsAlerts.push(`ALERT OPERACYJNY: 'termin realizacji' = ${deadlinePct.toFixed(1)}% (>20%). Trzeba skrócić lead time.`);
  }

  const topReason = reasonStats[0];
  const topRecovery = createRecoveryQueue(lostDeals)[0];

  const executiveSummary = topReason
    ? `Najczęściej przegrywamy przez '${topReason.reason}' (${topReason.pct.toFixed(1)}%). Najwyższy priorytet odzysku: ${topRecovery?.clientName ?? "—"}.`
    : "Brak danych o powodach przegranych ofert.";

  return {
    lostDeals,
    reasonStats,
    objectionPatterns: createObjectionPatterns(lostDeals),
    competitorBoard: createCompetitorBoard(lostDeals),
    priceResistance: createPriceResistance(lostDeals),
    scriptRecommendations: createScriptRecommendations(reasonStats),
    recoveryQueue: createRecoveryQueue(lostDeals),
    dataIncompleteCount,
    ceoAlerts,
    salesAlerts,
    operationsAlerts,
    executiveSummary,
  };
}
