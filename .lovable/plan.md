

## Documentation Cleanup & Favicon Fix

### Overview

After reviewing all 14 markdown files and the favicon situation, here's the assessment and action plan. The goal is to consolidate, remove stale docs, and fix the favicon -- all without touching any application logic.

---

### Current State: 14 Markdown Files

| File | Status | Action |
|------|--------|--------|
| **Root directory** | | |
| `README.md` | Generic Lovable boilerplate | **Update** -- replace with Soul Train's Eatery project README |
| `CODEBASE_MAP.md` | Mostly accurate, useful reference | **Keep** -- update "Last updated" date |
| `CUSTOMER_DISPLAY_CHECKLIST.md` | Still valid and actively useful | **Keep as-is** |
| `PHASE_1_CLEANUP_SUMMARY.md` | Completed work log from Oct 2024 | **Delete** -- historical, no longer actionable |
| `PHASE_3_IMPLEMENTATION_SUMMARY.md` | Completed work log, references missing `REALTIME_SETUP.sql` | **Delete** -- historical, no longer actionable |
| `README-FloatingCards.md` | Component documentation for floating cards | **Move** to `docs/` and rename to `FLOATING_CARDS.md` |
| `WORKFLOW_TESTING_CHECKLIST.md` | Mixed completed/incomplete items, stale phase references | **Delete** -- superseded by `docs/DEPLOYMENT_CHECKLIST.md` and upcoming `UX_ARCHITECTURE.md` |
| `EDGE_FUNCTION_CRON_SETUP.sql` | SQL setup script (not documentation) | **Keep** -- operational script, not a doc cleanup target |
| **docs/ directory** | | |
| `docs/ADMIN_GUIDE.md` | Good content but references non-existent features (Google Calendar sync, keyboard shortcuts, document uploads) | **Update** -- remove references to inactive features |
| `docs/COMPONENT_CONSOLIDATION_PLAN.md` | Planning document with unchecked items from an old sprint | **Delete** -- stale plan, consolidation either done or abandoned |
| `docs/DEPLOYMENT_CHECKLIST.md` | Short, valid, still useful | **Keep as-is** |
| `docs/EDGE_FUNCTION_MONITORING.md` | Contains hardcoded anon key in curl examples, references Resend (system uses Gmail SMTP) | **Update** -- fix inaccuracies |
| `docs/PAYMENT_TESTING_GUIDE.md` | Comprehensive, still valid | **Keep as-is** |
| `docs/STATUS_TRANSITION_MATRIX.md` | Accurate, detailed, actively useful | **Keep as-is** |
| `docs/WORKFLOW_DIAGRAMS.md` | Good mermaid diagrams, accurate | **Keep as-is** |

---

### Action Summary

**Delete (4 files):**
1. `PHASE_1_CLEANUP_SUMMARY.md` -- completed historical log
2. `PHASE_3_IMPLEMENTATION_SUMMARY.md` -- completed historical log, references missing file
3. `WORKFLOW_TESTING_CHECKLIST.md` -- stale checklist with mixed states
4. `docs/COMPONENT_CONSOLIDATION_PLAN.md` -- stale planning doc

**Move (1 file):**
5. `README-FloatingCards.md` -> `docs/FLOATING_CARDS.md`

**Update (3 files):**
6. `README.md` -- Replace boilerplate with Soul Train's Eatery project description (tech stack, setup, contact info)
7. `docs/ADMIN_GUIDE.md` -- Remove references to: Google Calendar sync (line 199), keyboard shortcuts section (lines 347-357, not implemented), document upload troubleshooting (lines 204-211, feature not active)
8. `docs/EDGE_FUNCTION_MONITORING.md` -- Remove hardcoded bearer tokens from curl examples (replace with placeholder), fix Resend references to match actual Gmail SMTP setup

**Keep unchanged (6 files):**
- `CODEBASE_MAP.md`
- `CUSTOMER_DISPLAY_CHECKLIST.md`
- `EDGE_FUNCTION_CRON_SETUP.sql`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/PAYMENT_TESTING_GUIDE.md`
- `docs/STATUS_TRANSITION_MATRIX.md`
- `docs/WORKFLOW_DIAGRAMS.md`

---

### Favicon Fix

**Current state:**
- `public/favicon.ico` exists (likely generic/default)
- `public/favicon.png` exists (used by `index.html` via `<link rel="icon" href="/favicon.png">`)
- `public/favicon.svg` exists (the actual Soul Train's logo in red)
- `src/hooks/useQuoteNotifications.ts` line 66 references `/favicon.ico` for notification icons

**Actions:**
1. **Delete** `public/favicon.ico` -- not referenced in `index.html`, only used in one notification hook
2. **Update** `src/hooks/useQuoteNotifications.ts` line 66 -- change `icon: '/favicon.ico'` to `icon: '/favicon.png'` (the actual company logo)

This ensures all favicon references point to the real Soul Train's Eatery branding assets. The `favicon.png` and `favicon.svg` already contain the company logo.

---

### What This Does NOT Touch

- No application code changes (except the single notification icon path fix)
- No edge functions
- No database changes
- No component deletions
- No route changes
- No styling changes

### Final docs/ structure after cleanup

```
docs/
  ADMIN_GUIDE.md          (updated)
  DEPLOYMENT_CHECKLIST.md  (unchanged)
  EDGE_FUNCTION_MONITORING.md (updated)
  FLOATING_CARDS.md        (moved from root)
  PAYMENT_TESTING_GUIDE.md (unchanged)
  STATUS_TRANSITION_MATRIX.md (unchanged)
  WORKFLOW_DIAGRAMS.md     (unchanged)

Root:
  README.md               (updated)
  CODEBASE_MAP.md          (unchanged)
  CUSTOMER_DISPLAY_CHECKLIST.md (unchanged)
  EDGE_FUNCTION_CRON_SETUP.sql (unchanged)
```

Total: 11 docs (down from 14), all accurate and current.

