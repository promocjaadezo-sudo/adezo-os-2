# ADEZO OS 2.0 — BUILD 030

## OAuth Connector Strategy

BUILD 030 dodaje alternatywną strategię łączenia Google Analytics 4 i Google Ads przez `OAuth / Google Login`, bez wymogu użycia konta serwisowego na tym etapie.

## Tryby połączenia

- `mock`
- `service_account`
- `oauth_user`

Wybór trybu realizuje `Credentials Mode Switch`:

- `ADEZO_GOOGLE_AUTH_MODE=mock|service_account|oauth_user`

## Logika działania

1. Gdy aktywny jest `oauth_user` i użytkownik Google jest połączony (`ADEZO_GOOGLE_OAUTH_CONNECTED=true`), system korzysta z kontekstu właściciela (`ADEZO_GOOGLE_OAUTH_OWNER_EMAIL`).
2. Gdy `oauth_user` nie jest dostępny, strategia automatycznie przechodzi na `mock`.
3. `service_account` zostaje jako opcja docelowa na później (zgodna z istniejącą architekturą connectorów).
4. GA4 Live Connector i Google Ads Live Connector pozostają w kodzie i mogą być aktywowane zgodnie z trybem oraz konfiguracją.

## Integrations Health — nowe pola

W panelu `Integrations Health` są widoczne:

- `current auth mode`
- `GA4 auth status`
- `Google Ads auth status`
- `fallback reason`

## Google Auth Config

Nowe zmienne dla warstwy auth:

- `ADEZO_GOOGLE_AUTH_MODE`
- `ADEZO_GOOGLE_OAUTH_CONNECTED`
- `ADEZO_GOOGLE_OAUTH_OWNER_EMAIL`

## OAuth Provider Status

Strategia zwraca status auth dla providerów (`ga4`, `google-ads`):

- `connected`
- `fallback`
- `not-configured`
- `disabled`

## Zakres zmian BUILD 030

Nowe pliki:

- `lib/providers/analytics-ads/credentials-mode-switch.ts`
- `lib/providers/analytics-ads/google-auth-config.ts`
- `lib/providers/analytics-ads/oauth-provider-status.ts`
- `lib/providers/analytics-ads/oauth-connector-strategy.ts`
- `OAUTH_CONNECTOR_STRATEGY.md`

Zmodyfikowane pliki:

- `lib/providers/analytics-ads/config.ts`
- `lib/providers/analytics-ads/index.ts`
- `lib/integrations-health.ts`
- `components/integrations/integration-health-dashboard.tsx`
- `app/(dashboard)/integrations-health/page.tsx`
