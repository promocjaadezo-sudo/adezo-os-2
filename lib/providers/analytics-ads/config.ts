export interface AnalyticsAdsConnectorConfig {
  useRealApis: boolean;
  ga4LiveEnabled: boolean;
  ga4PropertyId: string;
  ga4ServiceAccountEmail: string;
  ga4CredentialsPath: string;
  ga4ClientEmail: string;
  ga4PrivateKey: string;
  googleAdsCustomerId: string;
  googleAdsDeveloperToken: string;
}

export function resolveAnalyticsAdsConnectorConfig(): AnalyticsAdsConnectorConfig {
  const ga4PropertyId = (process.env.ADEZO_GA4_PROPERTY_ID || "444299463").trim();
  const ga4ServiceAccountEmail = (process.env.ADEZO_GA4_SERVICE_ACCOUNT_EMAIL || "").trim();

  return {
    useRealApis: (process.env.ADEZO_USE_REAL_APIS || "false").toLowerCase() === "true",
    ga4LiveEnabled: (process.env.ADEZO_GA4_LIVE_ENABLED || "true").toLowerCase() === "true",
    ga4PropertyId,
    ga4ServiceAccountEmail,
    ga4CredentialsPath: (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim(),
    ga4ClientEmail: (process.env.GOOGLE_CLIENT_EMAIL || ga4ServiceAccountEmail).trim(),
    ga4PrivateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim(),
    googleAdsCustomerId: (process.env.ADEZO_GOOGLE_ADS_CUSTOMER_ID || "").trim(),
    googleAdsDeveloperToken: (process.env.ADEZO_GOOGLE_ADS_DEVELOPER_TOKEN || "").trim(),
  };
}
