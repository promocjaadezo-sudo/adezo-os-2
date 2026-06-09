# GOOGLE ADS LIVE CONNECTOR — BUILD 027

## Cel
Podłączyć Google Ads Live Connector tak, aby ADEZO OS pobierał realne dane kampanii i łączył je z konwersjami/lejkiem sprzedaży.

## Dodane elementy
- `lib/providers/analytics-ads/ads-live-provider.ts`
- `lib/providers/analytics-ads/ads-client.ts`
- `lib/providers/analytics-ads/ads-mapper.ts`
- `lib/providers/analytics-ads/ads-status.ts`

## Zakres danych pobieranych z Google Ads
- campaign id
- campaign name
- campaign status
- cost
- clicks
- impressions
- conversions
- conversion value
- CPC
- CTR
- cost per conversion

## Statusy konektora
- `CONNECTED`
- `FALLBACK`
- `ERROR`
- `DISABLED`

Mapowanie do statusu systemowego:
- `CONNECTED` -> `ready`
- `FALLBACK` -> `stub`
- `ERROR` -> `error`
- `DISABLED` -> `not-configured`

## Logika fallback
Connector przełącza się na mock, gdy:
1. brak credentials,
2. brak customer id,
3. Google Ads API zwróci błąd.

## Wymagane ENV (docelowe)
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `ADEZO_GOOGLE_ADS_LIVE_ENABLED=true`

Dodatkowo (globalnie):
- `ADEZO_USE_REAL_APIS=true`

## Uwagi integracyjne
- GA4 connector pozostaje bez zmian funkcjonalnych.
- Google Ads live aktywuje się przez factory `createAdsProvider()`.
- Przy błędach API system raportuje `errors[]` i przechodzi na fallback.
