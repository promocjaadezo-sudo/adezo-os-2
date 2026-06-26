import { calculateDataTrustScore, resolveDataSourcePriority } from "@/lib/data-source-priority-engine";
import { monitorCrmFreshness, type CrmFreshnessSnapshot } from "@/lib/crm-freshness-monitor";
import { createAdsProvider, createAnalyticsProvider } from "@/lib/providers/analytics-ads";
import { getProviderStatus, getProviderStore } from "@/lib/providers/data-provider";

export interface LiveDataStatusSnapshot {
  activeDataSource: string;
  requestedDataSource: string;
  lastSyncAt: string;
  leads: number;
  offers: number;
  sales: number;
  dataIncomplete: boolean;
  freshness: CrmFreshnessSnapshot;
  dataTrustScore: number;
  completeness: {
    crm: number;
    ga4: number;
    ads: number;
  };
  missingData: string[];
}

export async function createLiveDataStatusSnapshot(): Promise<LiveDataStatusSnapshot> {
  const analytics = createAnalyticsProvider();
  const ads = createAdsProvider();

  const [providerStatus, store, ga4Status, adsStatus] = await Promise.all([
    getProviderStatus(),
    getProviderStore(),
    analytics.getStatus(),
    ads.getStatus(),
  ]);

  const decision = resolveDataSourcePriority(process.env.ADEZO_DATA_PROVIDER);
  const leads = store.leads.length;
  const offers = store.offers.length;
  const sales = store.offers.filter((offer) => offer.status === "won").length;
  const freshness = monitorCrmFreshness(store);

  const trust = calculateDataTrustScore({
    providerStatus,
    ga4Status,
    adsStatus,
    daysSinceLastData: freshness.daysSinceLastData,
    crmLeads: leads,
    crmOffers: offers,
    crmSales: sales,
  });

  const dataIncomplete =
    providerStatus.resolvedProvider !== "excel-crm" ||
    (leads === 0 && offers === 0 && sales === 0) ||
    freshness.level === "incomplete";

  const missingData = Array.from(new Set([...freshness.alerts, ...trust.missingData]));

  return {
    activeDataSource: providerStatus.resolvedProvider,
    requestedDataSource: decision.requestedProvider,
    lastSyncAt: providerStatus.lastSyncAt,
    leads,
    offers,
    sales,
    dataIncomplete,
    freshness,
    dataTrustScore: trust.score,
    completeness: {
      crm: trust.dimensions.find((item) => item.key === "crm")?.completenessPct ?? 0,
      ga4: trust.dimensions.find((item) => item.key === "ga4")?.completenessPct ?? 0,
      ads: trust.dimensions.find((item) => item.key === "ads")?.completenessPct ?? 0,
    },
    missingData,
  };
}
