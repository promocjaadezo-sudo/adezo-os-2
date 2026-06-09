import type {
  AdsAdapter,
  AnalyticsAdapter,
  AnalyticsSession,
  CampaignSyncRecord,
  ConversionSyncRecord,
} from "./types";

export class StubAnalyticsAdapter implements AnalyticsAdapter {
  mapSessions(raw: unknown[]): AnalyticsSession[] {
    return raw as AnalyticsSession[];
  }

  mapConversions(raw: unknown[]): ConversionSyncRecord[] {
    return raw as ConversionSyncRecord[];
  }
}

export class StubAdsAdapter implements AdsAdapter {
  mapCampaigns(raw: unknown[]): CampaignSyncRecord[] {
    return raw as CampaignSyncRecord[];
  }

  mapConversions(raw: unknown[]): ConversionSyncRecord[] {
    return raw as ConversionSyncRecord[];
  }
}
