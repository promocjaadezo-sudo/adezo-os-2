import type { AnalyticsAdsProviderStatus } from "./types";

export type Ga4ConnectionState = "connected" | "fallback" | "error";

export function createGa4Status(params: {
  state: Ga4ConnectionState;
  configured: boolean;
  message: string;
  errors?: string[];
}): AnalyticsAdsProviderStatus {
  const { state, configured, message, errors = [] } = params;

  return {
    provider: "ga4",
    configured,
    syncState: state === "connected" ? "ready" : state === "fallback" ? "stub" : "error",
    lastSyncAt: new Date().toISOString(),
    message,
    errors,
  };
}
