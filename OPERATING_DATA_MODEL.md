# OPERATING DATA MODEL (BUILD 021)

Centralny model danych ADEZO OS tworzy **jedną prawdę operacyjną** dla modułów:
- Daily Brief
- Marketing Command Center
- Lead Intelligence
- Magda Action Engine
- Data Discipline
- AI Revenue Manager
- Offer & Follow-up
- Lost Deal Analyzer
- Referral & Architect
- Campaign ROI
- Executive Daily Brief

## 1) Encje systemu

Model znajduje się w `lib/operating-model/` i zawiera encje:
- `LeadEntity`
- `OfferEntity`
- `CampaignEntity`
- `MagdaTaskEntity`
- `PartnerEntity`
- `ForecastEntity`
- agregat: `OperatingDataStore`

## 2) Pola obowiązkowe

### LeadEntity
Wymagane:
- `id`
- `clientName`
- `source`
- `budget`
- `createdAt`
- `status`

Opcjonalne (ale kluczowe operacyjnie):
- `phone`, `email`, `owner`, `campaignId`, `modelInterest`, `lastContactAt`

### OfferEntity
Wymagane:
- `id`
- `leadId`
- `owner`
- `model`
- `value`
- `status`
- `createdAt`
- `winProbability`

### CampaignEntity
Wymagane:
- `id`
- `name`
- `platform`
- `model`
- `monthlyBudget`
- `status`

### MagdaTaskEntity
Wymagane:
- `id`
- `owner`
- `title`
- `dueAt`
- `priority`
- `done`

### PartnerEntity
Wymagane:
- `id`
- `name`
- `kind`

### ForecastEntity
Wymagane:
- `monthKey`
- `revenuePlan`

## 3) Jak liczymy forecast

Implementacja: `calculateForecast(offers)` w `lib/operating-model/helpers.ts`

Wzór:
- `sold = suma(ofert status=won)`
- `weightedOpen = suma(ofert otwartych: value * winProbability)`
- `forecast = sold + weightedOpen` (zaokrąglone operacyjnie)

## 4) Jak liczymy lead score

Implementacja: `calculateLeadScore(lead)`

Na wynik wpływają:
- budżet
- źródło leada
- komplet danych kontaktowych
- etap procesu (`status`)

Skala: `0..100`

## 5) Jak liczymy data completeness

Implementacja: `calculateDataCompleteness(entity, requiredFields)`

Wynik:
- `completenessPct`
- `missingFields`

To podejście działa dla każdej encji i pozwala wdrożyć walidacje przed zapisem do bazy.

## 6) Jak powstaje next best action

Implementacja: `buildNextBestAction(...)`

Silnik decyduje na podstawie kontekstu:
- **lead**: score/temperature -> czas i typ kontaktu
- **offer**: aging/status -> follow-up, okno domknięcia
- **campaign**: ROAS/CPL/HOT Rate -> skaluj, obserwuj, zatrzymaj

## 7) Centralny mock data store

Plik: `lib/operating-model/mock-store.ts`

Store zawiera wszystkie encje w jednym miejscu i jest wzbogacany o pola pochodne (`score`, `temperature`) przy odczycie.

## 8) Jak model przygotowuje system pod realną bazę danych

1. **Spójne typy**: UI i logika używają tych samych kontraktów danych.
2. **Reużywalne obliczenia**: helpery działają niezależnie od źródła (mock/API/DB).
3. **Selektory domenowe**: `selectors.ts` oddziela kształt danych dla widoków od surowego store.
4. **Łatwa podmiana backendu**: zamiast `mock-store` można podłączyć warstwę repozytoriów (Supabase/SQL) bez przebudowy UI.
5. **Mniejsze ryzyko migracji**: znikają rozproszone mocki i niespójne definicje pól między modułami.
