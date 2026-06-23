# BUILD 032 - REVENUE TRUTH LAYER

## Cel
Jedna warstwa prawdy dla ADEZO OS 2.0:

kampania -> lead -> oferta -> sprzedaż -> przychód.

BUILD 032 rozszerza BUILD 031B i scala 3 strumienie danych:
- GA4: lead_count, source, medium, campaign
- Google Ads: koszt kampanii
- Excel CRM: leady, oferty, statusy sprzedaży, wartość sprzedaży

## Nowe pliki
- `lib/revenue-truth-layer.ts`
- `lib/source-to-sale-attribution.ts`
- `lib/campaign-to-crm-matcher.ts`
- `components/data/revenue-truth-panel.tsx`
- `BUILD_032_REVENUE_TRUTH_LAYER.md`

## Logika łączenia danych
1. CRM jest źródłem faktów o lejku i sprzedaży:
- leady
- oferty
- sprzedaże (`offer.status = won`)
- przychód (`sum(value)`)

2. GA4 dostarcza lead_count i kontekst źródła:
- source / medium / campaign
- lead_count wyliczany zgodnie z BUILD 031A:
  - `lead_count` jeśli jest
  - w przeciwnym razie suma `lead_form + lead_tel + lead_email + lead_messenger`

3. Google Ads dostarcza koszty kampanii:
- koszt mapowany do kampanii przez dopasowanie nazwy (token overlap)

4. Match kampanii:
- helper `campaign-to-crm-matcher.ts` dopasowuje CRM campaign name do GA4/Ads
- budowany jest klucz atrybucji:
  - `source|medium|campaign`

5. Brak atrybucji:
- jeśli lead CRM nie ma kampanii/source możliwego do dopasowania,
  jest oznaczony jako `UNATTRIBUTED`

## KPI wyliczane w warstwie prawdy
- leady
- oferty
- sprzedaże
- przychód
- koszt
- koszt leada (CPL)
- koszt sprzedaży (CPS)
- ROAS
- gap do planu

## UI panel
`RevenueTruthPanel` pokazuje:
- TOP źródła przychodu
- kampanie bez sprzedaży
- leady bez atrybucji
- sprzedaż z kanałów:
  - Google Ads
  - Meta
  - Organic
  - Direct
  - Referral
  - UNATTRIBUTED

## Moduły zasilane przez BUILD 032
- Executive Daily Brief
- AI Revenue Manager
- Campaign ROI
- Landing Tirana Performance
- Conversion Audit

W praktyce każdy z tych ekranów renderuje panel Revenue Truth Layer, a kluczowe snapshoty (BUILD 015/019/020) korzystają z metryk warstwy prawdy przy decyzjach.

## Efekt biznesowy
BUILD 032 skraca drogę od pytania "czy reklama sprzedaje" do decyzji:
- widzimy koszt kampanii i realny przychód sprzedaży z CRM
- wiemy, które kanały i kampanie zamykają sprzedaż, a które tylko generują leady
- widać luki atrybucji (`UNATTRIBUTED`) do poprawy jakości danych
