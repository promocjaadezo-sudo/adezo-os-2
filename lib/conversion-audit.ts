import { createAdsProvider, createAnalyticsProvider, createConversionAuditEngine } from "@/lib/providers/analytics-ads";

export async function getConversionAuditSnapshot() {
  const analyticsProvider = createAnalyticsProvider();
  const adsProvider = createAdsProvider();
  const engine = createConversionAuditEngine();

  return engine.run({
    analyticsProvider,
    adsProvider,
  });
}
