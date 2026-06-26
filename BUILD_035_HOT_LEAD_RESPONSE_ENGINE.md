# BUILD 035 - HOT LEAD RESPONSE ENGINE

## Cel
BUILD 035 zapewnia natychmiastową reakcję na leady premium i pilnuje SLA sprzedażowego.

Silnik monitoruje:
- czy lead ma kontakt w czasie SLA
- kto jest ownerem
- które leady są overdue
- jakie ryzyko dla forecastu generuje brak reakcji
- które leady wymagają visibility CEO

## Nowe pliki
- lib/hot-lead-response-engine.ts
- lib/lead-response-tracker.ts
- lib/sla-monitor.ts
- lib/response-risk-engine.ts
- components/data/hot-lead-priority-board.tsx
- BUILD_035_HOT_LEAD_RESPONSE_ENGINE.md

## Źródła danych
- Excel CRM
- GA4 Lead Metrics
- Revenue Truth Layer
- Task Execution Engine

## Kategorie leadów
- HOT
- WARM
- COLD

## Reguły SLA
- HOT > 15 min bez kontaktu -> CRITICAL
- WARM > 2 h bez kontaktu -> WARNING
- COLD > 24 h bez kontaktu -> INFO

## CEO Visibility
- lead > 30 000 zł
- HOT overdue > 1 h
- brak opiekuna
- lead od architekta VIP

## Widoki UI
Nowa trasa: /hot-lead-response

Nowa pozycja menu: Hot Lead Response

Hot Lead Priority Board zawiera:
1. SLA Dashboard
2. Hot Lead Queue
3. Overdue Lead Alerts
4. Response Time Ranking
5. Lead Owner Performance
6. CEO Critical Alerts

## Integracje
- Executive Daily Brief: panel HOT lead response dodany
- AI Revenue Manager: panel HOT lead response dodany
- Task Execution Engine: dane execution użyte w silniku i panel dodany na stronie task execution
- Revenue Truth Layer: używany do kontekstu gap i priorytetów

## Logika biznesowa
- Każdy HOT lead bez kontaktu obniża forecast (forecastPenalty)
- Każdy lead odzyskany przed SLA poprawia forecast (forecastRecovery)
- Pokazywane są:
  - średni czas reakcji
  - % SLA compliance
  - utracone szanse przez brak reakcji
  - ranking Magd

## Zakres
- Brak wysyłki SMS/mail na tym etapie
- Fokus na monitoring, priorytety i egzekucję SLA
