import type { OperatingDataStore } from "@/lib/operating-model/types";
import type { CampaignSyncRecord, ConversionSyncRecord } from "@/lib/providers/analytics-ads";
import { deriveGa4LeadMetrics } from "@/lib/providers/analytics-ads/lead-metrics";
import { buildAttributionKey, matchCampaignToCrm } from "@/lib/campaign-to-crm-matcher";

export type RevenueTruthChannel = "Google Ads" | "Meta" | "Organic" | "Direct" | "Referral" | "UNATTRIBUTED";

export interface RevenueTruthRow {
  attributionKey: string;
  campaignName: string;
  source: string;
  medium: string;
  channel: RevenueTruthChannel;
  leads: number;
  ga4Leads: number;
  offers: number;
  sales: number;
  revenue: number;
  cost: number;
  costPerLead: number;
  costPerSale: number;
  roas: number;
  unattributedLeads: number;
}

export interface SalesByChannelRow {
  channel: RevenueTruthChannel;
  sales: number;
  revenue: number;
}

export interface SourceToSaleAttributionSnapshot {
  rows: RevenueTruthRow[];
  salesByChannel: SalesByChannelRow[];
  ga4LeadCount: number;
  unattributedLeadIds: string[];
}

interface GroupAccumulator {
  attributionKey: string;
  campaignName: string;
  source: string;
  medium: string;
  channel: RevenueTruthChannel;
  leadIds: Set<string>;
  offers: number;
  sales: number;
  revenue: number;
  cost: number;
  ga4Leads: number;
  unattributedLeads: number;
}

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function safeDiv(numerator: number, denominator: number): number {
  return numerator / Math.max(1, denominator);
}

function toChannel(source?: string, medium?: string): RevenueTruthChannel {
  const src = normalize(source);
  const med = normalize(medium);

  if (src.includes("google") || med.includes("cpc") || med.includes("ppc")) return "Google Ads";
  if (src.includes("meta") || src.includes("facebook") || src.includes("instagram")) return "Meta";
  if (src.includes("referral") || src.includes("polecen") || src.includes("partner") || src.includes("architect")) return "Referral";
  if (src.includes("direct") || src.includes("(direct)")) return "Direct";
  if (src.includes("organic") || med.includes("organic") || src.includes("seo")) return "Organic";
  return "UNATTRIBUTED";
}

function createGa4LeadMap(ga4Conversions: ConversionSyncRecord[]): Map<string, number> {
  const grouped = new Map<string, ConversionSyncRecord[]>();

  for (const row of ga4Conversions) {
    const key = buildAttributionKey(row.source, row.medium, row.campaignName);
    const bucket = grouped.get(key) || [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  const leadMap = new Map<string, number>();
  grouped.forEach((records, key) => {
    leadMap.set(key, deriveGa4LeadMetrics(records).lead_count);
  });
  return leadMap;
}

export function buildSourceToSaleAttribution(params: {
  store: OperatingDataStore;
  ga4Conversions: ConversionSyncRecord[];
  adsCampaigns: CampaignSyncRecord[];
}): SourceToSaleAttributionSnapshot {
  const { store, ga4Conversions, adsCampaigns } = params;
  const offersByLead = new Map<string, typeof store.offers>();
  const ga4LeadMap = createGa4LeadMap(ga4Conversions);

  for (const offer of store.offers) {
    const list = offersByLead.get(offer.leadId) || [];
    list.push(offer);
    offersByLead.set(offer.leadId, list);
  }

  const adsCandidates = adsCampaigns.map((item) => ({
    id: item.campaignId,
    campaignName: item.campaignName,
    source: "google",
    medium: "cpc",
  }));

  const groups = new Map<string, GroupAccumulator>();
  const unattributedLeadIds = new Set<string>();

  for (const lead of store.leads) {
    const offers = offersByLead.get(lead.id) || [];
    const sales = offers.filter((offer) => offer.status === "won");
    const crmCampaign = store.campaigns.find((campaign) => campaign.id === lead.campaignId);
    const sourceGuess = lead.source || "";
    const mediumGuess = sourceGuess === "google" ? "cpc" : sourceGuess === "meta" ? "paid-social" : "organic";

    const ga4Candidates = Array.from(ga4LeadMap.keys()).map((key) => {
      const [source, medium, campaignName] = key.split("|");
      return { source, medium, campaignName };
    });

    const match = matchCampaignToCrm(crmCampaign?.name, [...ga4Candidates, ...adsCandidates]);
    const fallbackKey = buildAttributionKey(sourceGuess, mediumGuess, crmCampaign?.name || "UNATTRIBUTED");
    const attributionKey = match.matched ? match.key : fallbackKey;

    const source = (match.candidate?.source || sourceGuess || "").trim() || "UNATTRIBUTED";
    const medium = (match.candidate?.medium || mediumGuess || "").trim() || "UNATTRIBUTED";
    const campaignName = (match.candidate?.campaignName || crmCampaign?.name || "UNATTRIBUTED").trim();

    let channel = toChannel(source, medium);
    if (!lead.campaignId && !crmCampaign?.name) {
      channel = "UNATTRIBUTED";
      unattributedLeadIds.add(lead.id);
    }

    const bucket =
      groups.get(attributionKey) ||
      {
        attributionKey,
        campaignName,
        source,
        medium,
        channel,
        leadIds: new Set<string>(),
        offers: 0,
        sales: 0,
        revenue: 0,
        cost: 0,
        ga4Leads: ga4LeadMap.get(attributionKey) || 0,
        unattributedLeads: 0,
      };

    bucket.leadIds.add(lead.id);
    bucket.offers += offers.length;
    bucket.sales += sales.length;
    bucket.revenue += sales.reduce((sum, offer) => sum + offer.value, 0);

    if (bucket.channel === "UNATTRIBUTED") {
      bucket.unattributedLeads += 1;
    }

    groups.set(attributionKey, bucket);
  }

  const adsByCampaign = new Map<string, number>();
  for (const campaign of adsCampaigns) {
    const current = adsByCampaign.get(campaign.campaignName) || 0;
    adsByCampaign.set(campaign.campaignName, current + (campaign.cost || 0));
  }

  groups.forEach((group) => {
    if (group.channel === "Google Ads") {
      group.cost = adsByCampaign.get(group.campaignName) || 0;
    }
  });

  const rows: RevenueTruthRow[] = Array.from(groups.values())
    .map((group) => {
      const leads = group.leadIds.size;
      return {
        attributionKey: group.attributionKey,
        campaignName: group.campaignName,
        source: group.source,
        medium: group.medium,
        channel: group.channel,
        leads,
        ga4Leads: group.ga4Leads,
        offers: group.offers,
        sales: group.sales,
        revenue: group.revenue,
        cost: group.cost,
        costPerLead: safeDiv(group.cost, leads),
        costPerSale: safeDiv(group.cost, group.sales),
        roas: safeDiv(group.revenue, group.cost),
        unattributedLeads: group.unattributedLeads,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);

  const channelAccumulator = new Map<RevenueTruthChannel, { sales: number; revenue: number }>();
  rows.forEach((row) => {
    const current = channelAccumulator.get(row.channel) || { sales: 0, revenue: 0 };
    current.sales += row.sales;
    current.revenue += row.revenue;
    channelAccumulator.set(row.channel, current);
  });

  const allChannels: RevenueTruthChannel[] = ["Google Ads", "Meta", "Organic", "Direct", "Referral", "UNATTRIBUTED"];
  const salesByChannel: SalesByChannelRow[] = allChannels.map((channel) => ({
    channel,
    sales: channelAccumulator.get(channel)?.sales || 0,
    revenue: channelAccumulator.get(channel)?.revenue || 0,
  }));

  return {
    rows,
    salesByChannel,
    ga4LeadCount: deriveGa4LeadMetrics(ga4Conversions).lead_count,
    unattributedLeadIds: Array.from(unattributedLeadIds),
  };
}
