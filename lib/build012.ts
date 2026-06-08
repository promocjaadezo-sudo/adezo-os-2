export type AdPlatform = "Meta Ads" | "Google Ads";
export type AdAction = "skaluj" | "obserwuj" | "zatrzymaj";

export interface CampaignPerformance {
  id: string;
  platform: AdPlatform;
  campaignName: string;
  model: "Tirana" | "Astana" | "Chaga" | "Waleta";
  budget: number;
  spend: number;
  leads: number;
  hotLeads: number;
  offers: number;
  sales: number;
  revenue: number;
  cpl: number;
  costPerHotLead: number;
  recommendation: AdAction;
  qualityIssue?: string;
}

export interface BudgetRecommendation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  suggestedBudget: number;
  action: AdAction;
  reason: string;
  expectedImpact: string;
}

export interface AgencyFixItem {
  area: string;
  issue: string;
  fixToday: string;
  owner: string;
}

export interface Build012Snapshot {
  campaigns: CampaignPerformance[];
  totals: {
    leads: number;
    hotLeads: number;
    offers: number;
    sales: number;
    revenue: number;
    avgCpl: number;
    avgCostPerHotLead: number;
    hotLeadRatePct: number;
  };
  attribution: Array<{
    source: AdPlatform;
    leads: number;
    hotLeads: number;
    revenue: number;
    hotRatePct: number;
  }>;
  budgetRecommendations: BudgetRecommendation[];
  agencyFixes: AgencyFixItem[];
  actionSummary: {
    scale: string[];
    stop: string[];
    watch: string[];
    lowQuality: string[];
  };
}

const MOCK_CAMPAIGNS: CampaignPerformance[] = [
  {
    id: "C-001",
    platform: "Meta Ads",
    campaignName: "Meta Tirana Lead Boost",
    model: "Tirana",
    budget: 4200,
    spend: 3950,
    leads: 42,
    hotLeads: 11,
    offers: 6,
    sales: 2,
    revenue: 152000,
    cpl: 94,
    costPerHotLead: 359,
    recommendation: "skaluj",
  },
  {
    id: "C-002",
    platform: "Google Ads",
    campaignName: "Google Astana High Intent",
    model: "Astana",
    budget: 5600,
    spend: 5190,
    leads: 38,
    hotLeads: 15,
    offers: 9,
    sales: 4,
    revenue: 286000,
    cpl: 137,
    costPerHotLead: 346,
    recommendation: "skaluj",
  },
  {
    id: "C-003",
    platform: "Meta Ads",
    campaignName: "Meta Chaga Prospecting",
    model: "Chaga",
    budget: 3100,
    spend: 2980,
    leads: 47,
    hotLeads: 5,
    offers: 3,
    sales: 1,
    revenue: 67000,
    cpl: 63,
    costPerHotLead: 596,
    recommendation: "zatrzymaj",
    qualityIssue: "Duży wolumen leadów, ale niski HOT lead rate.",
  },
  {
    id: "C-004",
    platform: "Google Ads",
    campaignName: "Google Waleta Search",
    model: "Waleta",
    budget: 3600,
    spend: 3440,
    leads: 24,
    hotLeads: 8,
    offers: 5,
    sales: 2,
    revenue: 121000,
    cpl: 143,
    costPerHotLead: 430,
    recommendation: "obserwuj",
  },
];

function calcTotals(campaigns: CampaignPerformance[]): Build012Snapshot["totals"] {
  const leads = campaigns.reduce((sum, item) => sum + item.leads, 0);
  const hotLeads = campaigns.reduce((sum, item) => sum + item.hotLeads, 0);
  const offers = campaigns.reduce((sum, item) => sum + item.offers, 0);
  const sales = campaigns.reduce((sum, item) => sum + item.sales, 0);
  const revenue = campaigns.reduce((sum, item) => sum + item.revenue, 0);

  return {
    leads,
    hotLeads,
    offers,
    sales,
    revenue,
    avgCpl: campaigns.reduce((sum, item) => sum + item.cpl, 0) / Math.max(campaigns.length, 1),
    avgCostPerHotLead:
      campaigns.reduce((sum, item) => sum + item.costPerHotLead, 0) / Math.max(campaigns.length, 1),
    hotLeadRatePct: (hotLeads / Math.max(leads, 1)) * 100,
  };
}

function getBudgetRecommendations(campaigns: CampaignPerformance[]): BudgetRecommendation[] {
  return campaigns.map((campaign) => {
    if (campaign.recommendation === "skaluj") {
      return {
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        currentBudget: campaign.budget,
        suggestedBudget: Math.round(campaign.budget * 1.25),
        action: "skaluj",
        reason: "Wysoka konwersja HOT leadów do ofert i sprzedaży.",
        expectedImpact: "+15–25% qualified pipeline",
      };
    }

    if (campaign.recommendation === "zatrzymaj") {
      return {
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        currentBudget: campaign.budget,
        suggestedBudget: 0,
        action: "zatrzymaj",
        reason: "Niski HOT lead rate i słaba monetyzacja ruchu.",
        expectedImpact: "Stop kosztów niskiej jakości ruchu",
      };
    }

    return {
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      currentBudget: campaign.budget,
      suggestedBudget: Math.round(campaign.budget * 0.95),
      action: "obserwuj",
      reason: "Stabilna wydajność, potrzebna dalsza walidacja jakości leadów.",
      expectedImpact: "Utrzymanie ROI przy mniejszym ryzyku",
    };
  });
}

function getAttribution(campaigns: CampaignPerformance[]): Build012Snapshot["attribution"] {
  const bySource = new Map<AdPlatform, { leads: number; hotLeads: number; revenue: number }>();

  campaigns.forEach((campaign) => {
    const current = bySource.get(campaign.platform) ?? { leads: 0, hotLeads: 0, revenue: 0 };
    bySource.set(campaign.platform, {
      leads: current.leads + campaign.leads,
      hotLeads: current.hotLeads + campaign.hotLeads,
      revenue: current.revenue + campaign.revenue,
    });
  });

  return Array.from(bySource.entries()).map(([source, values]) => ({
    source,
    leads: values.leads,
    hotLeads: values.hotLeads,
    revenue: values.revenue,
    hotRatePct: (values.hotLeads / Math.max(values.leads, 1)) * 100,
  }));
}

function getAgencyFixes(campaigns: CampaignPerformance[]): AgencyFixItem[] {
  const lowQualityCampaigns = campaigns.filter(
    (campaign) => (campaign.hotLeads / Math.max(campaign.leads, 1)) * 100 < 20
  );

  const fixes: AgencyFixItem[] = lowQualityCampaigns.map((campaign) => ({
    area: `${campaign.platform} · ${campaign.model}`,
    issue: campaign.qualityIssue ?? "Niska jakość leadów",
    fixToday:
      campaign.platform === "Meta Ads"
        ? "Zmień grupę odbiorców, usuń placementy o niskiej intencji, dodaj filtr pytań kwalifikujących."
        : "Zaostrz słowa kluczowe, wyklucz broad match i negatywne frazy niekonwertujące.",
    owner: "Agencja Performance",
  }));

  fixes.push({
    area: "Lead qualification",
    issue: "Różnice jakości leadów między źródłami",
    fixToday: "Wprowadź wspólny scoring HOT leadów i raport dzienny źródło → oferta.",
    owner: "Growth Lead",
  });

  return fixes;
}

export function createBuild012Snapshot(): Build012Snapshot {
  const campaigns = MOCK_CAMPAIGNS;
  const totals = calcTotals(campaigns);
  const attribution = getAttribution(campaigns);
  const budgetRecommendations = getBudgetRecommendations(campaigns);
  const agencyFixes = getAgencyFixes(campaigns);

  return {
    campaigns,
    totals,
    attribution,
    budgetRecommendations,
    agencyFixes,
    actionSummary: {
      scale: campaigns.filter((item) => item.recommendation === "skaluj").map((item) => item.campaignName),
      stop: campaigns.filter((item) => item.recommendation === "zatrzymaj").map((item) => item.campaignName),
      watch: campaigns.filter((item) => item.recommendation === "obserwuj").map((item) => item.campaignName),
      lowQuality: campaigns
        .filter((item) => (item.hotLeads / Math.max(item.leads, 1)) * 100 < 20)
        .map((item) => `${item.campaignName} (${item.model})`),
    },
  };
}
