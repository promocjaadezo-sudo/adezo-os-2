# BUILD 033 - AUTOMATED REVENUE BRIEF ENGINE

## Cel
BUILD 033 automatyzuje codzienne briefy operacyjne na bazie Revenue Truth Layer (BUILD 032).

Silnik generuje briefy dla:
- CEO
- Magda 1
- Magda 2
- Marketing

Bez wysyłki mail/SMS na tym etapie (tylko preview panel w aplikacji).

## Nowe pliki
- `lib/automated-revenue-brief-engine.ts`
- `lib/brief-recipient-router.ts`
- `lib/brief-priority-rules.ts`
- `lib/brief-action-generator.ts`
- `components/data/automated-brief-preview-panel.tsx`
- `BUILD_033_AUTOMATED_REVENUE_BRIEF_ENGINE.md`

## Routing i menu
- Nowa trasa: `/automated-revenue-brief`
- Nowa pozycja menu: `Automated Brief`

## Architektura
1. `brief-priority-rules.ts`
- Egzekwuje reguły biznesowe z BUILD 033:
  - forecast < plan -> plan recovery actions
  - kampania koszt bez sprzedaży -> marketing alert
  - HOT lead bez kontaktu -> task dla Magdy
  - oferta bez follow-up > 3 dni -> task dla Magdy
  - lead/opportunity > 30 000 zł -> CEO visibility
  - CRM incomplete -> data discipline alert
  - Tirana leady bez sprzedaży -> review offer/follow-up

2. `brief-action-generator.ts`
- Zamienia findings na konkretne zadania:
  - właściciel
  - deadline
  - oczekiwany efekt
  - źródła danych (GA4 / Google Ads / Excel CRM / Revenue Truth Layer)

3. `brief-recipient-router.ts`
- Rozdziela zadania i podsumowania na 4 briefy odbiorców.

4. `automated-revenue-brief-engine.ts`
- Orkiestruje Revenue Truth Layer + status providera + store CRM
- Generuje finalny snapshot briefów dziennych.

## Struktura briefu per odbiorca
Każdy brief zawiera:
- status planu
- największe ryzyko
- największą szansę
- zadania na dziś
- właściciela zadania
- deadline
- oczekiwany efekt
- źródło danych

## UI
`AutomatedBriefPreviewPanel`:
- premium dark ADEZO
- złote akcenty
- mobile responsive
- preview mode badge
- sekcje:
  - KPI plan/revenue/ROAS/gap
  - briefy per odbiorca
  - zadania z priorytetami i źródłami danych

## Efekt operacyjny
BUILD 033 skraca poranny start zespołu:
- każdy właściciel dostaje gotową listę działań na dziś
- priorytety wynikają bezpośrednio z danych Revenue Truth Layer
- mniejsza strata czasu na ręczne składanie briefu
- większa szansa codziennego domykania luki do planu
