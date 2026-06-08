import { CsvProvider } from "./csv-provider";
import { FirebaseProvider } from "./firebase-provider";
import { GoogleSheetsProvider } from "./google-sheets-provider";
import { MockProvider } from "./mock-provider";
import { SupabaseProvider } from "./supabase-provider";
import type { DataProvider, DataProviderName, DataProviderStatus } from "./types";

function resolveProviderName(): DataProviderName {
  const value = (process.env.ADEZO_DATA_PROVIDER || "mock").toLowerCase();
  if (value === "csv" || value === "google-sheets" || value === "supabase" || value === "firebase") {
    return value;
  }
  return "mock";
}

function createProvider(name: DataProviderName): DataProvider {
  if (name === "csv") return new CsvProvider();
  if (name === "google-sheets") return new GoogleSheetsProvider();
  if (name === "supabase") return new SupabaseProvider();
  if (name === "firebase") return new FirebaseProvider();
  return new MockProvider();
}

let providerInstance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!providerInstance) {
    providerInstance = createProvider(resolveProviderName());
  }
  return providerInstance;
}

export async function getProviderStore() {
  return getDataProvider().getStore();
}

export async function getProviderStatus(): Promise<DataProviderStatus> {
  return getDataProvider().getStatus();
}

export type { DataProvider, DataProviderName, DataProviderStatus } from "./types";
