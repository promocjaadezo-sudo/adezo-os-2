import type { AnalyticsAdsConnectorConfig } from "./config";
import { createOAuthProviderStatus, type OAuthProviderStatus } from "./oauth-provider-status";

export interface OAuthConnectorStrategy {
  requestedMode: "mock" | "service_account" | "oauth_user";
  currentMode: "mock" | "service_account" | "oauth_user";
  fallbackReason: string;
  ga4: {
    useLiveConnector: boolean;
    status: OAuthProviderStatus;
  };
  googleAds: {
    useLiveConnector: boolean;
    status: OAuthProviderStatus;
  };
}

export function resolveOAuthConnectorStrategy(config: AnalyticsAdsConnectorConfig): OAuthConnectorStrategy {
  const hasGa4ServiceCredentials = Boolean(
    config.ga4PropertyId && (config.ga4CredentialsPath || (config.ga4ClientEmail && config.ga4PrivateKey)),
  );

  const hasGoogleAdsOauthCredentials = Boolean(
    config.googleAdsCustomerId &&
      config.googleAdsDeveloperToken &&
      config.googleAdsClientId &&
      config.googleAdsClientSecret &&
      config.googleAdsRefreshToken,
  );

  let currentMode = config.credentialsMode;
  let fallbackReason = "-";

  if (config.credentialsMode === "oauth_user" && !config.googleOAuthConnected) {
    currentMode = "mock";
    fallbackReason = "Brak aktywnego Google OAuth User — fallback do mock.";
  }

  if (config.credentialsMode === "service_account" && !hasGa4ServiceCredentials) {
    currentMode = "mock";
    fallbackReason = "Brak credentials service account GA4 — fallback do mock.";
  }

  if (currentMode === "mock") {
    return {
      requestedMode: config.credentialsMode,
      currentMode,
      fallbackReason,
      ga4: {
        useLiveConnector: false,
        status: createOAuthProviderStatus({
          provider: "ga4",
          authStatus: "disabled",
          reason: "Tryb mock aktywny.",
        }),
      },
      googleAds: {
        useLiveConnector: false,
        status: createOAuthProviderStatus({
          provider: "google-ads",
          authStatus: "disabled",
          reason: "Tryb mock aktywny.",
        }),
      },
    };
  }

  if (currentMode === "service_account") {
    return {
      requestedMode: config.credentialsMode,
      currentMode,
      fallbackReason,
      ga4: {
        useLiveConnector: config.useRealApis && config.ga4LiveEnabled && hasGa4ServiceCredentials,
        status: createOAuthProviderStatus({
          provider: "ga4",
          authStatus: hasGa4ServiceCredentials ? "connected" : "not-configured",
          reason: hasGa4ServiceCredentials
            ? "Service account GA4 gotowy."
            : "Brak GA4 service account credentials.",
        }),
      },
      googleAds: {
        useLiveConnector: false,
        status: createOAuthProviderStatus({
          provider: "google-ads",
          authStatus: "disabled",
          reason: "Service account dla Google Ads pozostaje opcją docelową (niewłączoną).",
        }),
      },
    };
  }

  return {
    requestedMode: config.credentialsMode,
    currentMode,
    fallbackReason,
    ga4: {
      useLiveConnector: false,
      status: createOAuthProviderStatus({
        provider: "ga4",
        authStatus: config.googleOAuthConnected ? "fallback" : "not-configured",
        reason: config.googleOAuthConnected
          ? "OAuth user aktywny; GA4 live przez OAuth user będzie etapem kolejnym, fallback mock."
          : "Brak aktywnego OAuth user dla GA4.",
      }),
    },
    googleAds: {
      useLiveConnector:
        config.useRealApis && config.googleAdsLiveEnabled && config.googleOAuthConnected && hasGoogleAdsOauthCredentials,
      status: createOAuthProviderStatus({
        provider: "google-ads",
        authStatus:
          config.googleOAuthConnected && hasGoogleAdsOauthCredentials
            ? "connected"
            : config.googleOAuthConnected
              ? "fallback"
              : "not-configured",
        reason:
          config.googleOAuthConnected && hasGoogleAdsOauthCredentials
            ? `OAuth user aktywny (${config.googleOAuthOwnerEmail || "owner"}); Google Ads live gotowy.`
            : config.googleOAuthConnected
              ? "OAuth user aktywny, ale brakuje pełnych credentials Google Ads API."
              : "Brak aktywnego OAuth user dla Google Ads.",
      }),
    },
  };
}
