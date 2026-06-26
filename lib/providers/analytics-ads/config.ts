import { resolveGoogleAuthConfig } from "./google-auth-config";
import type { CredentialsMode } from "./credentials-mode-switch";

export function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n").trim();
}

export interface AnalyticsAdsConnectorConfig {
  useRealApis: boolean;
  credentialsMode: CredentialsMode;
  ga4LiveEnabled: boolean;
  googleAdsLiveEnabled: boolean;
  googleOAuthConnected: boolean;
  googleOAuthOwnerEmail: string;
  ga4PropertyId: string;
  ga4ServiceAccountEmail: string;
  ga4CredentialsPath: string;
  ga4ClientEmail: string;
  ga4PrivateKey: string;
  googleAdsCustomerId: string;
  googleAdsDeveloperToken: string;
  googleAdsClientId: string;
  googleAdsClientSecret: string;
  googleAdsRefreshToken: string;
}

export function resolveAnalyticsAdsConnectorConfig(): AnalyticsAdsConnectorConfig {
  const ga4PropertyId = (process.env.ADEZO_GA4_PROPERTY_ID || "444299463").trim();
  const ga4ServiceAccountEmail = (process.env.ADEZO_GA4_SERVICE_ACCOUNT_EMAIL || "").trim();
  const auth = resolveGoogleAuthConfig();

  return {
    useRealApis: (process.env.ADEZO_USE_REAL_APIS || "false").toLowerCase() === "true",
    credentialsMode: auth.requestedMode,
    ga4LiveEnabled: (process.env.ADEZO_GA4_LIVE_ENABLED || "true").toLowerCase() === "true",
    googleAdsLiveEnabled: (process.env.ADEZO_GOOGLE_ADS_LIVE_ENABLED || "false").toLowerCase() === "true",
    googleOAuthConnected: auth.oauthConnected,
    googleOAuthOwnerEmail: auth.ownerEmail,
    ga4PropertyId,
    ga4ServiceAccountEmail,
    ga4CredentialsPath: (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim(),
    ga4ClientEmail: (process.env.GOOGLE_CLIENT_EMAIL || ga4ServiceAccountEmail).trim(),
    ga4PrivateKey: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY || ""),
    googleAdsCustomerId: (process.env.GOOGLE_ADS_CUSTOMER_ID || process.env.ADEZO_GOOGLE_ADS_CUSTOMER_ID || "").trim(),
    googleAdsDeveloperToken: (process.env.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.ADEZO_GOOGLE_ADS_DEVELOPER_TOKEN || "").trim(),
    googleAdsClientId: (process.env.GOOGLE_ADS_CLIENT_ID || "").trim(),
    googleAdsClientSecret: (process.env.GOOGLE_ADS_CLIENT_SECRET || "").trim(),
    googleAdsRefreshToken: (process.env.GOOGLE_ADS_REFRESH_TOKEN || "").trim(),
  };
}
