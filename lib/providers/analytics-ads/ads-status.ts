import type { AnalyticsAdsProviderStatus } from "./types";

export type AdsConnectionState = "connected" | "fallback" | "error" | "disabled";

export function createAdsStatus(params: {
  state: AdsConnectionState;
  configured: boolean;
  message: string;
  errors?: string[];
}): AnalyticsAdsProviderStatus {
  const { state, configured, message, errors = [] } = params;

  return {
    provider: "google-ads",
    configured,
    syncState:
      state === "connected"
        ? "ready"
        : state === "error"
          ? "error"
          : state === "disabled"
            ? "not-configured"
            : "stub",
    lastSyncAt: new Date().toISOString(),
    message,
    errors,
  };
}
