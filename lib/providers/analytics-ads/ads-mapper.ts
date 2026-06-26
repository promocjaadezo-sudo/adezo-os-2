import { AdsClient } from "./ads-client";
import type { CampaignSyncRecord, ConversionSyncRecord } from "./types";

interface GoogleAdsResultRow {
  campaign?: {
    id?: string | number;
    name?: string;
    status?: string;
  };
  segments?: {
    date?: string;
  };
  metrics?: {
    costMicros?: string | number;
    clicks?: string | number;
    impressions?: string | number;
    conversions?: string | number;
    conversionsValue?: string | number;
    averageCpc?: string | number;
    ctr?: string | number;
    costPerConversion?: string | number;
  };
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function collectRows(raw: unknown): GoogleAdsResultRow[] {
  if (!Array.isArray(raw)) return [];

  const rows: GoogleAdsResultRow[] = [];

  raw.forEach((chunk) => {
    if (!chunk || typeof chunk !== "object") return;
    const results = (chunk as { results?: unknown[] }).results;
    if (!Array.isArray(results)) return;

    results.forEach((result) => {
      if (result && typeof result === "object") {
        rows.push(result as GoogleAdsResultRow);
      }
    });
  });

  return rows;
}

export function mapAdsCampaignsResponse(raw: unknown): CampaignSyncRecord[] {
  const rows = collectRows(raw);

  return rows.map((row, index) => {
    const campaignId = String(row.campaign?.id || `unknown-${index}`);
    const cost = AdsClient.microsToCurrency(row.metrics?.costMicros);

    return {
      id: `gads-${campaignId}-${row.segments?.date || "nodate"}-${index}`,
      date: row.segments?.date || new Date().toISOString().slice(0, 10),
      campaignId,
      campaignName: row.campaign?.name || "Unknown campaign",
      campaignStatus: row.campaign?.status || "UNSPECIFIED",
      platform: "Google Ads",
      impressions: toNumber(row.metrics?.impressions),
      clicks: toNumber(row.metrics?.clicks),
      cost,
      conversions: toNumber(row.metrics?.conversions),
      conversionValue: toNumber(row.metrics?.conversionsValue),
      cpc: AdsClient.microsToCurrency(row.metrics?.averageCpc),
      ctr: toNumber(row.metrics?.ctr),
      costPerConversion: AdsClient.microsToCurrency(row.metrics?.costPerConversion),
    };
  });
}

export function mapAdsConversionsResponse(raw: unknown): ConversionSyncRecord[] {
  const rows = collectRows(raw);

  return rows.reduce<ConversionSyncRecord[]>((acc, row, index) => {
    const conversions = toNumber(row.metrics?.conversions);
    if (conversions <= 0) {
      return acc;
    }

    const campaignId = String(row.campaign?.id || `unknown-${index}`);
    const date = row.segments?.date || new Date().toISOString().slice(0, 10);

    acc.push({
      id: `gads-conv-${campaignId}-${date}-${index}`,
      date,
      conversionName: "google_ads_conversion",
      value: toNumber(row.metrics?.conversionsValue),
      source: "google",
      medium: "cpc",
      campaignId,
      campaignName: row.campaign?.name || "Unknown campaign",
    });

    return acc;
  }, []);
}
