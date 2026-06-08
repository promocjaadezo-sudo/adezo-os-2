import {
  buildNextBestAction,
  calculateCampaignRoi,
  calculateDataCompleteness,
  calculateForecast,
  calculateOfferAging,
  calculateRevenueGap,
} from "./helpers";
import { getProviderStore } from "@/lib/providers/data-provider";
import type { CampaignDerivedMetrics, LeadEntity } from "./types";

export async function getCampaignDerivedMetrics(): Promise<CampaignDerivedMetrics[]> {
  const store = await getProviderStore();

  return store.campaigns.map((campaign) => {
    const campaignLeads = store.leads.filter((lead) => lead.campaignId === campaign.id);
    const campaignOffers = store.offers.filter((offer) => offer.campaignId === campaign.id);
    const salesOffers = campaignOffers.filter((offer) => offer.status === "won");

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      model: campaign.model,
      leads: campaignLeads.length,
      hotLeads: campaignLeads.filter((lead) => lead.temperature === "HOT").length,
      offers: campaignOffers.length,
      sales: salesOffers.length,
      revenue: salesOffers.reduce((sum, offer) => sum + offer.value, 0),
      cost: campaign.monthlyBudget,
    };
  });
}

export async function getExecutiveNumbers(): Promise<{
  plan: number;
  sold: number;
  forecast: number;
  gap: number;
}> {
  const store = await getProviderStore();
  const forecastCalc = calculateForecast(store.offers);
  const plan = store.forecasts[0]?.revenuePlan ?? 0;
  const gap = calculateRevenueGap(plan, forecastCalc.forecast);

  return {
    plan,
    sold: forecastCalc.sold,
    forecast: forecastCalc.forecast,
    gap,
  };
}

export async function getDataCompletenessSummary(): Promise<{
  leadIncompleteCount: number;
  offerMissingReasonCount: number;
}> {
  const store = await getProviderStore();

  const leadRequiredFields: Array<keyof LeadEntity> = ["clientName", "source", "budget", "status", "createdAt"];
  const leadIncompleteCount = store.leads.filter((lead) => calculateDataCompleteness(lead, leadRequiredFields).completenessPct < 100).length;

  const offerMissingReasonCount = store.offers.filter((offer) => (offer.status === "won" || offer.status === "lost") && !offer.decisionReason).length;

  return { leadIncompleteCount, offerMissingReasonCount };
}

export async function getTopRevenueOpportunities(limit = 3): Promise<Array<{
  clientName: string;
  value: number;
  winProbability: number;
  nextBestAction: string;
}>> {
  const store = await getProviderStore();

  return store.offers
    .filter((offer) => offer.status !== "won" && offer.status !== "lost")
    .map((offer) => {
      const lead = store.leads.find((item) => item.id === offer.leadId);
      return {
        clientName: lead?.clientName ?? offer.leadId,
        value: offer.value,
        winProbability: offer.winProbability,
        nextBestAction: buildNextBestAction({ offer, agingDays: calculateOfferAging(offer) }),
      };
    })
    .sort((left, right) => right.value * right.winProbability - left.value * left.winProbability)
    .slice(0, limit);
}

export async function getCampaignRoiDecisionRows() {
  const metricsRows = await getCampaignDerivedMetrics();
  return metricsRows.map((metrics) => {
    const roi = calculateCampaignRoi(metrics);
    const nextBest = buildNextBestAction({
      campaign: { id: metrics.campaignId, name: metrics.campaignName, model: metrics.model, monthlyBudget: metrics.cost, platform: "Meta", status: "active" },
      campaignRoi: { ...roi, sales: metrics.sales },
    });

    return {
      ...metrics,
      ...roi,
      nextBest,
    };
  });
}
