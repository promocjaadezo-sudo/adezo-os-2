import { Ga4AnalyticsProvider } from "./analytics-provider";
import { GoogleAdsProvider } from "./ads-provider";
import { Ga4LiveProvider } from "./ga4-live-provider";
import { resolveAnalyticsAdsConnectorConfig } from "./config";
import { AttributionEngine } from "./engines/attribution-engine";
import { CampaignSyncEngine } from "./engines/campaign-sync-engine";
import { ConversionSyncEngine } from "./engines/conversion-sync-engine";

export function createAnalyticsProvider() {
  const fallback = new Ga4AnalyticsProvider();
  const config = resolveAnalyticsAdsConnectorConfig();

  if (config.useRealApis && config.ga4LiveEnabled) {
    return new Ga4LiveProvider(fallback);
  }

  return fallback;
}

export function createAdsProvider() {
  return new GoogleAdsProvider();
}

export function createCampaignSyncEngine() {
  return new CampaignSyncEngine();
}

export function createConversionSyncEngine() {
  return new ConversionSyncEngine();
}

export function createAttributionEngine() {
  return new AttributionEngine();
}

export * from "./types";
export * from "./config";
