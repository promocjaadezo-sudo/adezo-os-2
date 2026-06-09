import { createAdsProvider, createAnalyticsProvider, resolveAnalyticsAdsConnectorConfig } from "@/lib/providers/analytics-ads";
import { getProviderStatus } from "@/lib/providers/data-provider";
import { GoogleSheetsProvider } from "@/lib/providers/data-provider/google-sheets-provider";
import { MockProvider } from "@/lib/providers/data-provider/mock-provider";

export type IntegrationUiStatus = "CONNECTED" | "FALLBACK" | "ERROR" | "DISABLED";

export interface IntegrationHealthItem {
  key: "ga4" | "google-ads" | "mock" | "google-sheets";
  name: string;
  status: IntegrationUiStatus;
  active: boolean;
  lastSyncAt: string;
  records: number;
  lastError: string;
  detail: string;
}

export interface IntegrationHealthSnapshot {
  activeProvider: string;
  lastSyncAt: string;
  totalRecords: number;
  items: IntegrationHealthItem[];
}

function latestSync(items: IntegrationHealthItem[]): string {
  return items
    .map((item) => item.lastSyncAt)
    .filter(Boolean)
    .sort((a, b) => (a > b ? -1 : 1))[0] || new Date().toISOString();
}

export async function getIntegrationHealthSnapshot(): Promise<IntegrationHealthSnapshot> {
  const config = resolveAnalyticsAdsConnectorConfig();

  const analyticsProvider = createAnalyticsProvider();
  const adsProvider = createAdsProvider();
  const googleSheetsProvider = new GoogleSheetsProvider();
  const mockProvider = new MockProvider();

  const [
    activeDataStatus,
    ga4Status,
    adsStatus,
    mockStatus,
    googleSheetsStatus,
    ga4Sessions,
    ga4Conversions,
    adsCampaigns,
    adsConversions,
  ] = await Promise.all([
    getProviderStatus(),
    analyticsProvider.getStatus(),
    adsProvider.getStatus(),
    mockProvider.getStatus(),
    googleSheetsProvider.getStatus(),
    analyticsProvider.getSessions("last7days"),
    analyticsProvider.getConversions("last7days"),
    adsProvider.getCampaigns({ from: new Date().toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }),
    adsProvider.getConversions({ from: new Date().toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }),
  ]);

  const ga4State: IntegrationUiStatus = !config.useRealApis || !config.ga4LiveEnabled
    ? "DISABLED"
    : ga4Status.syncState === "error"
      ? "ERROR"
      : ga4Status.syncState === "ready"
        ? "CONNECTED"
        : "FALLBACK";

  const adsState: IntegrationUiStatus = !config.useRealApis || !config.googleAdsLiveEnabled
    ? "DISABLED"
    : adsStatus.syncState === "error"
      ? "ERROR"
      : adsStatus.syncState === "ready"
        ? "CONNECTED"
        : "FALLBACK";

  const sheetsState: IntegrationUiStatus = !googleSheetsStatus.configured
    ? "DISABLED"
    : googleSheetsStatus.syncState === "error"
      ? "ERROR"
      : googleSheetsStatus.syncState === "fallback-mock"
        ? "FALLBACK"
        : "CONNECTED";

  const mockState: IntegrationUiStatus = mockStatus.syncState === "error" ? "ERROR" : "CONNECTED";

  const items: IntegrationHealthItem[] = [
    {
      key: "ga4",
      name: "GA4",
      status: ga4State,
      active: config.useRealApis && config.ga4LiveEnabled,
      lastSyncAt: ga4Status.lastSyncAt,
      records: ga4Sessions.length + ga4Conversions.length,
      lastError: ga4Status.errors[0] || "-",
      detail: ga4Status.message,
    },
    {
      key: "google-ads",
      name: "Google Ads",
      status: adsState,
      active: config.useRealApis && config.googleAdsLiveEnabled,
      lastSyncAt: adsStatus.lastSyncAt,
      records: adsCampaigns.length + adsConversions.length,
      lastError: adsStatus.errors[0] || "-",
      detail: adsStatus.message,
    },
    {
      key: "mock",
      name: "Mock Provider",
      status: mockState,
      active: activeDataStatus.resolvedProvider === "mock",
      lastSyncAt: mockStatus.lastSyncAt,
      records: mockStatus.recordCounts.total,
      lastError: mockStatus.errors[0] || "-",
      detail: mockStatus.message,
    },
    {
      key: "google-sheets",
      name: "Google Sheets",
      status: sheetsState,
      active: activeDataStatus.provider === "google-sheets",
      lastSyncAt: googleSheetsStatus.lastSyncAt,
      records: googleSheetsStatus.recordCounts.total,
      lastError: googleSheetsStatus.errors[0] || "-",
      detail: googleSheetsStatus.message,
    },
  ];

  return {
    activeProvider: activeDataStatus.resolvedProvider,
    lastSyncAt: latestSync(items),
    totalRecords: items.reduce((sum, item) => sum + item.records, 0),
    items,
  };
}
