# BUILD 031B - EXCEL CRM CONNECTOR

## Scope
BUILD 031B extends BUILD 031A (GA4 Lead Metrics Adapter) with an Excel CRM connector for ADEZO OS 2.0.

## Excel Source
Default workbook selection:
- newest `crm/*.xlsx` (excluding lock files `~$*`)
- preferred filename if available: `BUILD034K_CRM_CLEANUP_FINAL_NEW`

Primary sheet:
- `CRM_MAGDY` (fallback to the first worksheet if missing)

Header detection:
- auto-detected row containing both `NR OFERTY` and `STATUS`

## New Provider Layer
Added files:
- `lib/providers/data-provider/excel-crm-provider.ts`
- `lib/providers/data-provider/excel-crm-mapper.ts`
- `lib/providers/data-provider/excel-crm-validator.ts`

Provider key:
- `ADEZO_DATA_PROVIDER=excel-crm`

Optional workbook override:
- `ADEZO_EXCEL_CRM_FILE=<absolute_or_relative_path_to_xlsx>`

## Column Mapping (Excel -> Operating Data Model)
### Lead
- `KLIENT` -> `Lead.clientName`
- `TELEFON` -> `Lead.phone`
- `EMAIL` -> `Lead.email`
- `STATUS` -> `Lead.status` (normalized)
- `DATA KOLEJNEGO KONTAKTU` -> `Lead.createdAt` / `Lead.lastContactAt`
- `OBSLUGA` -> `Lead.owner` (`Magda 1` / `Magda 2`)
- `KWOTA` -> `Lead.budget`
- `ZRODLO`/`SOURCE` -> `Lead.source`
- `KAMPANIA` + `MEDIUM` -> linked `campaignId`

### Offer
- `NR OFERTY` -> `Offer.id`
- row lead mapping -> `Offer.leadId`
- `OBSLUGA` -> `Offer.owner`
- `KWOTA` -> `Offer.value`
- `STATUS` + `WYNIK SPRZEDAZY` -> `Offer.status`
- `DATA OFERTY` -> `Offer.createdAt` / `Offer.sentAt`
- `SZANSA` -> `Offer.winProbability`

### Sale
- represented as `Offer.status = won`
- `WYNIK SPRZEDAZY` is used as decision signal

### Task
- open offers auto-generate follow-up task rows in `MagdaTask`
- due date from `DATA KOLEJNEGO KONTAKTU`

### Forecast
- `PLAN MIESIECZNY` -> `Forecast.revenuePlan`
- fallback plan derived from forecast/sales if missing

## Validation Rules
`excel-crm-validator` checks missing required fields:
- status
- opiekun/Magda
- wartość
- data kontaktu
- data oferty
- wynik sprzedaży

The provider reports:
- `incompleteRows`
- `incompleteFields`
- warnings list in provider status

## GA4 Link (BUILD 031A integration)
Provider enriches CRM with GA4 context:
- source
- medium
- campaign
- `lead_count` (7d)

`lead_count` is derived per 031A rules:
- use GA4 `lead_count` if present
- else sum `lead_form + lead_tel + lead_email + lead_messenger`

## Dashboard Impact
Executive Daily Brief now exposes CRM-driven KPI panel:
- leads
- offers
- sales
- sales value
- forecast
- GA4 lead_count 7d

AI Revenue Manager now reports:
- lead -> offer conversion
- offer -> sale conversion
- pipeline value
- gap to plan

## Notes
- No live GA4/Ads secrets are required by this connector itself.
- The connector is compatible with preview test mode and existing provider fallback behavior.
