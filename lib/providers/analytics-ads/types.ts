export type AnalyticsAdsProviderName = "ga4" | "google-ads";
export type AnalyticsAdsSyncState = "ready" | "not-configured" | "stub" | "error";

export interface DateRange {
  from: string;
  to: string;
}

export type DateRangePreset = "today" | "yesterday" | "last7days" | "last30days";

export interface AnalyticsAdsProviderStatus {
  provider: AnalyticsAdsProviderName;
  configured: boolean;
  syncState: AnalyticsAdsSyncState;
  lastSyncAt: string;
  message: string;
  errors: string[];
}

export interface AnalyticsSession {
  date: string;
  source: string;
  medium: string;
  campaign?: string;
  landingPage?: string;
  sessions: number;
  users: number;
}

export interface CampaignSyncRecord {
  date: string;
  campaignId: string;
  campaignName: string;
  platform: "Google Ads";
  impressions: number;
  clicks: number;
  cost: number;
}

export interface ConversionSyncRecord {
  id: string;
  date: string;
  conversionName: string;
  value: number;
  source: string;
  medium: string;
  campaignId?: string;
  campaignName?: string;
  gclid?: string;
}

export interface AttributionTouchpoint {
  conversionId: string;
  timestamp: string;
  source: string;
  medium: string;
  campaignId?: string;
  campaignName?: string;
  weight?: number;
}

export interface AttributionResult {
  conversionId: string;
  model: "last-click" | "first-click" | "linear";
  totalValue: number;
  allocated: Array<{
    source: string;
    medium: string;
    campaignId?: string;
    campaignName?: string;
    creditValue: number;
  }>;
}

export interface AnalyticsProvider {
  readonly name: "ga4";
  getSessions(range: DateRange | DateRangePreset): Promise<AnalyticsSession[]>;
  getConversions(range: DateRange | DateRangePreset): Promise<ConversionSyncRecord[]>;
  getStatus(): Promise<AnalyticsAdsProviderStatus>;
}

export interface AdsProvider {
  readonly name: "google-ads";
  getCampaigns(range: DateRange): Promise<CampaignSyncRecord[]>;
  getConversions(range: DateRange): Promise<ConversionSyncRecord[]>;
  getStatus(): Promise<AnalyticsAdsProviderStatus>;
}

export interface AnalyticsAdapter {
  mapSessions(raw: unknown[]): AnalyticsSession[];
  mapConversions(raw: unknown[]): ConversionSyncRecord[];
}

export interface AdsAdapter {
  mapCampaigns(raw: unknown[]): CampaignSyncRecord[];
  mapConversions(raw: unknown[]): ConversionSyncRecord[];
}
