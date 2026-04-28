## Fix: Overdue payment reminders show inflated balance

### Problem

In `unified-reminder-system/index.ts` Section 2a (overdue reminders), the code passes `invoice.total_amount` as `balanceRemaining`. For partially-paid invoices that go overdue, this displays the **gross contract total** instead of the actual unpaid balance — confusing customers and misrepresenting what they owe.

### Fix

In `supabase/functions/unified-reminder-system/index.ts`, before invoking `send-payment-reminder` in the overdue branch:

1. Sum completed `payment_transactions` for the invoice (`status = 'completed'`).
2. Compute `trueBalance = max(0, invoice.total_amount - totalPaid)`.
3. Skip the reminder entirely if `trueBalance <= 0` (invoice is actually fully paid — likely a stale `overdue` status that auto-confirm hasn't reconciled yet).
4. Pass `trueBalance` as `balanceRemaining` to `send-payment-reminder`.

Also pull the **next pending milestone** for that invoice (earliest `due_date` with `status = 'pending'`) and pass its `milestone_type` so the email subject/hero correctly says "Final Payment Overdue" or "Deposit Overdue" rather than generic "Payment Overdue" — matches the milestone-aware behavior already present in the upcoming-payment branch (Section 2b).

### Files touched

- `supabase/functions/unified-reminder-system/index.ts` — Section 2a only (~25 line change). No other sections, no schema changes, no cron changes.

### Safety

- Section 2b (upcoming milestones) already does the right thing — untouched.
- 3-day cooldown logic preserved.
- 24h post-approval grace preserved.
- `send-payment-reminder` already branches on `milestoneType` — no changes needed there.
- Skipping zero-balance invoices is a pure improvement (prevents spam on stale records).

### Verification after deploy

Query an overdue + partially-paid invoice (currently zero in production), simulate by manually invoking `unified-reminder-system`, and confirm the email body shows the correct remaining balance via `email_send_log`.

Reply **approved** to ship.