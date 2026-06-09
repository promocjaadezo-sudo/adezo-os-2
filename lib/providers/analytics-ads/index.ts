import { Ga4AnalyticsProvider } from "./analytics-provider";
import { GoogleAdsProvider } from "./ads-provider";
import { GoogleAdsLiveProvider } from "./ads-live-provider";
import { Ga4LiveProvider } from "./ga4-live-provider";
import { resolveAnalyticsAdsConnectorConfig } from "./config";
import { resolveOAuthConnectorStrategy } from "./oauth-connector-strategy";
import { AttributionEngine } from "./engines/attribution-engine";
import { CampaignSyncEngine } from "./engines/campaign-sync-engine";
import { ConversionAuditEngine } from "./engines/conversion-audit-engine";
import { ConversionSyncEngine } from "./engines/conversion-sync-engine";

export function createAnalyticsProvider() {
  const fallback = new Ga4AnalyticsProvider();
  const config = resolveAnalyticsAdsConnectorConfig();
  const strategy = resolveOAuthConnectorStrategy(config);

  if (strategy.ga4.useLiveConnector) {
    return new Ga4LiveProvider(fallback);
  }

  return fallback;
}

export function createAdsProvider() {
  const fallback = new GoogleAdsProvider();
  const config = resolveAnalyticsAdsConnectorConfig();
  const strategy = resolveOAuthConnectorStrategy(config);

  if (strategy.googleAds.useLiveConnector) {
    return new GoogleAdsLiveProvider(fallback);
  }

  return fallback;
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

export function createConversionAuditEngine() {
  return new ConversionAuditEngine();
}

export * from "./types";
export * from "./config";
export * from "./google-auth-config";
export * from "./oauth-provider-status";
export * from "./oauth-connector-strategy";
export * from "./credentials-mode-switch";
