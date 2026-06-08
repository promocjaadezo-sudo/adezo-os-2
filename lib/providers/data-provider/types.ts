import type { OperatingDataStore } from "@/lib/operating-model/types";

export type DataProviderName = "mock" | "csv" | "google-sheets" | "supabase" | "firebase";
export type DataSyncState = "ok" | "fallback-mock" | "error";

export interface ProviderRecordCounts {
  leads: number;
  offers: number;
  campaigns: number;
  magdaTasks: number;
  partners: number;
  forecasts: number;
  total: number;
}

export interface DataProviderStatus {
  provider: DataProviderName;
  resolvedProvider: DataProviderName;
  lastSyncAt: string;
  recordCounts: ProviderRecordCounts;
  syncState: DataSyncState;
  configured: boolean;
  message: string;
  incompleteRows: number;
  incompleteFields: number;
  errors: string[];
}

export interface DataProvider {
  readonly name: DataProviderName;
  getStore(): Promise<OperatingDataStore>;
  getStatus(): Promise<DataProviderStatus>;
}
