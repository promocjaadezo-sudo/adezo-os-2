import { createSign } from "node:crypto";
import { normalizePrivateKey } from "@/lib/providers/analytics-ads/config";

export type Ga4LiveStatus = "ok" | "disabled" | "missing_env" | "error";

export interface Ga4LiveEventMetric {
  eventCount: number;
  conversions: number;
}

export interface Ga4LiveMetrics {
  realtimeActiveUsers: number;
  sessions7d: number;
  activeUsers7d: number;
  conversions7d: number;
  events7d: Record<"generate_lead" | "premium_form_submit" | "phone_call_lead", Ga4LiveEventMetric>;
}

export interface Ga4LiveResult {
  propertyId: string;
  status: Ga4LiveStatus;
  message: string;
  metrics: Ga4LiveMetrics;
}

const TRACKED_EVENTS = ["generate_lead", "premium_form_submit", "phone_call_lead"] as const;

const EMPTY_METRICS: Ga4LiveMetrics = {
  realtimeActiveUsers: 0,
  sessions7d: 0,
  activeUsers7d: 0,
  conversions7d: 0,
  events7d: {
    generate_lead: { eventCount: 0, conversions: 0 },
    premium_form_submit: { eventCount: 0, conversions: 0 },
    phone_call_lead: { eventCount: 0, conversions: 0 },
  },
};

function base64url(input: string): string {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function toNumber(value: string | undefined): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createJwt(clientEmail: string, privateKey: string, tokenUri: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
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

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const tokenUri = "https://oauth2.googleapis.com/token";
  const assertion = createJwt(clientEmail, privateKey, tokenUri);

  const response = await fetch(tokenUri, {
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

async function ga4Request<T>(propertyId: string, accessToken: string, endpoint: "runReport" | "runRealtimeReport", body: unknown): Promise<T> {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GA4 ${endpoint} HTTP ${response.status}: ${details.slice(0, 240)}`);
  }

  return (await response.json()) as T;
}

interface Ga4MetricRow {
  metricValues?: Array<{ value?: string }>;
}

interface Ga4EventRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

export async function getGa4LiveMetrics(): Promise<Ga4LiveResult> {
  const propertyId = (process.env.ADEZO_GA4_PROPERTY_ID || "").trim();
  const ga4LiveEnabled = (process.env.ADEZO_GA4_LIVE_ENABLED || "false").toLowerCase() === "true";
  const useRealApis = (process.env.ADEZO_USE_REAL_APIS || "false").toLowerCase() === "true";
  const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || "").trim();
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY || "");

  if (!useRealApis || !ga4LiveEnabled) {
    return {
      propertyId,
      status: "disabled",
      message: "GA4 Live disabled (`ADEZO_USE_REAL_APIS=false` lub `ADEZO_GA4_LIVE_ENABLED=false`).",
      metrics: EMPTY_METRICS,
    };
  }

  if (!propertyId || !clientEmail || !privateKey) {
    return {
      propertyId,
      status: "missing_env",
      message: "Missing GA4 env. Required: ADEZO_GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY.",
      metrics: EMPTY_METRICS,
    };
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);

    const [realtime, totals7d, events7d] = await Promise.all([
      ga4Request<{ rows?: Ga4MetricRow[] }>(propertyId, accessToken, "runRealtimeReport", {
        metrics: [{ name: "activeUsers" }],
      }),
      ga4Request<{ rows?: Ga4MetricRow[] }>(propertyId, accessToken, "runReport", {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
      }),
      ga4Request<{ rows?: Ga4EventRow[] }>(propertyId, accessToken, "runReport", {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "conversions" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [...TRACKED_EVENTS],
            },
          },
        },
      }),
    ]);

    const realtimeActiveUsers = toNumber(realtime.rows?.[0]?.metricValues?.[0]?.value);
    const sessions7d = toNumber(totals7d.rows?.[0]?.metricValues?.[0]?.value);
    const activeUsers7d = toNumber(totals7d.rows?.[0]?.metricValues?.[1]?.value);
    const conversions7d = toNumber(totals7d.rows?.[0]?.metricValues?.[2]?.value);

    const events: Ga4LiveMetrics["events7d"] = {
      generate_lead: { eventCount: 0, conversions: 0 },
      premium_form_submit: { eventCount: 0, conversions: 0 },
      phone_call_lead: { eventCount: 0, conversions: 0 },
    };

    for (const row of events7d.rows || []) {
      const eventName = row.dimensionValues?.[0]?.value;
      if (!eventName || !(eventName in events)) {
        continue;
      }

      const key = eventName as keyof typeof events;
      events[key] = {
        eventCount: toNumber(row.metricValues?.[0]?.value),
        conversions: toNumber(row.metricValues?.[1]?.value),
      };
    }

    return {
      propertyId,
      status: "ok",
      message: "GA4 Live connected.",
      metrics: {
        realtimeActiveUsers,
        sessions7d,
        activeUsers7d,
        conversions7d,
        events7d: events,
      },
    };
  } catch (error) {
    return {
      propertyId,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown GA4 error",
      metrics: EMPTY_METRICS,
    };
  }
}