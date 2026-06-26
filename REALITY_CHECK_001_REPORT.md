# REALITY CHECK 001 - END-TO-END DATA VALIDATION

Data audytu: 2026-06-23
Baza: BUILD 035
Tryb audytu: analiza kodu + walidacja konfiguracji + agregaty z realnego pliku CRM (bez PII)

## Executive Summary
Reality Check 001: **FAIL (globalnie)**

Powód: pipeline technicznie działa, ale środowisko jest obecnie skonfigurowane głównie pod fallback/mock dla GA4/Ads i domyślnie dla data provider. To uniemożliwia pełną spójność E2E na realnych danych we wszystkich modułach.

## Wynik per obszar
| Obszar | Status | Źródło danych | Werdykt |
|---|---|---|---|
| 1. GA4 Lead Metrics | FAIL | GA4 provider (stub/fallback) | Brak realnych eventów GA4 w bieżącej konfiguracji |
| 2. Google Ads | FAIL | Google Ads provider (not-configured/fallback) | Brak realnych kosztów Ads i ryzyko pozornych wskaźników ROI |
| 3. Excel CRM | PASS (techniczny), FAIL (operacyjny domyślnie) | Realne pliki XLSX + provider routing | Parser działa na realnym pliku, ale provider domyślnie ustawiony na mock |
| 4. Revenue Truth Layer | FAIL | CRM + GA4 + Ads | Działa logicznie, ale z fallbackami nie daje pełnej prawdy atrybucyjnej |
| 5. Executive Daily Brief | FAIL | Revenue Truth + CRM | Liczby spójne tylko z aktywnym realnym providerem; obecnie ryzyko pracy na mock |
| 6. Hot Lead Response | FAIL | CRM + Task Execution + Truth + GA4 | SLA logicznie poprawne, ale ranking i kolejka mogą bazować na mock przy braku aktywnego Excel CRM |

## Twarde dowody (runtime/config)
1. Środowisko:
- ADEZO_USE_REAL_APIS=false
- ADEZO_GOOGLE_AUTH_MODE=mock
- ADEZO_GOOGLE_ADS_LIVE_ENABLED=false
- brak pełnych credentials GA4/Ads

2. Domyślny data provider:
- jeśli ADEZO_DATA_PROVIDER nieustawione -> resolve do "mock"

3. GA4 provider fallback:
- analytics provider zwraca mapSessions([]) i mapConversions([]) w trybie stub

4. Google Ads provider fallback:
- ads provider zwraca mapCampaigns([]) i mapConversions([]), not-configured gdy brak tokenów

5. Realny CRM plik istnieje i jest czytelny:
- plik: ADEZO_OS_2_0_BUILD034K_CRM_CLEANUP_FINAL_NEW.xlsx
- agregaty bez PII: rowsMapped=1067, wonOffers=23, lostOffers=31, wonValue=511825

## Szczegóły obszarów

### 1) GA4 Lead Metrics
Status: FAIL

Co działa:
- Adapter 031A poprawnie definiuje canonical lead metrics i fallback do sumy komponentów.

Niespójności:
- Brak mechanizmu walidacyjnego wymuszającego równość lead_count = lead_form + lead_tel + lead_email + lead_messenger.
- Przy direct lead_count > 0 system przyjmuje lead_count jako źródło prawdy bez audytu różnicy do sumy komponentów.
- Przy bieżącej konfiguracji provider oddaje puste dane (stub), więc porównanie źródeł (Google/CPC, Facebook/CPC, Organic) nie jest realnie walidowalne.

### 2) Google Ads
Status: FAIL

Co działa:
- Czytelny fallback/not-configured status dla braku credentials.

Niespójności:
- Brak realnych kosztów kampanii w tej konfiguracji.
- Campaign ROI może produkować pozorne ROAS przy koszcie 0 przez safeDiv(numerator, max(1, denominator)); koszt 0 nie jest odróżniony od kosztu 1.
- To ryzyko fałszywych decyzji budżetowych.

### 3) Excel CRM
Status: PASS (techniczny), FAIL (operacyjny domyślnie)

Co działa:
- Provider poprawnie czyta realny plik XLSX, wykrywa nagłówki i mapuje oferty/sprzedaże/wartości.
- Udokumentowany fallback do mock przy błędzie importu.

Niespójności:
- Domyślnie provider resolveuje się do mock (gdy brak ADEZO_DATA_PROVIDER=excel-crm).
- W raportach technicznych nadal pojawiają się dane identyfikujące (np. clientName w panelach operacyjnych), co wymaga maskowania dla trybów technicznych/diagnostycznych.

### 4) Revenue Truth Layer
Status: FAIL

Co działa:
- Struktura kampania -> lead -> oferta -> sprzedaż -> przychód jest zaimplementowana.
- UNATTRIBUTED działa przez brak campaignId/nazwy kampanii.

Niespójności:
- Bez realnych GA4/Ads warstwa prawdy nie ma pełnej atrybucji kosztowej i source/medium.
- ROAS/CPL/CPS używają safeDiv z max(1, denominator), co maskuje zero-denominator i może tworzyć „syntetyczne” wskaźniki.
- Gap do planu logiczny matematycznie, ale jakość zależna od źródeł (obecnie fallback-heavy).

### 5) Executive Daily Brief
Status: FAIL

Co działa:
- Brief korzysta z Revenue Truth i wylicza plan/sold/forecast/gap spójnie z bieżącym store.

Niespójności:
- Przy domyślnym providerze mock liczby nie są gwarantowanie tożsame z realnym CRM.
- Zadania generują się poprawnie strukturalnie, ale ich priorytety i wolumen mogą być oparte na fallback.
- Forecast jest stabilizowany (max), ale bez realnych źródeł może być operacyjnie mylący.

### 6) Hot Lead Response
Status: FAIL

Co działa:
- SLA liczy się z realnych pól czasowych leada (createdAt/lastContactAt).
- Progi HOT/WARM/COLD są poprawnie odwzorowane (15 min / 2h / 24h).
- CEO visibility reguły są zaimplementowane.

Niespójności:
- Jeśli provider jest mock, ranking Magd i kolejka HOT nie odzwierciedlają realnego CRM mimo dostępnego pliku XLSX.
- Forecast penalty/recovery działa logicznie, ale na mockowych leadach daje testowe, nieprodukcyjne sygnały.

## Co działa na realnych danych już teraz
- Odczyt i agregacja z realnego pliku CRM XLSX.
- Mapowanie statusów ofert i wartości (confirmed na agregatach bez PII).

## Co nadal działa na mock/fallback
- GA4 sessions/conversions (stub przy obecnym auth/config).
- Google Ads campaigns/conversions (not-configured/fallback).
- Data provider domyślnie mock, jeśli brak ADEZO_DATA_PROVIDER=excel-crm.

## Lista poprawek przed produkcją
1. Wymusić provider produkcyjny:
- Ustawić ADEZO_DATA_PROVIDER=excel-crm (lub docelowy live provider) w środowisku runtime.

2. Aktywować realne konektory danych:
- ADEZO_USE_REAL_APIS=true
- skonfigurować pełne credentials GA4 i Google Ads.

3. Dodać twarde walidacje metryk GA4:
- alert gdy lead_count != suma komponentów lead_* (z tolerancją) i raport różnicy.

4. Naprawić obliczenia wskaźników przy koszt=0/leads=0/sales=0:
- zastąpić safeDiv(..., max(1, denom)) semantyką NULL/NA + jawne flagi "brak danych".

5. Ograniczyć PII w raportach technicznych:
- maskowanie clientName/phone/email w panelach diagnostycznych i eksportach audytowych.

6. Dodać cross-check E2E (automatyczny test codzienny):
- porównanie CRM wonValue vs Revenue Truth revenue vs Executive Brief sold,
- porównanie HOT queue vs Task Execution overdue,
- zapis diffów do dziennika audytu.

7. Dodać status "data confidence" do wszystkich kluczowych modułów:
- LIVE / MIXED / FALLBACK, widoczny dla CEO.

## Konkluzja
System jest architektonicznie gotowy, ale **nie jest jeszcze gotowy produkcyjnie jako E2E real-data stack** przy aktualnym runtime config. Największe ryzyka to fallbacki GA4/Ads i domyślny mock provider dla warstwy danych.
