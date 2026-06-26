export type ProviderAuthStatus = "connected" | "fallback" | "not-configured" | "disabled";

export interface OAuthProviderStatus {
  provider: "ga4" | "google-ads";
  authStatus: ProviderAuthStatus;
  reason: string;
}

export function createOAuthProviderStatus(params: {
  provider: "ga4" | "google-ads";
  authStatus: ProviderAuthStatus;
  reason: string;
}): OAuthProviderStatus {
  return {
    provider: params.provider,
    authStatus: params.authStatus,
    reason: params.reason,
  };
}
