# BUILD 028 — CONVERSION AUDIT ENGINE

## Cel
Silnik audytu konwersji sprawdza, czy GA4, Google Ads i landing Tirana poprawnie mierzą leady oraz wykrywa anomalie w lejku.

## Dodane pliki
- `lib/providers/analytics-ads/engines/conversion-audit-engine.ts`
- `components/conversion-audit/conversion-health-panel.tsx`
- `components/conversion-audit/conversion-drop-alerts.tsx`
- `components/conversion-audit/lead-event-monitor.tsx`
- `components/conversion-audit/landing-tirana-tracker.tsx`
- `app/(dashboard)/conversion-audit/page.tsx`

## Audytowane eventy
- `generate_lead`
- `premium_form_submit`
- `form_submit`
- `phone_call_lead`
- `consultation_request`
- `formularz_start`
- `file_download`
- `click`

## Reguły audytu
- Brak `generate_lead` przez 24h -> `WARNING`
- Jest `formularz_start`, ale brak `form_submit` -> `FUNNEL LEAK`
- Kampania wydaje koszt, ale brak leadów -> `ADS WASTE ALERT`
- `premium_form_submit` spada >40% vs poprzednie 7 dni -> `DROP ALERT`
- `phone_call_lead = 0` przez 7 dni -> `PHONE TRACKING WARNING`
- Landing Tirana ma ruch, ale brak leadów -> `LANDING PROBLEM`

## Trasa
- `/conversion-audit`

## UI
- premium dark ADEZO
- złote akcenty
- mobile responsive (układ kart + tabela z poziomym scroll na małych ekranach)

## Zasilanie danych
- Dane pobierane z providerów GA4 / Google Ads
- Przy fallbackach providerów audyt działa na mock data
- Bez ingerencji w działanie istniejących connectorów GA4 i Google Ads
