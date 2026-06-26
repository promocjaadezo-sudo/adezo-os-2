import type { AdsProvider, AnalyticsProvider, ConversionSyncRecord, DateRange } from "../types";

export interface ConversionSyncSummary {
  ga4Conversions: ConversionSyncRecord[];
  adsConversions: ConversionSyncRecord[];
  mergedConversions: ConversionSyncRecord[];
}

function dedupe(conversions: ConversionSyncRecord[]): ConversionSyncRecord[] {
  const map = new Map<string, ConversionSyncRecord>();

  conversions.forEach((item) => {
    const key = item.id || `${item.date}-${item.conversionName}-${item.value}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

export class ConversionSyncEngine {
  async run(
    analyticsProvider: AnalyticsProvider,
    adsProvider: AdsProvider,
    range: DateRange,
  ): Promise<ConversionSyncSummary> {
    const [ga4Conversions, adsConversions] = await Promise.all([
      analyticsProvider.getConversions(range),
      adsProvider.getConversions(range),
    ]);

    const mergedConversions = dedupe([...ga4Conversions, ...adsConversions]);

    return {
      ga4Conversions,
      adsConversions,
      mergedConversions,
    };
  }
}
