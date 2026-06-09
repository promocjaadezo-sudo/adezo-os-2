import { resolveAnalyticsAdsConnectorConfig } from "./config";
import { mapGa4ConversionsResponse, mapGa4SessionsResponse } from "./ga4-mapper";
import { createGa4Status } from "./ga4-status";
import { Ga4Client } from "./ga4-client";
import type {
  AnalyticsAdsProviderStatus,
  AnalyticsProvider,
  AnalyticsSession,
  ConversionSyncRecord,
  DateRange,
  DateRangePreset,
} from "./types";

type SupportedRange = DateRange | DateRangePreset;

export class Ga4LiveProvider implements AnalyticsProvider {
  readonly name = "ga4" as const;

  private readonly fallbackProvider: AnalyticsProvider;
  private lastStatus: AnalyticsAdsProviderStatus | null = null;

  constructor(fallbackProvider: AnalyticsProvider) {
    this.fallbackProvider = fallbackProvider;
  }

  private isConfigured(): boolean {
    const config = resolveAnalyticsAdsConnectorConfig();
    return Boolean(config.ga4PropertyId && (config.ga4CredentialsPath || (config.ga4ClientEmail && config.ga4PrivateKey)));
  }

  private async runLiveSessions(range: SupportedRange): Promise<AnalyticsSession[]> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const client = new Ga4Client(config.ga4PropertyId);
    const raw = await client.runReport({
      range,
      dimensions: ["date", "sessionSource", "sessionMedium", "sessionCampaignName", "landingPage"],
      metrics: ["sessions", "totalUsers"],
    });
    return mapGa4SessionsResponse(raw);
  }

  private async runLiveConversions(range: SupportedRange): Promise<ConversionSyncRecord[]> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const client = new Ga4Client(config.ga4PropertyId);
    const raw = await client.runReport({
      range,
      dimensions: ["date", "sessionSource", "sessionMedium", "sessionCampaignName", "eventName"],
      metrics: ["eventCount"],
    });
    return mapGa4ConversionsResponse(raw);
  }

  async getSessions(range: SupportedRange): Promise<AnalyticsSession[]> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const configured = this.isConfigured();

    if (!config.ga4LiveEnabled || !configured) {
      this.lastStatus = createGa4Status({
        state: "fallback",
        configured,
        message: !config.ga4LiveEnabled
          ? "GA4 Live wyłączony. Używany fallback mock."
          : "Brak pełnych credentials GA4. Używany fallback mock.",
        errors: configured
          ? []
          : ["Brak credentials GA4: GOOGLE_APPLICATION_CREDENTIALS lub GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY."],
      });
      return this.fallbackProvider.getSessions(range);
    }

    try {
      const data = await this.runLiveSessions(range);
      this.lastStatus = createGa4Status({
        state: "connected",
        configured: true,
        message: "GA4 sessions pobrane z Data API.",
      });
      return data;
    } catch (error) {
      this.lastStatus = createGa4Status({
        state: "fallback",
        configured: true,
        message: "GA4 sessions fallback do mock.",
        errors: [error instanceof Error ? error.message : "Nieznany błąd GA4 sessions"],
      });
      return this.fallbackProvider.getSessions(range);
    }
  }

  async getConversions(range: SupportedRange): Promise<ConversionSyncRecord[]> {
    const config = resolveAnalyticsAdsConnectorConfig();
    const configured = this.isConfigured();

    if (!config.ga4LiveEnabled || !configured) {
      this.lastStatus = createGa4Status({
        state: "fallback",
        configured,
        message: !config.ga4LiveEnabled
          ? "GA4 Live wyłączony. Używany fallback mock."
          : "Brak pełnych credentials GA4. Używany fallback mock.",
        errors: configured
          ? []
          : ["Brak credentials GA4: GOOGLE_APPLICATION_CREDENTIALS lub GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY."],
      });
      return this.fallbackProvider.getConversions(range);
    }

    try {
      const data = await this.runLiveConversions(range);
      this.lastStatus = createGa4Status({
        state: "connected",
        configured: true,
        message: "GA4 events pobrane z Data API.",
      });
      return data;
    } catch (error) {
      this.lastStatus = createGa4Status({
        state: "fallback",
        configured: true,
        message: "GA4 events fallback do mock.",
        errors: [error instanceof Error ? error.message : "Nieznany błąd GA4 conversions"],
      });
      return this.fallbackProvider.getConversions(range);
    }
  }

  async getStatus(): Promise<AnalyticsAdsProviderStatus> {
    if (this.lastStatus) {
      return this.lastStatus;
    }

    const baseStatus = await this.fallbackProvider.getStatus();
    return createGa4Status({
      state: baseStatus.syncState === "error" ? "error" : "fallback",
      configured: baseStatus.configured,
      message: "GA4 status inicjalny — fallback do mock do czasu pierwszego sync.",
      errors: baseStatus.errors,
    });
  }
}
