export type LeadTemperature = "HOT" | "WARM" | "COLD";
export type DoorModel = "Tirana" | "Astana" | "Chaga" | "Waleta";

export interface LeadRawInput {
  id: string;
  clientName: string;
  modelInterest: DoorModel;
  budget: number;
  purchaseWindowMonths: number;
  investmentStage: "projekt" | "stan surowy" | "wykończenie" | "remont";
  campaignSource: string;
  hasCompetitorQuote: boolean;
  asksInstallation: boolean;
  asksTimeline: boolean;
  asksPersonalization: boolean;
  attachedInspiration: boolean;
}

export interface ScoredLead extends LeadRawInput {
  score: number;
  temperature: LeadTemperature;
  scoreReasons: string[];
  buyingSignals: string[];
  immediateCall: boolean;
  nextBestMove: string;
}

export interface Build013Snapshot {
  leads: ScoredLead[];
  totals: {
    totalLeads: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    avgScore: number;
  };
  modelAttribution: Array<{
    model: DoorModel;
    leads: number;
    hotLeads: number;
    avgScore: number;
  }>;
  qualityByCampaign: Array<{
    campaignSource: string;
    leads: number;
    hotLeads: number;
    hotRatePct: number;
    avgScore: number;
    recommendation: "skaluj" | "obserwuj" | "zatrzymaj";
  }>;
  signalSummary: Array<{
    signal: string;
    count: number;
  }>;
  nextBestQueue: ScoredLead[];
}

const MOCK_LEADS: LeadRawInput[] = [
  {
    id: "LI-001",
    clientName: "Kamil Nowak",
    modelInterest: "Tirana",
    budget: 42000,
    purchaseWindowMonths: 2,
    investmentStage: "wykończenie",
    campaignSource: "Google Ads - Tirana High Intent",
    hasCompetitorQuote: true,
    asksInstallation: true,
    asksTimeline: true,
    asksPersonalization: true,
    attachedInspiration: true,
  },
  {
    id: "LI-002",
    clientName: "Anna Zaremba",
    modelInterest: "Astana",
    budget: 36000,
    purchaseWindowMonths: 3,
    investmentStage: "stan surowy",
    campaignSource: "Meta Ads - Astana Lead Gen",
    hasCompetitorQuote: false,
    asksInstallation: true,
    asksTimeline: true,
    asksPersonalization: false,
    attachedInspiration: false,
  },
  {
    id: "LI-003",
    clientName: "Michał Bąk",
    modelInterest: "Chaga",
    budget: 27000,
    purchaseWindowMonths: 6,
    investmentStage: "projekt",
    campaignSource: "Meta Ads - Chaga Prospecting",
    hasCompetitorQuote: true,
    asksInstallation: false,
    asksTimeline: false,
    asksPersonalization: true,
    attachedInspiration: false,
  },
  {
    id: "LI-004",
    clientName: "Joanna Kłos",
    modelInterest: "Waleta",
    budget: 52000,
    purchaseWindowMonths: 1,
    investmentStage: "remont",
    campaignSource: "Google Ads - Waleta Search",
    hasCompetitorQuote: true,
    asksInstallation: true,
    asksTimeline: true,
    asksPersonalization: true,
    attachedInspiration: true,
  },
  {
    id: "LI-005",
    clientName: "Rafał Pietrzak",
    modelInterest: "Tirana",
    budget: 31000,
    purchaseWindowMonths: 4,
    investmentStage: "stan surowy",
    campaignSource: "Meta Ads - Tirana Video",
    hasCompetitorQuote: false,
    asksInstallation: false,
    asksTimeline: true,
    asksPersonalization: false,
    attachedInspiration: true,
  },
  {
    id: "LI-006",
    clientName: "Alicja Wrona",
    modelInterest: "Astana",
    budget: 61000,
    purchaseWindowMonths: 2,
    investmentStage: "wykończenie",
    campaignSource: "Google Ads - Astana Brand",
    hasCompetitorQuote: true,
    asksInstallation: true,
    asksTimeline: false,
    asksPersonalization: true,
    attachedInspiration: true,
  },
  {
    id: "LI-007",
    clientName: "Filip Mazur",
    modelInterest: "Chaga",
    budget: 19000,
    purchaseWindowMonths: 8,
    investmentStage: "projekt",
    campaignSource: "Meta Ads - Chaga Awareness",
    hasCompetitorQuote: false,
    asksInstallation: false,
    asksTimeline: false,
    asksPersonalization: false,
    attachedInspiration: false,
  },
  {
    id: "LI-008",
    clientName: "Monika Król",
    modelInterest: "Waleta",
    budget: 34500,
    purchaseWindowMonths: 3,
    investmentStage: "wykończenie",
    campaignSource: "Google Ads - Waleta High Intent",
    hasCompetitorQuote: false,
    asksInstallation: true,
    asksTimeline: true,
    asksPersonalization: true,
    attachedInspiration: true,
  },
];

function mapScoreToTemperature(score: number): LeadTemperature {
  if (score >= 8) return "HOT";
  if (score >= 5) return "WARM";
  return "COLD";
}

function scoreLead(lead: LeadRawInput): ScoredLead {
  let score = 0;
  const scoreReasons: string[] = [];
  const buyingSignals: string[] = [];

  if (lead.budget > 30000) {
    score += 3;
    scoreReasons.push("+3 budżet powyżej 30 000 zł");
    buyingSignals.push("Budżet premium");
  }

  if (lead.purchaseWindowMonths >= 1 && lead.purchaseWindowMonths <= 3) {
    score += 3;
    scoreReasons.push("+3 termin zakupu 1–3 miesiące");
    buyingSignals.push("Krótki horyzont zakupu");
  }

  if (lead.modelInterest) {
    score += 2;
    scoreReasons.push(`+2 konkretny model: ${lead.modelInterest}`);
    buyingSignals.push("Jasna preferencja modelu");
  }

  if (lead.hasCompetitorQuote) {
    score += 2;
    scoreReasons.push("+2 klient ma wycenę od konkurencji");
    buyingSignals.push("Porównuje oferty teraz");
  }

  if (lead.asksInstallation) {
    score += 1;
    scoreReasons.push("+1 pytanie o montaż");
    buyingSignals.push("Pyta o montaż");
  }

  if (lead.asksTimeline) {
    score += 1;
    scoreReasons.push("+1 pytanie o termin");
    buyingSignals.push("Pyta o termin realizacji");
  }

  if (lead.attachedInspiration) {
    score += 1;
    scoreReasons.push("+1 załączona inspiracja / zdjęcie");
    buyingSignals.push("Przesłał inspirację wizualną");
  }

  if (lead.asksPersonalization) {
    buyingSignals.push("Pyta o personalizację");
  }

  const temperature = mapScoreToTemperature(score);
  const immediateCall = temperature === "HOT";

  const nextBestMove = immediateCall
    ? "Natychmiastowy telefon + domknięcie terminu pomiaru/montażu."
    : temperature === "WARM"
      ? "Kontakt dziś i dosłanie dopasowanej oferty z personalizacją."
      : "Lead nurturing: sekwencja edukacyjna + kwalifikacja budżetu.";

  return {
    ...lead,
    score,
    temperature,
    scoreReasons,
    buyingSignals,
    immediateCall,
    nextBestMove,
  };
}

export function createBuild013Snapshot(): Build013Snapshot {
  const leads = MOCK_LEADS.map(scoreLead);

  const totals = {
    totalLeads: leads.length,
    hotLeads: leads.filter((lead) => lead.temperature === "HOT").length,
    warmLeads: leads.filter((lead) => lead.temperature === "WARM").length,
    coldLeads: leads.filter((lead) => lead.temperature === "COLD").length,
    avgScore: leads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(leads.length, 1),
  };

  const models: DoorModel[] = ["Tirana", "Astana", "Chaga", "Waleta"];
  const modelAttribution = models.map((model) => {
    const byModel = leads.filter((lead) => lead.modelInterest === model);
    return {
      model,
      leads: byModel.length,
      hotLeads: byModel.filter((lead) => lead.temperature === "HOT").length,
      avgScore: byModel.reduce((sum, lead) => sum + lead.score, 0) / Math.max(byModel.length, 1),
    };
  });

  const campaignMap = new Map<string, ScoredLead[]>();
  leads.forEach((lead) => {
    const current = campaignMap.get(lead.campaignSource) ?? [];
    current.push(lead);
    campaignMap.set(lead.campaignSource, current);
  });

  const qualityByCampaign = Array.from(campaignMap.entries()).map(([campaignSource, entries]) => {
    const hotLeads = entries.filter((lead) => lead.temperature === "HOT").length;
    const avgScore = entries.reduce((sum, lead) => sum + lead.score, 0) / Math.max(entries.length, 1);
    const hotRatePct = (hotLeads / Math.max(entries.length, 1)) * 100;

    const recommendation: "skaluj" | "obserwuj" | "zatrzymaj" = hotRatePct >= 40
      ? "skaluj"
      : hotRatePct >= 20
        ? "obserwuj"
        : "zatrzymaj";

    return {
      campaignSource,
      leads: entries.length,
      hotLeads,
      hotRatePct,
      avgScore,
      recommendation,
    };
  });

  const signalCounters = new Map<string, number>();
  leads.forEach((lead) => {
    lead.buyingSignals.forEach((signal) => {
      signalCounters.set(signal, (signalCounters.get(signal) ?? 0) + 1);
    });
  });

  const signalSummary = Array.from(signalCounters.entries())
    .map(([signal, count]) => ({ signal, count }))
    .sort((a, b) => b.count - a.count);

  const nextBestQueue = [...leads]
    .sort((a, b) => {
      if (a.immediateCall !== b.immediateCall) {
        return a.immediateCall ? -1 : 1;
      }
      return b.score - a.score;
    })
    .slice(0, 8);

  return {
    leads,
    totals,
    modelAttribution,
    qualityByCampaign,
    signalSummary,
    nextBestQueue,
  };
}
