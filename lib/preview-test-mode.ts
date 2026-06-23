const TEST_ROUTES = [
  "/integrations-health",
  "/conversion-audit",
  "/landing-tirana-performance",
] as const;

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isPreviewOrDevEnvironment(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production";
}

export function isPreviewTestModeEnabled(): boolean {
  return process.env.ADEZO_PREVIEW_TEST_MODE === "true" && isPreviewOrDevEnvironment();
}

export function isPreviewTestRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return TEST_ROUTES.includes(normalized as (typeof TEST_ROUTES)[number]);
}

export function getPreviewDataModeLabel(): "MOCK/FALLBACK" | "LIVE" {
  return (process.env.ADEZO_USE_REAL_APIS || "false").toLowerCase() === "true"
    ? "LIVE"
    : "MOCK/FALLBACK";
}
