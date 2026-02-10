

## Remove Legacy `auto-workflow-manager` Edge Function

### Overview

The `auto-workflow-manager` edge function is fully redundant. The `unified-reminder-system` already handles all three workflow transitions (overdue marking, auto-confirm, auto-complete) with broader status coverage (e.g., it checks `viewed`, `payment_pending`, `partially_paid` -- statuses the legacy function misses). No frontend code calls `auto-workflow-manager`. Removing it eliminates a source of potential double-processing.

### Safety Verification

| Capability | `auto-workflow-manager` | `unified-reminder-system` | Covered? |
|-----------|------------------------|--------------------------|----------|
| Mark overdue invoices | `sent`, `approved` only | `sent`, `viewed`, `approved`, `payment_pending`, `partially_paid` | Yes (better) |
| Auto-confirm paid events | Yes | Yes (with explicit quote status check) | Yes (better) |
| Auto-complete past events | Yes | Yes (identical logic) | Yes |
| Payment reminders | Removed (comment says "handled by unified") | Full implementation with cooldowns | Yes |
| Workflow state logging | Yes | Yes | Yes |

No functionality is lost.

### Changes

**Step 1: Delete the edge function files**
- Delete `supabase/functions/auto-workflow-manager/index.ts`
- Use the Supabase delete edge function tool to remove the deployed function

**Step 2: Remove from `supabase/config.toml`**
- Remove the `[functions.auto-workflow-manager]` block (lines ~36-37)

**Step 3: Unschedule the cron job (SQL migration)**
- Run: `SELECT cron.unschedule('auto-workflow-manager-every-15-min');`
- This removes the every-15-minute cron that calls the now-deleted function

**Step 4: Update documentation (4 files)**

| File | Change |
|------|--------|
| `docs/UX_ARCHITECTURE.md` | Update UC-SYS1 to reference `unified-reminder-system` instead; update edge function inventory and cron schedule tables |
| `docs/EDGE_FUNCTION_MONITORING.md` | Remove `auto-workflow-manager` references from expected cron jobs, function logs list, and manual test section |
| `docs/DEPLOYMENT_CHECKLIST.md` | Update cron job reference from "auto-workflow-manager every 15 min" to "unified-reminder-system daily 9 AM" |
| `docs/PAYMENT_TESTING_GUIDE.md` | Replace `auto-workflow-manager` invocation examples with `unified-reminder-system` |
| `CODEBASE_MAP.md` | Remove `auto-workflow-manager` from edge function inventory |
| `EDGE_FUNCTION_CRON_SETUP.sql` | Remove commented-out unschedule line for the legacy job |

**Not changed**: Old migrations (`20251006...`, `20251007...`) are left as-is since they are historical records. The cron unschedule SQL handles the runtime cleanup.

### Risk

Zero. No frontend code references this function. The cron job is the only caller, and `unified-reminder-system` already runs daily with the same (and better) logic.

