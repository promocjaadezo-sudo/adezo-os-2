# BUILD 029 — LANDING TIRANA PERFORMANCE MONITOR

## Cel
Monitor skuteczności landingu Tirana dla ścieżki:
Google Ads / Meta Ads → Landing Tirana → Lead → Oferta → Sprzedaż.

## Dodane pliki
- `lib/landing-tirana-performance.ts`
- `components/tirana-performance/tirana-landing-health-panel.tsx`
- `components/tirana-performance/tirana-funnel-board.tsx`
- `components/tirana-performance/tirana-budget-impact.tsx`
- `components/tirana-performance/tirana-lead-quality-panel.tsx`
- `components/tirana-performance/tirana-next-decision-box.tsx`
- `app/(dashboard)/landing-tirana-performance/page.tsx`

## Mierzone wskaźniki
- ruch na landing Tirana
- koszt kampanii Tirana
- `formularz_start`
- `premium_form_submit`
- `generate_lead`
- `phone_call_lead`
- HOT leady
- oferty
- sprzedaże
- przychód
- koszt leada
- koszt HOT leada
- koszt sprzedaży

## Reguły monitoringu
- ruch bez leadów => `LANDING PROBLEM`
- `formularz_start` bez submit => `FORM FRICTION`
- rosnący koszt bez wzrostu HOT leadów => `QUALITY PROBLEM`
- +1000 zł bez wzrostu HOT leadów => `BUDGET WARNING`
- Tirana generuje sprzedaż => `SCALE SIGNAL`
- akceptowalny koszt HOT leada => `CONTINUE`
- brak sprzedaży po 14 dniach => `REVIEW OFFER / FOLLOW-UP`

## Trasa
- `/landing-tirana-performance`

## UI
- premium dark ADEZO
- złote akcenty
- mobile responsive (karty + siatka `lg:grid-cols-2`)

## Dane
- z providerów GA4 / Google Ads
- fallback providerów obsługiwany transparentnie
- bez ingerencji w istniejące connectory GA4/Google Ads
