import { getCampaignDerivedMetrics } from "@/lib/operating-model";
import { createRevenueTruthLayerSnapshot } from "@/lib/revenue-truth-layer";

export type CampaignModel = "Tirana" | "Astana" | "Chaga" | "Waleta";

export interface CampaignRecord {
  id: string;
  campaignName: string;
  platform: "Meta" | "Google";
  model: CampaignModel;
  cost: number;
  leads: number;
  hotLeads: number;
  offers: number;
  sales: number;
  revenue: number;
}

export interface CampaignAttributionRow {
  campaignName: string;
  leads: number;
  hotLeads: number;
  offers: number;
  sales: number;
  revenue: number;
}

export interface CampaignRoiRow {
  campaignName: string;
  roas: number;
  cpl: number;
  cps: number;
  hotLeadRate: number;
  decision: "scale" | "watch" | "stop" | "optimize-quality" | "scale-carefully";
  reason: string;
}

export interface CostPerSaleItem {
  campaignName: string;
  sales: number;
  cost: number;
  costPerSale: number;
  revenue: number;
}

export interface ModelCampaignPerformanceItem {
  model: CampaignModel;
  campaigns: number;
  cost: number;
  revenue: number;
  roas: number;
  hotLeadRate: number;
  budgetPriority: "highest" | "high" | "medium";
}

export interface BudgetShiftRecommendation {
  fromCampaign?: string;
  toCampaign?: string;
  action: string;
  amountSuggestion: string;
  why: string;
  priority: "highest" | "high" | "medium";
}

export interface AgencyAccountabilityItem {
  campaignName: string;
  issue: string;
  expectedFix: string;
  deadline: string;
  owner: "Agencja" | "CEO";
  severity: "danger" | "warning" | "gold";
}

export interface Build019Snapshot {
  campaigns: CampaignRecord[];
  attribution: CampaignAttributionRow[];
  roiBoard: CampaignRoiRow[];
  costPerSale: CostPerSaleItem[];
  modelPerformance: ModelCampaignPerformanceItem[];
  budgetShift: BudgetShiftRecommendation[];
  agencyPanel: AgencyAccountabilityItem[];
  monthlyPlanImpact: string;
}

function safeRate(numerator: number, denominator: number): number {
  return numerator / Math.max(1, denominator) * 100;
}

function safeDiv(numerator: number, denominator: number): number {
  return numerator / Math.max(1, denominator);
}

function decisionForCampaign(campaign: CampaignRecord): { decision: CampaignRoiRow["decision"]; reason: string } {
  const roas = safeDiv(campaign.revenue, campaign.cost);
  const hotLeadRate = safeRate(campaign.hotLeads, campaign.leads);
  const cpl = safeDiv(campaign.cost, campaign.leads);

  if (roas > 5) {
    return { decision: "scale", reason: "ROAS > 5, kampania realnie zarabia i nadaje się do skalowania." };
  }

  if (hotLeadRate < 10) {
    return { decision: "watch", reason: "HOT Lead Rate < 10% — popraw target i kreacje." };
  }

  if (cpl > 300 && campaign.sales === 0) {
    return { decision: "stop", reason: "Wysoki CPL i brak sprzedaży — zatrzymaj kampanię." };
  }

  if (campaign.leads >= 80 && campaign.sales <= 1) {
    return { decision: "optimize-quality", reason: "Dużo leadów, mało sprzedaży — problem jakości leadów." };
  }

  if (campaign.leads < 35 && campaign.sales >= 4) {
    return { decision: "scale-carefully", reason: "Mało leadów, ale wysoka skuteczność sprzedaży — skaluj ostrożnie." };
  }

  return { decision: "watch", reason: "Kampania wymaga obserwacji i dalszej optymalizacji." };
}

function createRoiBoard(campaigns: CampaignRecord[]): CampaignRoiRow[] {
  return campaigns
    .map((campaign) => {
      const decision = decisionForCampaign(campaign);
      return {
        campaignName: campaign.campaignName,
        roas: safeDiv(campaign.revenue, campaign.cost),
        cpl: safeDiv(campaign.cost, campaign.leads),
        cps: safeDiv(campaign.cost, campaign.sales),
        hotLeadRate: safeRate(campaign.hotLeads, campaign.leads),
        decision: decision.decision,
        reason: decision.reason,
      };
    })
    .sort((left, right) => right.roas - left.roas);
}

function createModelPerformance(campaigns: CampaignRecord[]): ModelCampaignPerformanceItem[] {
  const models: CampaignModel[] = ["Tirana", "Astana", "Chaga", "Waleta"];

  return models
    .map((model) => {
      const rows = campaigns.filter((campaign) => campaign.model === model);
      const cost = rows.reduce((sum, row) => sum + row.cost, 0);
      const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
      const leads = rows.reduce((sum, row) => sum + row.leads, 0);
      const hotLeads = rows.reduce((sum, row) => sum + row.hotLeads, 0);
      const roas = safeDiv(revenue, cost);

      const budgetPriority: ModelCampaignPerformanceItem["budgetPriority"] =
        model === "Tirana" && roas > 4 ? "highest" : roas > 3 ? "high" : "medium";

      return {
        model,
        campaigns: rows.length,
        cost,
        revenue,
        roas,
        hotLeadRate: safeRate(hotLeads, leads),
        budgetPriority,
      };
    })
    .sort((left, right) => right.roas - left.roas);
}

function createBudgetShiftRecommendations(campaigns: CampaignRecord[], roiBoard: CampaignRoiRow[]): BudgetShiftRecommendation[] {
  const recommendations: BudgetShiftRecommendation[] = [];

  const scalable = roiBoard.filter((row) => row.decision === "scale" || row.decision === "scale-carefully");
  const stopping = roiBoard.filter((row) => row.decision === "stop");

  stopping.forEach((stopItem) => {
    const target = scalable[0];
    recommendations.push({
      fromCampaign: stopItem.campaignName,
      toCampaign: target?.campaignName,
      action: "Przesuń budżet z kampanii nierentownej do kampanii z najwyższym ROAS.",
      amountSuggestion: "20-35% budżetu tygodniowego",
      why: `${stopItem.campaignName} ma wysoki koszt bez sprzedaży.`,
      priority: "highest",
    });
  });

  const tiranaHighRoi = campaigns.some((campaign) => campaign.model === "Tirana" && safeDiv(campaign.revenue, campaign.cost) > 4);
  if (tiranaHighRoi) {
    recommendations.push({
      action: "Zwiększ udział budżetu dla kampanii modelu Tirana.",
      amountSuggestion: "+15-25%",
      why: "Kampanie Tirana osiągają wysoki ROI i wspierają plan miesięczny.",
      priority: "high",
    });
  }

  const qualityIssue = roiBoard.find((row) => row.decision === "optimize-quality");
  if (qualityIssue) {
    recommendations.push({
      fromCampaign: qualityIssue.campaignName,
      action: "Nie zwiększaj budżetu dopóki agencyjnie nie poprawimy jakości leadów.",
      amountSuggestion: "Budżet bez zmian przez 7 dni",
      why: "Dużo leadów bez sprzedaży = niski wpływ przychodowy.",
      priority: "high",
    });
  }

  return recommendations.slice(0, 6);
}

function createAgencyPanel(campaigns: CampaignRecord[], roiBoard: CampaignRoiRow[]): AgencyAccountabilityItem[] {
  const rows: AgencyAccountabilityItem[] = [];

  roiBoard.forEach((item) => {
    if (item.decision === "stop") {
      rows.push({
        campaignName: item.campaignName,
        issue: "Kampania przepala budżet bez sprzedaży.",
        expectedFix: "Nowy target, nowa kreacja i redefinicja persony przed restartem.",
        deadline: "48h",
        owner: "Agencja",
        severity: "danger",
      });
      return;
    }

    if (item.hotLeadRate < 10) {
      rows.push({
        campaignName: item.campaignName,
        issue: "Za niski udział HOT leadów.",
        expectedFix: "Zawęzić target i podmienić komunikat na premium-intent.",
        deadline: "72h",
        owner: "Agencja",
        severity: "warning",
      });
    }
  });

  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
  const totalCost = campaigns.reduce((sum, campaign) => sum + campaign.cost, 0);
  const totalRoas = safeDiv(totalRevenue, totalCost);

  rows.push({
    campaignName: "Kanał płatny łącznie",
    issue: `ROAS globalny = ${totalRoas.toFixed(2)}.`,
    expectedFix: "Raport agencyjny: top 3 kampanie do skalowania i 2 do zatrzymania.",
    deadline: "Poniedziałek 10:00",
    owner: "CEO",
    severity: totalRoas >= 4 ? "gold" : "warning",
  });

  return rows;
}

export async function createBuild019Snapshot(): Promise<Build019Snapshot> {
  const [derivedMetrics, truth] = await Promise.all([
    getCampaignDerivedMetrics(),
    createRevenueTruthLayerSnapshot(),
  ]);

  const truthByName = new Map(
    truth.rows.map((row) => [row.campaignName.toLowerCase(), row]),
  );

  const campaigns: CampaignRecord[] = derivedMetrics.map((metrics) => {
    const truthRow = truthByName.get(metrics.campaignName.toLowerCase());
    return {
      id: metrics.campaignId,
      campaignName: metrics.campaignName,
      platform: (truthRow?.channel === "Google Ads" || metrics.campaignName.toLowerCase().includes("google")) ? "Google" : "Meta",
      model: metrics.model,
      cost: truthRow?.cost ?? metrics.cost,
      leads: truthRow?.leads ?? metrics.leads,
      hotLeads: Math.min(metrics.hotLeads, truthRow?.leads ?? metrics.leads),
      offers: truthRow?.offers ?? metrics.offers,
      sales: truthRow?.sales ?? metrics.sales,
      revenue: truthRow?.revenue ?? metrics.revenue,
    };
  });

  const known = new Set(campaigns.map((campaign) => campaign.campaignName.toLowerCase()));
  truth.rows.forEach((row) => {
    if (known.has(row.campaignName.toLowerCase())) return;

    campaigns.push({
      id: row.attributionKey,
      campaignName: row.campaignName,
      platform: row.channel === "Google Ads" ? "Google" : "Meta",
      model: "Tirana",
      cost: row.cost,
      leads: row.leads,
      hotLeads: Math.min(row.leads, row.sales),
      offers: row.offers,
      sales: row.sales,
      revenue: row.revenue,
    });
  });

  const attribution: CampaignAttributionRow[] = campaigns.map((campaign) => ({
    campaignName: campaign.campaignName,
    leads: campaign.leads,
    hotLeads: campaign.hotLeads,
    offers: campaign.offers,
    sales: campaign.sales,
    revenue: campaign.revenue,
  }));

  const roiBoard = createRoiBoard(campaigns);

  const costPerSale: CostPerSaleItem[] = campaigns.map((campaign) => ({
    campaignName: campaign.campaignName,
    sales: campaign.sales,
    cost: campaign.cost,
    costPerSale: safeDiv(campaign.cost, campaign.sales),
    revenue: campaign.revenue,
  }));

  const modelPerformance = createModelPerformance(campaigns);
  const budgetShift = createBudgetShiftRecommendations(campaigns, roiBoard);
  const agencyPanel = createAgencyPanel(campaigns, roiBoard);

  const pipelineRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
  const topCampaign = roiBoard[0];

  return {
    campaigns,
    attribution,
    roiBoard,
    costPerSale,
    modelPerformance,
    budgetShift,
    agencyPanel,
    monthlyPlanImpact:
      `Top kampania: ${topCampaign?.campaignName ?? "—"}. ` +
      `Łączny przychód przypisany do kampanii: ${pipelineRevenue.toLocaleString("pl-PL")} zł. ` +
      `GA4 lead_count: ${truth.summary.ga4LeadCount.toFixed(0)}. ` +
      "Przesunięcie budżetu do kampanii z ROAS>5 zwiększa szansę dowiezienia planu miesiąca.",
  };
}
