
# Payment Reminder Fix: Approval Guard & Reduced Frequency

## Problem Confirmed

Brian Wilson received **4 automated payment emails** despite **never approving his estimate**. The invoice was in `sent` status, but the reminder system processed it anyway.

---

## Root Cause Summary

| Issue | Location | Impact |
|-------|----------|--------|
| Missing approval guard | `unified-reminder-system` lines 261-280 | Reminders sent for `sent` status invoices |
| Missing approval guard | `auto-workflow-manager` lines 180-245 | Duplicate reminder source (no status check) |
| Duplicate reminder sources | Both functions send `payment_due_soon` / `payment_due` | 2 emails per cycle |
| Daily frequency | Cooldown only checks same-day, same-type | Too aggressive |

---

## Government Net 30: Not Affected

Government customers are **protected** by existing logic:

1. **Milestone Due Date**: Net 30 milestones are due **30 days after the event** (`is_net30: true`, `is_due_now: false`)
2. **Reminder Window**: The upcoming milestone query only selects milestones due within 3 days of today
3. **Future Due Dates**: Since Net 30 due dates are always in the future post-event, they won't match the query until that window approaches

**The proposed fix does not change Net 30 behavior** - it only adds an approval guard that government customers would also benefit from (preventing reminders before approval).

---

## Proposed Fix: Minimal, Targeted Changes

### File 1: `supabase/functions/unified-reminder-system/index.ts`

**Change 1: Add approval guard (lines 261-280)**

Insert status check immediately after email check:

```typescript
if (upcomingMilestones) {
  for (const milestone of upcomingMilestones as any) {
    const email = milestone.invoices?.quote_requests?.email;
    if (!email) continue;

    const invoiceStatus: string | undefined = milestone.invoices?.workflow_status;
    
    // NEW: Only send reminders for approved invoices
    const approvedStatuses = ['approved', 'payment_pending', 'partially_paid', 'overdue'];
    if (!invoiceStatus || !approvedStatuses.includes(invoiceStatus)) {
      logStep('Skipping milestone reminder - invoice not approved', {
        invoice_id: milestone.invoice_id,
        invoice_status: invoiceStatus
      });
      continue;
    }

    // Existing 24-hour cooldown logic continues below...
```

**Change 2: Implement 3-day cooldown (lines 282-288)**

Replace the daily check with a 3-day window across ALL payment reminder types:

```typescript
// Check if ANY payment reminder was sent in the last 3 days
const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const { data: recentReminder } = await supabase
  .from('reminder_logs')
  .select('id')
  .eq('invoice_id', milestone.invoice_id)
  .in('reminder_type', ['payment_due', 'payment_due_soon', 'overdue_payment'])
  .gte('sent_at', threeDaysAgoIso)
  .maybeSingle();

if (recentReminder) {
  logStep('Skipping - payment reminder sent within last 3 days', { invoice_id: milestone.invoice_id });
  continue;
}
```

**Change 3: Apply 3-day cooldown to overdue reminders (lines 205-211)**

Same logic for overdue payment reminders:

```typescript
const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const { data: recentReminder } = await supabase
  .from('reminder_logs')
  .select('id')
  .eq('invoice_id', invoice.id)
  .in('reminder_type', ['payment_due', 'payment_due_soon', 'overdue_payment'])
  .gte('sent_at', threeDaysAgoIso)
  .maybeSingle();
```

---

### File 2: `supabase/functions/auto-workflow-manager/index.ts`

**Change: Remove duplicate payment reminder section (lines 151-245)**

Delete the entire "Send payment reminders for upcoming milestones" section. This eliminates the duplicate reminder source.

Keep only:
- Auto-mark overdue invoices (lines 40-74)
- Auto-confirm paid events (lines 76-111)
- Auto-complete past events (lines 113-149)

---

## What This Fix Does NOT Change

| Feature | Status |
|---------|--------|
| Government Net 30 milestone generation | Unchanged |
| Government Net 30 due date calculation | Unchanged |
| Tax exemption for government | Unchanged |
| Overdue invoice status transitions | Unchanged |
| Auto-confirm/complete workflows | Unchanged |
| Event reminder emails (7-day, 2-day) | Unchanged |
| Post-event thank you emails | Unchanged |

---

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Estimate sent, not approved | Reminders sent immediately | No reminders until approved |
| Just approved (within 24h) | Reminders sent | 24-hour cooldown |
| Approved, deposit due | Daily reminders | One reminder every 3 days |
| Government Net 30 | Reminder 3 days before due | Same (unaffected) |

---

## Technical Summary

- **2 files modified**: `unified-reminder-system/index.ts`, `auto-workflow-manager/index.ts`
- **Lines added**: ~15 (approval guard + 3-day cooldown)
- **Lines removed**: ~95 (duplicate reminder section in auto-workflow-manager)
- **Net change**: Simpler, single source of truth for payment reminders
