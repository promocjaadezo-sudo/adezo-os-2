import { getProviderStatus, getProviderStore } from "@/lib/providers/data-provider";
import { createAdsProvider, createAnalyticsProvider } from "@/lib/providers/analytics-ads";
import { buildSourceToSaleAttribution, type RevenueTruthChannel, type RevenueTruthRow } from "@/lib/source-to-sale-attribution";

export interface RevenueTruthSummary {
  leads: number;
  offers: number;
  sales: number;
  revenue: number;
  cost: number;
  costPerLead: number;
  costPerSale: number;
  roas: number;
  gapToPlan: number;
  plan: number;
  ga4LeadCount: number;
}

export interface RevenueTruthSnapshot {
  generatedAt: string;
  summary: RevenueTruthSummary;
  rows: RevenueTruthRow[];
  topRevenueSources: Array<{ label: string; revenue: number; sales: number }>;
  campaignsWithoutSales: Array<{ campaignName: string; channel: RevenueTruthChannel; leads: number; offers: number; cost: number }>;
  unattributedLeads: Array<{ leadId: string; clientName: string }>;
  salesByChannel: Array<{ channel: RevenueTruthChannel; sales: number; revenue: number }>;
  provider: {
    resolvedProvider: string;
    incompleteRows: number;
    incompleteFields: number;
  };
}

function safeDiv(numerator: number, denominator: number): number {
  return numerator / Math.max(1, denominator);
}

function topSources(rows: RevenueTruthRow[]) {
  return rows
    .slice()
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5)
    .map((row) => ({
      label: `${row.channel}: ${row.campaignName}`,
      revenue: row.revenue,
      sales: row.sales,
    }));
}

export async function createRevenueTruthLayerSnapshot(): Promise<RevenueTruthSnapshot> {
  const analyticsProvider = createAnalyticsProvider();
  const adsProvider = createAdsProvider();

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 29);
  const range = {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };

  const [store, providerStatus, ga4Conversions, adsCampaigns] = await Promise.all([
    getProviderStore(),
    getProviderStatus(),
    analyticsProvider.getConversions("last30days"),
    adsProvider.getCampaigns(range),
  ]);

  const attribution = buildSourceToSaleAttribution({
    store,
    ga4Conversions,
    adsCampaigns,
  });

  const leads = Math.max(store.leads.length, attribution.ga4LeadCount);
  const offers = store.offers.length;
  const sales = store.offers.filter((offer) => offer.status === "won").length;
  const revenue = store.offers.filter((offer) => offer.status === "won").reduce((sum, offer) => sum + offer.value, 0);
  const cost = attribution.rows.reduce((sum, row) => sum + row.cost, 0);
  const plan = store.forecasts[0]?.revenuePlan || 0;
  const gapToPlan = Math.max(0, plan - revenue);

  const unattributedLeads = attribution.unattributedLeadIds
    .map((leadId) => {
      const lead = store.leads.find((item) => item.id === leadId);
      if (!lead) return null;
      return {
        leadId,
        clientName: lead.clientName,
      };
    })
    .filter((item): item is { leadId: string; clientName: string } => Boolean(item));

  const campaignsWithoutSales = attribution.rows
    .filter((row) => row.sales <= 0 && row.leads > 0)
    .sort((left, right) => right.cost - left.cost)
    .slice(0, 8)
    .map((row) => ({
      campaignName: row.campaignName,
      channel: row.channel,
      leads: row.leads,
      offers: row.offers,
      cost: row.cost,
    }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      leads,
      offers,
      sales,
      revenue,
      cost,
      costPerLead: safeDiv(cost, leads),
      costPerSale: safeDiv(cost, sales),
      roas: safeDiv(revenue, cost),
      gapToPlan,
      plan,
      ga4LeadCount: attribution.ga4LeadCount,
    },
    rows: attribution.rows,
    topRevenueSources: topSources(attribution.rows),
    campaignsWithoutSales,
    unattributedLeads,
    salesByChannel: attribution.salesByChannel,
    provider: {
      resolvedProvider: providerStatus.resolvedProvider,
      incompleteRows: providerStatus.incompleteRows,
      incompleteFields: providerStatus.incompleteFields,
    },
  };
}
