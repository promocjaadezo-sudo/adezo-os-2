# BUILD 025 — Analytics & Ads Connector

## Cel
Przygotowanie warstwy integracyjnej ADEZO OS pod:
- Google Analytics 4
- Google Ads

Bez pobierania realnych danych na tym etapie.

## Co zostało przygotowane

### 1) Analytics Provider
- `Ga4AnalyticsProvider` (`lib/providers/analytics-ads/analytics-provider.ts`)
- API:
  - `getSessions(range)`
  - `getConversions(range)`
  - `getStatus()`
- Działa w trybie stub (zwraca puste dane + status konfiguracji).

### 2) Ads Provider
- `GoogleAdsProvider` (`lib/providers/analytics-ads/ads-provider.ts`)
- API:
  - `getCampaigns(range)`
  - `getConversions(range)`
  - `getStatus()`
- Działa w trybie stub (zwraca puste dane + status konfiguracji).

### 3) Campaign Sync Engine
- `CampaignSyncEngine` (`lib/providers/analytics-ads/engines/campaign-sync-engine.ts`)
- Zbiera dane kampanii i wylicza sumy (`cost`, `clicks`, `impressions`).

### 4) Conversion Sync Engine
- `ConversionSyncEngine` (`lib/providers/analytics-ads/engines/conversion-sync-engine.ts`)
- Scala konwersje z GA4 i Ads oraz deduplikuje rekordy.

### 5) Attribution Engine
- `AttributionEngine` (`lib/providers/analytics-ads/engines/attribution-engine.ts`)
- Obsługiwane modele:
  - `last-click`
  - `first-click`
  - `linear`

### Adaptery i interfejsy
- Typy i kontrakty: `lib/providers/analytics-ads/types.ts`
- Konfiguracja env: `lib/providers/analytics-ads/config.ts`
- Adaptery stub: `lib/providers/analytics-ads/adapters.ts`
- Punkt wejścia: `lib/providers/analytics-ads/index.ts`

## Zmienne środowiskowe (przygotowane)
- `ADEZO_GA4_PROPERTY_ID`
- `ADEZO_GA4_SERVICE_ACCOUNT_EMAIL`
- `ADEZO_GOOGLE_ADS_CUSTOMER_ID`
- `ADEZO_GOOGLE_ADS_DEVELOPER_TOKEN`

## Plan integracji (następny krok)
1. Dodać realny klient GA4 Data API i mapowanie do `AnalyticsSession`/`ConversionSyncRecord`.
2. Dodać realny klient Google Ads API i mapowanie do `CampaignSyncRecord`/`ConversionSyncRecord`.
3. Podpiąć scheduler synchronizacji (np. co 1h) i cache wyników.
4. Dodać monitor statusu synchronizacji w UI (ostatni sync, błędy, zakres).
5. Dodać testy kontraktów adapterów i testy silników (sync/attribution).
