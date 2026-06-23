# BUILD 034 - TASK EXECUTION ENGINE

## Cel
BUILD 034 dodaje warstwę egzekucji zadań z BUILD 033 Automated Revenue Brief Engine.

System odpowiada na pytania:
- czy zadanie zostało wykonane
- kto jest właścicielem
- jaki był deadline
- czy zadanie jest overdue
- jaki był wynik działania
- czy brak wykonania wpływa na forecast

## Nowe pliki
- `lib/task-execution-engine.ts`
- `lib/task-status-tracker.ts`
- `lib/task-overdue-rules.ts`
- `lib/task-impact-calculator.ts`
- `components/data/task-execution-panel.tsx`
- `BUILD_034_TASK_EXECUTION_ENGINE.md`

## Statusy zadań
- TODO
- IN_PROGRESS
- DONE
- BLOCKED
- OVERDUE

## Wyniki zadań
- contacted
- offer_sent
- followup_done
- meeting_booked
- sale_won
- sale_lost
- no_answer
- postponed

## Logika biznesowa (BUILD 034)
1. Overdue -> alert dla CEO
- każde zadanie `OVERDUE` generuje alert eskalacyjny.

2. HOT lead overdue > 2h -> critical
- reguła w `task-overdue-rules.ts`.

3. Follow-up overdue > 24h -> risk
- reguła ryzyka utraty sprzedaży.

4. Zadanie > 30 000 zł overdue -> CEO visibility
- generowany dedykowany alert visibility.

5. Walidacja jakości egzekucji
- `DONE` musi mieć `outcome`
- `BLOCKED` musi mieć `reason`
- `sale_lost` musi mieć `lost_reason`

6. Wpływ na forecast
- `task-impact-calculator.ts` oblicza:
  - forecast delta per task
  - total at risk
  - overdue at risk
  - blocked at risk
  - realized impact dla DONE

## Routing i menu
- Nowa trasa: `/task-execution`
- Nowa pozycja menu: `Task Execution`
- Trasa dopuszczona w preview test mode.

## UI
`task-execution-panel.tsx`:
- premium dark ADEZO
- złote akcenty
- mobile responsive
- preview mode
- sekcje:
  - status wykonania (TODO/IN_PROGRESS/DONE/BLOCKED/OVERDUE)
  - overdue/CEO alerts
  - walidacja jakości wykonania
  - wpływ na forecast
  - lista zadań z ownerem, deadlinem, outcome i impact

## Zakres techniczny
- Brak wysyłki mail/SMS (zgodnie z wymaganiem)
- Tylko warstwa tracking + egzekucja + preview UI.

## Efekt operacyjny
BUILD 034 wymusza codzienną egzekucję:
- pokazuje, które zadania realnie utknęły
- eskaluje krytyczne opóźnienia do CEO
- ujawnia koszt niewykonania wprost w forecast
- zwiększa odpowiedzialność właścicieli działań sprzedażowych
