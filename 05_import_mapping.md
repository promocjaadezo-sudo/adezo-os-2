# ADEZO OS 2.0 BUILD 002 — Import Mapping

## Kolejność importu

1. `models`
2. `salespeople`
3. `locations`
4. `leads`
5. `offers`
6. `lost`
7. `followups`
8. `marketing`
9. `business_relationships`

## Google Sheets → Supabase

### LEADY → leads

| Google Sheets | Supabase |
|---|---|
| Data | source_created_at |
| Klient | client_name |
| Telefon | phone |
| Email | email |
| Miasto | city |
| Kod pocztowy | postal_code |
| Model | model_name_raw + model_id lookup |
| Źródło | source |
| Handlowiec | salesperson_id lookup |
| Status | status |
| Budżet / Wartość | budget |
| Lead Score | lead_score |
| Temperatura | temperature |
| Notatki | notes |

### OFERTY → offers

| Google Sheets | Supabase |
|---|---|
| Data | offer_date |
| Klient | lead_id lookup + client_name_snapshot |
| Model | model_id lookup |
| Handlowiec | salesperson_id lookup |
| Wartość | value |
| Status | status |
| Szansa % | win_probability |
| Następny kontakt | next_contact_at |
| Notatki | notes |

### UTRACONE → lost

| Google Sheets | Supabase |
|---|---|
| Klient | lead_id / offer_id lookup |
| Handlowiec | salesperson_id lookup |
| Data utraty | lost_date |
| Powód utraty | reason |
| Wartość | lost_value |
| Czy wróci za 3 miesiące? | will_return |
| Prawdopodobieństwo powrotu | return_probability |

### MARKETING → marketing

| Google Sheets | Supabase |
|---|---|
| Data | date |
| Źródło | source |
| Kampania | campaign |
| Koszt | cost |
| Kliknięcia | clicks |
| Wyświetlenia | impressions |
| Leady | leads_count |

## Zasada po migracji

- Google Sheets = backup i import historyczny
- Supabase = źródło produkcyjne
- Frontend nie pobiera CSV
- Frontend pobiera JSON z Supabase
