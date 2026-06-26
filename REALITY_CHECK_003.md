# REALITY CHECK 003 - DATA TRUST BOOST

## Scope
Base: RC-002
Goal: raise Data Trust through better CRM diagnostics and concrete fix lists.

## Implemented

### New files
- `lib/crm-missing-fields-report.ts`
- `lib/data-trust-action-list.ts`
- `components/data/data-trust-score-explainer.tsx`
- `components/data/crm-cleanup-priority-panel.tsx`
- `REALITY_CHECK_003.md`

### CRM diagnostics (no PII)
- Missing records are reported by anonymized references: `ROW-<line>/<masked-offer-id>`.
- Missing fields grouped by:
  - status
  - owner (opiekun)
  - value (wartość)
  - contact date (data kontaktu)
  - offer date (data oferty)
  - sales result (wynik sprzedaży)
  - lost reason (powód przegranej)

### CEO-focused outputs
- How many records require fixes.
- Top fields harming Data Trust.
- Recoverable Data Trust points from CRM cleanup.
- Minimal action set needed for crossing 70% (or explicit blocker when impossible with CRM-only).

### UI integration
- Added to Executive Daily Brief page.
- Added to AI Revenue Manager page.

## Current findings snapshot
- Data Trust remains constrained mainly by GA4 and Ads completeness.
- CRM cleanup action list is now generated with quantified point recovery.
- If crossing 70% is impossible with CRM-only, blockers are shown explicitly.

## RC-003 Result
- Implementation status: PASS
- Business readiness for >70 Data Trust: CONDITIONAL (requires CRM cleanup + GA4/Ads completeness improvements)
