import { resolveAnalyticsAdsConnectorConfig } from "./config";
import { StubAnalyticsAdapter } from "./adapters";
import type {
  AnalyticsAdsProviderStatus,
  AnalyticsProvider,
  AnalyticsSession,
  ConversionSyncRecord,
  DateRange,
  DateRangePreset,
} from "./types";

export class Ga4AnalyticsProvider implements AnalyticsProvider {
  readonly name = "ga4" as const;
  private readonly adapter = new StubAnalyticsAdapter();

  async getSessions(_range: DateRange | DateRangePreset): Promise<AnalyticsSession[]> {
    return this.adapter.mapSessions([]);
  }

  async getConversions(_range: DateRange | DateRangePreset): Promise<ConversionSyncRecord[]> {
    return this.adapter.mapConversions([]);
  }

  async getStatus(): Promise<AnalyticsAdsProviderStatus> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const configured = Boolean(config.ga4PropertyId && config.ga4ServiceAccountEmail);

    return {
      provider: this.name,
      configured,
      syncState: configured ? "stub" : "not-configured",
      lastSyncAt: new Date().toISOString(),
      message: configured
        ? "GA4 adapter gotowy. Tryb stub: brak realnych pobrań."
        : "Brak konfiguracji GA4 (property/service account).",
      errors: configured ? [] : ["Uzupełnij ADEZO_GA4_PROPERTY_ID i ADEZO_GA4_SERVICE_ACCOUNT_EMAIL."],
    };
  }
}
