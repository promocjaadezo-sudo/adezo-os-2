import { resolveAnalyticsAdsConnectorConfig } from "./config";
import type { DateRange } from "./types";

interface GoogleAdsAuthTokenResponse {
  access_token?: string;
}

interface GoogleAdsSearchRequest {
  customerId: string;
  query: string;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function buildGoogleAdsQuery(range: DateRange): string {
  return [
    "SELECT",
    "  campaign.id,",
    "  campaign.name,",
    "  campaign.status,",
    "  segments.date,",
    "  metrics.cost_micros,",
    "  metrics.clicks,",
    "  metrics.impressions,",
    "  metrics.conversions,",
    "  metrics.conversions_value,",
    "  metrics.average_cpc,",
    "  metrics.ctr,",
    "  metrics.cost_per_conversion",
    "FROM campaign",
    `WHERE segments.date BETWEEN '${range.from}' AND '${range.to}'`,
    "ORDER BY segments.date DESC",
  ].join(" ");
}

export class AdsClient {
  private readonly customerId: string;
  private readonly developerToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;

  constructor() {
    const config = resolveAnalyticsAdsConnectorConfig();
    this.customerId = config.googleAdsCustomerId;
    this.developerToken = config.googleAdsDeveloperToken;
    this.clientId = config.googleAdsClientId;
    this.clientSecret = config.googleAdsClientSecret;
    this.refreshToken = config.googleAdsRefreshToken;

    if (!this.customerId) throw new Error("Brak GOOGLE_ADS_CUSTOMER_ID");
    if (!this.developerToken) throw new Error("Brak GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!this.clientId) throw new Error("Brak GOOGLE_ADS_CLIENT_ID");
    if (!this.clientSecret) throw new Error("Brak GOOGLE_ADS_CLIENT_SECRET");
    if (!this.refreshToken) throw new Error("Brak GOOGLE_ADS_REFRESH_TOKEN");
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Ads OAuth error HTTP ${response.status}`);
    }

    const json = (await response.json()) as GoogleAdsAuthTokenResponse;
    if (!json.access_token) {
      throw new Error("Google Ads OAuth response missing access_token");
    }

    return json.access_token;
  }

  async searchStream(params: GoogleAdsSearchRequest): Promise<unknown[]> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://googleads.googleapis.com/v18/customers/${params.customerId}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": this.developerToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: params.query }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google Ads API error HTTP ${response.status}: ${body.slice(0, 400)}`);
    }

    const json = (await response.json()) as unknown;
    return Array.isArray(json) ? json : [json];
  }

  getCustomerId(): string {
    return this.customerId;
  }

  static microsToCurrency(value: unknown): number {
    return parseNumber(value) / 1_000_000;
  }
}
