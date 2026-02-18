

## Fix: Protect Status on Resend + Add "Resend Payment Due" to Event List

### Two Separate Issues

**Issue 1: Resending resets approved status**
The `handleSendEstimate` in `useEstimateActions.tsx` (line 161-167) updates invoice to `sent` status when `isResendMode` is `false`. And `isAlreadySent` only checks for `sent`/`viewed`, so an `approved` invoice shows "Send" instead of "Resend" -- triggering a status regression.

**Issue 2: No "Send Payment Due" email option in the Event List**
You want a quick action to resend a payment reminder email from the event list without navigating into the event detail.

---

### Part 1: Fix `isAlreadySent` (3 files)

Change in `EventEstimateFullView.tsx`, `EstimateEditor.tsx`, and `MobileEstimateView.tsx`:

```typescript
// Before (only covers sent/viewed)
const isAlreadySent = currentInvoice?.workflow_status === 'sent' 
  || currentInvoice?.workflow_status === 'viewed';

// After (covers everything past initial send)
const isAlreadySent = !!currentInvoice?.workflow_status 
  && !['draft', 'pending_review'].includes(currentInvoice.workflow_status);
```

This ensures any invoice in `sent`, `viewed`, `approved`, `payment_pending`, `partially_paid`, `paid`, or `overdue` shows the "Resend" button instead of "Send" -- so `isResendMode` is `true` and the status update is skipped.

### Part 2: Backend safety guard in `useEstimateActions.tsx`

Even with the UI fix, add a guard so `handleSendEstimate` never regresses status beyond `sent`:

```typescript
// Line 161-167: Only mark as 'sent' for FIRST send from draft/pending_review
if (!isResendMode && invoiceId) {
  const { data: freshInvoice } = await supabase
    .from('invoices')
    .select('workflow_status')
    .eq('id', invoiceId)
    .single();
  
  const safeToMarkSent = ['draft', 'pending_review'].includes(
    freshInvoice?.workflow_status || ''
  );
  
  if (safeToMarkSent) {
    await supabase.from('invoices').update({
      workflow_status: 'sent',
      sent_at: new Date().toISOString(),
      is_draft: false,
    }).eq('id', invoiceId);
  }
}
```

### Part 3: Approved status should reset when content changes (NOT on resend)

The approved status should only reset when the admin actually modifies line items, prices, or quantities -- not when resending. This is already handled correctly because:
- `saveAllChanges()` in `useEditableInvoice` only writes line item data to the DB (no status change)
- The DB trigger `recalculate_invoice_totals` recalculates amounts but does not change `workflow_status`

No additional code is needed here. The current system correctly separates content saves from status changes. The only bug was the resend path resetting status -- which Parts 1 and 2 fix.

### Part 4: Add "Resend Payment Due" button to EventList

Add a `Send` (payment) icon button to each event row in both mobile and desktop views:

- **Show condition**: Invoice exists AND invoice status is in `approved`, `payment_pending`, `partially_paid`, or `overdue` (these are the states where a payment reminder makes sense)
- **Action**: Calls `send-customer-portal-email` with `type: 'payment_reminder'` and the `quote_request_id` -- no status changes
- **UI**: Dollar sign or credit card icon with tooltip "Send Payment Reminder"
- **Loading state**: Shows spinner during send, disables button
- **Success toast**: "Payment reminder sent to [customer email]"

The function `send-customer-portal-email` already supports `type: 'payment_reminder'` -- no backend changes needed.

### Part 5: Fix Laurin Eason's data

Run a one-time data fix to restore the correct status that was accidentally regressed:

```sql
UPDATE invoices SET workflow_status = 'approved', 
  status_changed_by = 'admin_fix'
WHERE invoice_number = 'INV-2026-0207';

UPDATE quote_requests SET workflow_status = 'approved',
  status_changed_by = 'admin_fix'
WHERE id = (SELECT quote_request_id FROM invoices WHERE invoice_number = 'INV-2026-0207');
```

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/admin/events/EventEstimateFullView.tsx` | Fix `isAlreadySent` to exclude only `draft`/`pending_review` |
| `src/components/admin/billing/EstimateEditor.tsx` | Same `isAlreadySent` fix |
| `src/components/admin/mobile/MobileEstimateView.tsx` | Same `isAlreadySent` fix |
| `src/hooks/useEstimateActions.tsx` | Add safety guard: only set `sent` from `draft`/`pending_review` |
| `src/components/admin/events/EventList.tsx` | Add "Send Payment Reminder" quick action button to event rows |

### What Does NOT Change

- No edge function changes -- `send-customer-portal-email` already supports `payment_reminder` type
- No DB schema changes
- No milestone/payment logic changes
- Customer portal tokens remain untouched
- PDF generation unaffected

