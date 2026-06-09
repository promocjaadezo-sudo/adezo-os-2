import { buildGoogleAdsQuery, AdsClient } from "./ads-client";
import { mapAdsCampaignsResponse, mapAdsConversionsResponse } from "./ads-mapper";
import { createAdsStatus } from "./ads-status";
import { resolveAnalyticsAdsConnectorConfig } from "./config";
import type {
  AdsProvider,
  AnalyticsAdsProviderStatus,
  CampaignSyncRecord,
  ConversionSyncRecord,
  DateRange,
} from "./types";

export class GoogleAdsLiveProvider implements AdsProvider {
  readonly name = "google-ads" as const;

  private readonly fallbackProvider: AdsProvider;
  private lastStatus: AnalyticsAdsProviderStatus | null = null;

  constructor(fallbackProvider: AdsProvider) {
    this.fallbackProvider = fallbackProvider;
  }

  private isEnabled(): boolean {
    const config = resolveAnalyticsAdsConnectorConfig();
    return config.useRealApis && config.googleAdsLiveEnabled;
  }

  private isConfigured(): boolean {
    const config = resolveAnalyticsAdsConnectorConfig();
    return Boolean(
      config.googleAdsCustomerId &&
        config.googleAdsDeveloperToken &&
        config.googleAdsClientId &&
        config.googleAdsClientSecret &&
        config.googleAdsRefreshToken,
    );
  }

  private missingCredentialsErrors(): string[] {
    return [
      "Brak konfiguracji Google Ads Live.",
      "Wymagane: GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN.",
    ];
  }

  private async runLive(range: DateRange): Promise<unknown[]> {
    const client = new AdsClient();
    const query = buildGoogleAdsQuery(range);
    return client.searchStream({
      customerId: client.getCustomerId(),
      query,
    });
  }

  async getCampaigns(range: DateRange): Promise<CampaignSyncRecord[]> {
    if (!this.isEnabled()) {
      this.lastStatus = createAdsStatus({
        state: "disabled",
        configured: false,
        message: "Google Ads Live wyłączony (`ADEZO_GOOGLE_ADS_LIVE_ENABLED=false` lub `ADEZO_USE_REAL_APIS=false`).",
      });
      return this.fallbackProvider.getCampaigns(range);
    }

    if (!this.isConfigured()) {
      this.lastStatus = createAdsStatus({
        state: "fallback",
        configured: false,
        message: "Brak wymaganych credentials Google Ads. Używany fallback mock.",
        errors: this.missingCredentialsErrors(),
      });
      return this.fallbackProvider.getCampaigns(range);
    }

    try {
      const raw = await this.runLive(range);
      const campaigns = mapAdsCampaignsResponse(raw);
      this.lastStatus = createAdsStatus({
        state: "connected",
        configured: true,
        message: "Google Ads Live connected — kampanie pobrane z API.",
      });
      return campaigns;
    } catch (error) {
      this.lastStatus = createAdsStatus({
        state: "fallback",
        configured: true,
        message: "Błąd Google Ads API — przełączono na fallback mock.",
        errors: [error instanceof Error ? error.message : "Nieznany błąd Google Ads API"],
      });
      return this.fallbackProvider.getCampaigns(range);
    }
  }

  async getConversions(range: DateRange): Promise<ConversionSyncRecord[]> {
    if (!this.isEnabled()) {
      this.lastStatus = createAdsStatus({
        state: "disabled",
        configured: false,
        message: "Google Ads Live wyłączony (`ADEZO_GOOGLE_ADS_LIVE_ENABLED=false` lub `ADEZO_USE_REAL_APIS=false`).",
      });
      return this.fallbackProvider.getConversions(range);
    }

    if (!this.isConfigured()) {
      this.lastStatus = createAdsStatus({
        state: "fallback",
        configured: false,
        message: "Brak wymaganych credentials Google Ads. Używany fallback mock.",
        errors: this.missingCredentialsErrors(),
      });
      return this.fallbackProvider.getConversions(range);
    }

    try {
      const raw = await this.runLive(range);
      const conversions = mapAdsConversionsResponse(raw);
      this.lastStatus = createAdsStatus({
        state: "connected",
        configured: true,
        message: "Google Ads Live connected — konwersje pobrane z API.",
      });
      return conversions;
    } catch (error) {
      this.lastStatus = createAdsStatus({
        state: "fallback",
        configured: true,
        message: "Błąd Google Ads API — przełączono na fallback mock.",
        errors: [error instanceof Error ? error.message : "Nieznany błąd Google Ads API"],
      });
      return this.fallbackProvider.getConversions(range);
    }
  }

  async getStatus(): Promise<AnalyticsAdsProviderStatus> {
    if (this.lastStatus) {
      return this.lastStatus;
    }

    if (!this.isEnabled()) {
      return createAdsStatus({
        state: "disabled",
        configured: false,
        message: "Google Ads Live wyłączony.",
      });
    }

    if (!this.isConfigured()) {
      return createAdsStatus({
        state: "fallback",
        configured: false,
        message: "Google Ads Live niekompletnie skonfigurowany. Używany fallback mock.",
        errors: this.missingCredentialsErrors(),
      });
    }

    return createAdsStatus({
      state: "fallback",
      configured: true,
      message: "Google Ads status inicjalny — oczekiwanie na pierwszy sync live.",
    });
  }
}
