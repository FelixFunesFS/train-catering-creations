

# Combined Fix: Admin Notifications + Manual-Only Thank You Emails

## Summary

This plan combines two fixes into one implementation pass:
1. Restore missing admin notifications for estimate approvals and deposit/partial payments
2. Make post-event thank-you emails manual-only (admin-triggered, not automated)

No other functionality is changed. Government Net 30, payment reminders (already fixed), event reminders, and all workflow automations remain untouched.

## Duplicate Notification Analysis

The stripe-webhook has mutually exclusive branches for full vs. partial payments:
- Line 171: `if (totalPaid >= invoice.total_amount)` -- full payment branch (already has admin notification)
- Line 234: `else` -- partial payment branch (where new notification goes)

A final partial payment that completes the balance enters the FULL payment branch (line 171), so the existing notification fires. The new partial notification in the else block does NOT fire. No duplicates possible.

---

## Changes Overview

| File | Change | Risk |
|------|--------|------|
| `approve-estimate/index.ts` | Add admin notification after customer email | Zero (non-blocking try/catch) |
| `stripe-webhook/index.ts` | Add admin notification inside the partial payment else block (after line 263) | Zero (mutually exclusive with full payment notification) |
| `unified-reminder-system/index.ts` | Remove automated post-event thank-you block (lines 452-506) | Zero (manual trigger replaces it) |
| `send-event-followup/index.ts` | Remove auto-query mode; require quote_id parameter | Low (makes function manual-only) |
| `src/hooks/useEstimateActions.tsx` | Add handleSendThankYou + isSendingThankYou | Low (new handler, no existing logic touched) |
| `src/components/admin/events/EventDetailsPanelContent.tsx` | Add "Send Thank You" button for completed events | Low (UI addition only) |
| `src/components/admin/events/EventEstimateFullView.tsx` | Wire new props from hook to component | Low (prop pass-through) |

---

## Part 1: Admin Notifications

### 1a. approve-estimate/index.ts

Insert after the customer email send block, before the portal URL return:

```typescript
// Send admin notification for approval (non-blocking)
try {
  await supabase.functions.invoke('send-admin-notification', {
    body: {
      invoiceId: invoice.id,
      notificationType: 'customer_approval',
      metadata: { source: 'customer_portal' }
    }
  });
  console.log("[approve-estimate] Admin notification sent");
} catch (err) {
  console.error("[approve-estimate] Admin notification failed (non-critical):", err);
}
```

### 1b. stripe-webhook/index.ts

Insert after line 263 (after customer deposit confirmation email), inside the partial payment else block only:

```typescript
// Send admin notification for deposit/partial payment (non-blocking)
try {
  await supabaseClient.functions.invoke('send-admin-notification', {
    body: {
      invoiceId: invoice_id,
      notificationType: 'payment_received',
      metadata: {
        amount: session.amount_total,
        payment_type: 'deposit',
        full_payment: false
      }
    }
  });
  logStep("Admin notification sent for partial payment");
} catch (err) {
  logStep("Admin notification failed (non-critical)", { error: err });
}
```

This is placed inside the else block (partial payment only). The full payment branch at line 200-215 already has its own admin notification. These are mutually exclusive -- no duplicates.

---

## Part 2: Manual-Only Thank You Emails

### 2a. unified-reminder-system/index.ts

Delete lines 452-506 (the entire automated post-event thank-you block). Replace with:

```typescript
// Post-event thank you: now manual-only (triggered from admin dashboard)
logStep("Post-event thank you emails are manual-only - skipping");
reminderResults.push({ type: 'post_event_thankyou', count: 0, sent: 0 });
```

### 2b. send-event-followup/index.ts

- Remove the "NORMAL MODE" auto-query block (lines 53-73) that finds yesterday's events
- Rename `test_quote_id` to `quote_id`
- Return 400 error if no `quote_id` is provided (prevents automated execution)

### 2c. src/hooks/useEstimateActions.tsx

Add new handler and state:

```typescript
const [isSendingThankYou, setIsSendingThankYou] = useState(false);

const handleSendThankYou = useCallback(async () => {
  if (!quoteId) return;
  setIsSendingThankYou(true);
  try {
    const { error } = await supabase.functions.invoke('send-event-followup', {
      body: { quote_id: quoteId }
    });
    if (error) throw error;
    toast({ title: 'Thank You Email Sent', description: 'Follow-up email sent to customer.' });
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  } finally {
    setIsSendingThankYou(false);
  }
}, [quoteId, toast]);
```

Return `handleSendThankYou` and `isSendingThankYou` from the hook.

### 2d. src/components/admin/events/EventDetailsPanelContent.tsx

Add props: `onSendThankYou?: () => void` and `isSendingThankYou?: boolean`.

Add a "Send Thank You" button next to the "Completed" badge:

```typescript
{isCompleted && onSendThankYou && (
  <Button
    size="sm"
    variant="outline"
    onClick={onSendThankYou}
    disabled={isSendingThankYou}
    className="gap-1.5"
  >
    {isSendingThankYou ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Mail className="h-4 w-4" />
    )}
    Send Thank You
  </Button>
)}
```

### 2e. src/components/admin/events/EventEstimateFullView.tsx

Destructure the new values from useEstimateActions and pass as props:

```typescript
const {
  // ...existing values...
  handleSendThankYou,
  isSendingThankYou,
} = useEstimateActions({ ... });

<EventDetailsPanelContent
  // ...existing props...
  onSendThankYou={handleSendThankYou}
  isSendingThankYou={isSendingThankYou}
/>
```

---

## Complete Email Matrix After All Fixes

| Trigger | Customer Email | Admin Email | Mode |
|---------|---------------|-------------|------|
| Estimate sent | Estimate ready email | -- | Automated (on send) |
| Estimate approved | Approval confirmation | Approval alert (NEW) | Automated (on action) |
| Deposit/partial payment | Deposit confirmation | Payment alert (NEW) | Automated (on action) |
| Final payment completing balance | Payment confirmation | Payment alert (existing, full branch) | Automated (on action) |
| Single full payment | Payment confirmation | Payment alert (existing, full branch) | Automated (on action) |
| Change request | Acknowledgment | Change request alert (existing) | Automated (on action) |
| Payment reminder | Payment due reminder | -- | Automated (3-day cycle) |
| 7-day event reminder | Final details email | -- | Automated (cron) |
| 2-day event reminder | "See you soon" email | -- | Automated (cron) |
| Post-event thank you | Thank you email | -- | Manual (admin button) |

## What This Does NOT Change

- Payment reminder approval guard and 3-day cooldown (already fixed)
- Government Net 30 milestone generation and due dates
- Tax exemption logic
- Auto-mark overdue / auto-confirm / auto-complete workflows
- 7-day and 2-day event reminders (still automated)
- Existing full-payment admin notification in stripe-webhook

