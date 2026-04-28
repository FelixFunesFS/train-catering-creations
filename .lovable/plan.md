# Verified Cleanup Plan — Zero Duplicate Risk, Zero Functionality Loss

## Verification results

### ✅ `send-event-reminders` deletion is SAFE

I searched the entire codebase (TypeScript, SQL, config, docs) for any reference to `send-event-reminders`:

| Reference location | Type | Risk |
|---|---|---|
| `CODEBASE_MAP.md` | Documentation only | None — just an outdated description |
| `docs/UX_ARCHITECTURE.md` | Documentation only | None — just an outdated description |
| `supabase/config.toml` | Function declaration (`verify_jwt = false`) | Removed when function deleted |
| Function's own `console.error` | Self-log | Removed with function |

**Zero callers found:**
- ❌ No client code calls it (`supabase.functions.invoke('send-event-reminders', ...)` returns no matches)
- ❌ No other edge function calls it
- ❌ No cron job calls it (verified directly against `cron.job` table)
- ❌ No database trigger references it
- ❌ No webhook points to it

**Conclusion:** Deleting this function removes pure dead code. Nothing breaks.

---

### ✅ Step 3 (scheduling unified-reminder-system) — Duplicate analysis

I traced every email-send path inside `unified-reminder-system` to verify it cannot duplicate:

#### Payment reminder dedup (Section 2a + 2b)
```
Query reminder_logs WHERE invoice_id = X
  AND reminder_type IN ('payment_due','payment_due_soon','overdue_payment')
  AND sent_at >= now() - 3 days
If row exists → SKIP send
```
**Verdict:** Hard 3-day cooldown per invoice across ALL payment reminder types. Safe even if cron runs multiple times per day.

#### Event 7-day reminder dedup (Section 3a)
```
Query reminder_logs WHERE reminder_type = 'event_7_day'
  AND recipient_email = X
  AND sent_at >= today (start of day)
If row exists → SKIP send
```
**Verdict:** One per recipient per day. Triggered only when `event_date = today + 7` exactly. So a given event only matches this query once in its lifetime — on the exact day 7 days before. Cannot duplicate.

#### Event 2-day reminder dedup (Section 3b)
Same pattern as 7-day. Triggered only when `event_date = today + 2`. One match per event lifetime.

#### Thank-you (Section 3c)
Hard-skipped with `// Post-event thank you emails are manual-only - skipping`. Cannot fire.

#### Workflow automations (Section 1)
Status updates only — no emails sent. Idempotent (uses status guards like `!['confirmed','in_progress','completed'].includes(...)`).

---

### 🟡 One subtle risk identified — and mitigation

The 7-day and 2-day dedup uses `recipient_email` as the key (not `quote_request_id`). If the **same customer email** has two confirmed events both falling on `today + 7` (rare but possible — e.g., a customer booking two events on the same date), only ONE of them would receive the 7-day reminder because the second would see the first's log row and skip.

**Mitigation included in plan:** Change the dedup key from `recipient_email` to a composite check using the quote_request_id where available. This is a 4-line code change, fully backwards compatible, and prevents this edge case.

---

## Final Plan (revised based on verification)

### Step 1 — Delete dead code [SAFE — verified]
- Delete `supabase/functions/send-event-reminders/` directory
- Remove its entry from `supabase/config.toml`
- Update `CODEBASE_MAP.md` and `docs/UX_ARCHITECTURE.md` to remove outdated references
- Call `supabase--delete_edge_functions` to remove the deployed function

**Impact:** Zero. No callers exist.

### Step 2 — Drop broken cron [SAFE — verified]
- Drop pg_cron job `send-event-followup-daily` (jobid 3) — broken for 14+ days, never reached the function
- Keep the `send-event-followup` edge function intact (admin uses manually)

**Impact:** Zero new behavior change (it was already failing).

### Step 3 — Schedule unified-reminder-system [SAFE — verified]
- Add pg_cron job `unified-reminder-system-daily` at **9 AM Eastern (14:00 UTC) daily**
- Use `net.http_post` (matches working `token-renewal-manager-daily` pattern)
- Anon key in Authorization header (function uses `verify_jwt = false` per config.toml)

**Duplicate prevention guarantees:**
- Payment reminders: 3-day cooldown via `reminder_logs` (already implemented)
- Event 7/2-day reminders: 1-per-day via `reminder_logs` + exact date match (already implemented)
- Thank-you: hard-skipped (already implemented)

### Step 4 — Belt-and-suspenders dedup hardening
Tighten the event reminder dedup to also key on `invoice_id` when available:
```ts
// Before: only checks recipient_email + reminder_type + today
// After:  checks recipient_email + reminder_type + today, AND inserts invoice_id into log
```
Prevents the rare same-email-multiple-events edge case.

### Step 5 — Memory + docs updates
- Add memory note: **"Reminder System: `unified-reminder-system` is the only canonical reminder driver. `send-event-reminders` was deleted (dead code). `send-event-followup` is manual-only via admin dashboard."**
- Update `CODEBASE_MAP.md` email function count from 11 → 10

---

## What this preserves (verified, no breakage)

| Functionality | Status after changes |
|---|---|
| Quote submission | ✅ Unchanged |
| Quote confirmation email | ✅ Unchanged (separate function) |
| Estimate approval flow | ✅ Unchanged |
| Stripe checkout / webhook | ✅ Unchanged |
| Manual payment reminders (admin button) | ✅ Unchanged |
| Manual thank-you emails (admin button) | ✅ Unchanged |
| Customer portal | ✅ Unchanged |
| Admin dashboard | ✅ Unchanged |
| Auto-overdue invoice marking | ✅ Now actually runs (was dormant) |
| Auto-confirm fully-paid events | ✅ Now actually runs (was dormant) |
| Auto-complete past events | ✅ Now actually runs (was dormant) |
| 7-day event reminder | ✅ Now actually runs (was dormant) |
| 2-day event reminder | ✅ Now actually runs (was dormant) |
| Payment due/overdue reminders | ✅ Now actually runs (was dormant) |

---

## What this changes (intentional)

The unified system **starts firing on schedule for the first time** (per `reminder_logs`, no `event_7_day`/`event_2_day` rows exist — confirms it has not been firing automatically). This means upcoming events with confirmed status will start receiving the reminders the system was designed to send.

**Before approving, confirm:** You DO want these automated reminders to start sending on the standard schedule (7-day, 2-day for confirmed events; 3-day cooldown for payment reminders on overdue/upcoming milestones)? If you'd rather keep these manual too, I'll skip Step 3 and just ship Steps 1, 2, 4, 5.

---

Reply **"approved"** to ship as planned, **"approved but skip step 3"** to keep all reminders manual, or specify changes.
