# GOOGLE SHEETS CONNECTOR (BUILD 023)

## Cel
Podłączenie ADEZO OS 2.0 do Google Sheets jako pierwszego realnego źródła danych, z bezpiecznym fallbackiem do `mock`.

## Provider config
W `.env.local`:

- `ADEZO_DATA_PROVIDER=google-sheets` lub `mock`
- `ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID=<ID_ARKUSZA>`
- `ADEZO_GOOGLE_SHEETS_BASE_URL=https://docs.google.com/spreadsheets/d` (opcjonalnie)

Jeśli `ADEZO_DATA_PROVIDER=google-sheets`, ale brak `ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID`, system przełączy się na `mock`.

## Wymagane arkusze
W jednym Spreadsheet muszą istnieć zakładki:

- `leads`
- `offers`
- `campaigns`
- `tasks`
- `partners`
- `sales`

## Wymagane kolumny
### leads
- `id`
- `client_name`
- `source`
- `budget`
- `status`
- `created_at`

Dodatkowe obsługiwane: `phone`, `email`, `campaign_id`, `owner`, `model_interest`, `last_contact_at`.

### offers
- `id`
- `lead_id`
- `owner`
- `model`
- `value`
- `status`
- `created_at`
- `win_probability`

Dodatkowe: `campaign_id`, `sent_at`, `last_followup_at`, `decision_reason`.

### campaigns
- `id`
- `name`
- `platform`
- `model`
- `monthly_budget`
- `status`

### tasks
- `id`
- `owner`
- `title`
- `due_at`
- `priority`
- `done`

Dodatkowe: `linked_lead_id`, `linked_offer_id`.

### partners
- `id`
- `name`
- `kind`

Dodatkowe: `last_contact_at`, `owner`.

### sales
- `month_key`
- `revenue_plan`

## Mapping arkuszy -> Operating Data Model
- `leads` -> `LeadEntity[]`
- `offers` -> `OfferEntity[]`
- `campaigns` -> `CampaignEntity[]`
- `tasks` -> `MagdaTaskEntity[]`
- `partners` -> `PartnerEntity[]`
- `sales` -> `ForecastEntity[]`

Po mapowaniu leadów automatycznie wyliczane są `score` i `temperature` zgodnie z helperami operating model.

## DATA INCOMPLETE
Puste pola są mapowane z fallbackami i oznaczane jako `DATA INCOMPLETE`:

- brak tekstu -> podstawienie domyślne (np. `DATA INCOMPLETE`, `new`, `organic`)
- brak wartości liczbowej -> `0` lub domyślna wartość bezpieczna
- status providera zbiera:
  - `incompleteRows`
  - `incompleteFields`
  - listę błędów/ostrzeżeń

## Fallback do mock data
System przełącza się na `MockProvider`, gdy:

1. Brak konfiguracji Spreadsheet ID,
2. Brak wymaganych kolumn w którymkolwiek arkuszu,
3. Błąd pobierania (HTTP/network/share permissions).

W statusie providera:
- `provider` = `google-sheets` (żądany)
- `resolvedProvider` = `mock` (aktywny)
- `syncState` = `fallback-mock`

## Błędy widoczne dla CEO
W `Provider Status Panel` CEO widzi:

- aktywny provider (`resolvedProvider`)
- status synchronizacji (`syncState`)
- komunikat (`message`)
- liczbę rekordów
- licznik `DATA INCOMPLETE`
- listę błędów importu (`errors`), np.:
  - brak Spreadsheet ID,
  - brak kolumn w arkuszu,
  - błąd pobierania konkretnej zakładki.

## Jak podłączyć Spreadsheet ID
1. Otwórz Google Sheet.
2. Skopiuj ID z URL:
   - `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit#gid=...`
3. Wklej do `.env.local`:
   - `ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID=<SPREADSHEET_ID>`
4. Upewnij się, że arkusz jest udostępniony do odczytu.

## Minimalny przykład `.env.local`

```env
ADEZO_DATA_PROVIDER=google-sheets
ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
ADEZO_GOOGLE_SHEETS_BASE_URL=https://docs.google.com/spreadsheets/d
```
