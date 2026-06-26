# GA4 Live Connector — BUILD 026

## Cel
Podłączyć pierwszy realny endpoint Google Analytics 4 Data API do ADEZO OS z bezpiecznym fallbackiem do danych mock.

## Konfiguracja ENV
Wymagane / wspierane zmienne:

- `ADEZO_GA4_LIVE_ENABLED=true`
- `ADEZO_GA4_PROPERTY_ID=444299463`
- `ADEZO_USE_REAL_APIS=true`

Credentials (jedna z opcji):

### Opcja A — plik service account
- `GOOGLE_APPLICATION_CREDENTIALS=/absolutna/sciezka/service-account.json`

### Opcja B — bez pliku
- `GOOGLE_CLIENT_EMAIL=<service-account-email>`
- `GOOGLE_PRIVATE_KEY=<private-key-z-escaped-\n>`

## Jak działa fallback
Provider GA4 Live przełącza się na mock, gdy:
- brak credentials,
- brak property id,
- błąd odpowiedzi z GA4 Data API.

Status zwracany dla UI / logiki:
- `connected` — dane z live API,
- `fallback` — dane mock po błędzie/konfiguracji,
- `error` — krytyczny błąd statusu.

## Co pobieramy z GA4
### Sessions report
- date
- source
- medium
- campaign
- landingPage
- sessions
- users

### Events report (mapowane do ConversionSyncRecord)
- eventName
- eventCount
- date
- source
- medium
- campaign

## Eventy leadowe (muszą być oznaczone jako konwersje)
- `generate_lead`
- `form_submit`
- `premium_form_submit`
- `phone_call_lead`
- `formularz_start`
- `file_download`
- `click`

## Zakresy dat
Obsługiwane preset ranges:
- `today`
- `yesterday`
- `last7days`
- `last30days`

## Jak sprawdzić, czy GA4 działa
1. Ustaw ENV i uruchom aplikację.
2. Odczytaj `getStatus()` z GA4 provider.
3. Oczekiwany status live: `connected`.
4. Jeśli status to `fallback`, sprawdź listę `errors`.

## Uwaga
BUILD 026 nie dodaje jeszcze Google Ads API live (to planowane na BUILD 027).
