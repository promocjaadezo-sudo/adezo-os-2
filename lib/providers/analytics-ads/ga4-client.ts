import { createHash, createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolveAnalyticsAdsConnectorConfig } from "./config";
import type { DateRange, DateRangePreset } from "./types";

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface Ga4ClientOptions {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
}

function base64url(input: string): string {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function resolveCredentials(): ServiceAccountCredentials | null {
  const config = resolveAnalyticsAdsConnectorConfig();

  if (config.ga4CredentialsPath) {
    try {
      const raw = readFileSync(config.ga4CredentialsPath, "utf-8");
      const parsed = JSON.parse(raw) as ServiceAccountCredentials;
      if (parsed.client_email && parsed.private_key) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  if (config.ga4ClientEmail && config.ga4PrivateKey) {
    return {
      client_email: config.ga4ClientEmail,
      private_key: config.ga4PrivateKey,
      token_uri: "https://oauth2.googleapis.com/token",
    };
  }

  return null;
}

function createJwt(clientEmail: string, privateKey: string, tokenUri: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${signingInput}.${signature}`;
}

async function getAccessToken(options: Ga4ClientOptions): Promise<string> {
  const assertion = createJwt(options.clientEmail, options.privateKey, options.tokenUri);
  const response = await fetch(options.tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`GA4 token error HTTP ${response.status}`);
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("GA4 token response missing access_token");
  }

  return json.access_token;
}

function resolveDateRange(range: DateRange | DateRangePreset): DateRange {
  if (typeof range !== "string") {
    return range;
  }

  const today = new Date();
  const iso = (date: Date) => date.toISOString().slice(0, 10);

  if (range === "today") {
    return { from: iso(today), to: iso(today) };
  }

  if (range === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { from: iso(y), to: iso(y) };
  }

  if (range === "last7days") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: iso(from), to: iso(today) };
  }

  const from = new Date(today);
  from.setDate(from.getDate() - 29);
  return { from: iso(from), to: iso(today) };
}

export class Ga4Client {
  private readonly options: Ga4ClientOptions;

  constructor(propertyId: string) {
    const credentials = resolveCredentials();
    if (!credentials) {
      throw new Error("GA4 credentials are missing");
    }

    this.options = {
      propertyId,
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key,
      tokenUri: credentials.token_uri || "https://oauth2.googleapis.com/token",
    };
  }

  static fingerprint(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 12);
  }

  async runReport(params: {
    range: DateRange | DateRangePreset;
    dimensions: string[];
    metrics: string[];
  }): Promise<unknown> {
    const accessToken = await getAccessToken(this.options);
    const dateRange = resolveDateRange(params.range);

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${this.options.propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: dateRange.from, endDate: dateRange.to }],
          dimensions: params.dimensions.map((name) => ({ name })),
          metrics: params.metrics.map((name) => ({ name })),
          keepEmptyRows: false,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GA4 runReport error HTTP ${response.status}: ${body.slice(0, 400)}`);
    }

    return response.json();
  }
}
