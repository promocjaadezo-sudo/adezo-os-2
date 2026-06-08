import type { OperatingDataStore } from "@/lib/operating-model/types";
import type { DataProviderName, DataProviderStatus, DataSyncState, ProviderRecordCounts } from "./types";

export function countRecords(store: OperatingDataStore): ProviderRecordCounts {
  const leads = store.leads.length;
  const offers = store.offers.length;
  const campaigns = store.campaigns.length;
  const magdaTasks = store.magdaTasks.length;
  const partners = store.partners.length;
  const forecasts = store.forecasts.length;

  return {
    leads,
    offers,
    campaigns,
    magdaTasks,
    partners,
    forecasts,
    total: leads + offers + campaigns + magdaTasks + partners + forecasts,
  };
}

export function createStatus(params: {
  provider: DataProviderName;
  resolvedProvider?: DataProviderName;
  store: OperatingDataStore;
  configured?: boolean;
  syncState?: DataSyncState;
  message?: string;
  incompleteRows?: number;
  incompleteFields?: number;
  errors?: string[];
}): DataProviderStatus {
  return {
    provider: params.provider,
    resolvedProvider: params.resolvedProvider ?? params.provider,
    lastSyncAt: new Date().toISOString(),
    recordCounts: countRecords(params.store),
    syncState: params.syncState ?? "ok",
    configured: params.configured ?? true,
    message: params.message ?? "Dane zsynchronizowane poprawnie.",
    incompleteRows: params.incompleteRows ?? 0,
    incompleteFields: params.incompleteFields ?? 0,
    errors: params.errors ?? [],
  };
}
