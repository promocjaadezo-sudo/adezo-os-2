# ADEZO OS 2.0 BUILD 002

## Uruchomienie aplikacji (Next.js)

1. Skopiuj plik z przykładowymi zmiennymi:

```powershell
Copy-Item .env.local.example .env.local
```

2. Uzupełnij w `.env.local` wartości z Supabase (`Project Settings -> API`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Uruchom aplikację lokalnie:

```powershell
npm install
npm run dev -- -p 3002
```

## Co zawiera paczka

1. `01_schema.sql` — pełny schemat Supabase/PostgreSQL
2. `02_rls_policies.sql` — logowanie i RLS: CEO widzi wszystko, handlowiec tylko swoje rekordy
3. `03_seed_dictionaries.sql` — modele ADEZO i handlowcy startowi
4. `04_views_kpi.sql` — widoki KPI pod CEO Score, Money Leak, Performance i Follow-upy
5. `05_import_mapping.md` — mapa migracji Google Sheets → Supabase
6. `06_frontend_supabase_bridge.js` — przykład podpięcia frontendu V30 do Supabase

## Kolejność wdrożenia w Supabase

1. Utwórz projekt Supabase.
2. Wejdź w SQL Editor.
3. Uruchom kolejno:
   - `01_schema.sql`
   - `02_rls_policies.sql`
   - `03_seed_dictionaries.sql`
   - `04_views_kpi.sql`
4. W Authentication dodaj użytkowników:
   - CEO
   - Magda K
   - Magda B
5. W tabeli `profiles` ustaw role:
   - CEO: `ceo`
   - Magdy: `sales`
6. W tabeli `salespeople` połącz `profile_id` Magdy z jej kontem auth.

## Zasada bezpieczeństwa

- CEO ma pełny dostęp.
- Magda widzi tylko rekordy, gdzie `salesperson_id` wskazuje na jej konto.
- Publiczne CSV z Google Sheets przestają być produkcyjnym źródłem danych.

## Następny build

ADEZO OS 2.0 BUILD 003:

- import script CSV → Supabase
- formularz testowy logowania
- pierwszy frontend `index-os2-build003.html`
