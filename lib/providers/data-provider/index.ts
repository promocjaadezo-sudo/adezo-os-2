import { CsvProvider } from "./csv-provider";
import { ExcelCrmProvider } from "./excel-crm-provider";
import { FirebaseProvider } from "./firebase-provider";
import { GoogleSheetsProvider } from "./google-sheets-provider";
import { MockProvider } from "./mock-provider";
import { SupabaseProvider } from "./supabase-provider";
import type { DataProvider, DataProviderName, DataProviderStatus } from "./types";
import { resolvePriorityProviderName } from "@/lib/data-source-priority-engine";

function resolveProviderName(): DataProviderName {
  return resolvePriorityProviderName(process.env.ADEZO_DATA_PROVIDER);
}

function createProvider(name: DataProviderName): DataProvider {
  if (name === "csv") return new CsvProvider();
  if (name === "excel-crm") return new ExcelCrmProvider();
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
