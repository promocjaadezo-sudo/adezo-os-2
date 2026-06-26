import { resolveAnalyticsAdsConnectorConfig } from "./config";
import { StubAdsAdapter } from "./adapters";
import type {
  AdsProvider,
  AnalyticsAdsProviderStatus,
  CampaignSyncRecord,
  ConversionSyncRecord,
  DateRange,
} from "./types";

export class GoogleAdsProvider implements AdsProvider {
  readonly name = "google-ads" as const;
  private readonly adapter = new StubAdsAdapter();

  async getCampaigns(_range: DateRange): Promise<CampaignSyncRecord[]> {
    return this.adapter.mapCampaigns([]);
  }

  async getConversions(_range: DateRange): Promise<ConversionSyncRecord[]> {
    return this.adapter.mapConversions([]);
  }

  async getStatus(): Promise<AnalyticsAdsProviderStatus> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const configured = Boolean(config.googleAdsCustomerId && config.googleAdsDeveloperToken);

    return {
      provider: this.name,
      configured,
      syncState: configured ? "stub" : "not-configured",
      lastSyncAt: new Date().toISOString(),
      message: configured
        ? "Google Ads adapter gotowy. Tryb stub: brak realnych pobrań."
        : "Brak konfiguracji Google Ads (customer/developer token).",
      errors: configured ? [] : ["Uzupełnij ADEZO_GOOGLE_ADS_CUSTOMER_ID i ADEZO_GOOGLE_ADS_DEVELOPER_TOKEN."],
    };
  }
}
