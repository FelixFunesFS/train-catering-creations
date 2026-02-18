

## Fix: Payment Reminder Email Content + Confirmation Dialog with Multi-Recipient Support

### Issues Identified

1. **Email content**: The `payment_reminder` template in `emailTemplates.ts` renders full menu, services, and fake payment options (Bank Transfer, Digital Wallets) -- making it look identical to an estimate email rather than a focused payment notice.

2. **No milestones fetched**: `send-customer-portal-email` only fetches milestones for `approval_confirmation` and `estimate_ready`, so payment reminder emails have no milestone/balance data.

3. **No confirmation before sending**: The dollar sign button fires immediately with no chance to review the recipient email or add additional addresses.

4. **No duplicate protection**: The manual "Send Payment Reminder" button does NOT log to `reminder_logs`, so there's no cooldown check. The automated `unified-reminder-system` has its own cooldown logic, but these two systems don't coordinate -- meaning you could accidentally double-send.

5. **Custom/partial payments not reflected**: The email doesn't show how much has been paid or what the actual balance is. It just says "pay now."

---

### Part 1: Replace payment_reminder email content (emailTemplates.ts)

**Remove:**
- `menu_summary` block
- `service_addons` block  
- "Bank Transfer / Digital Wallets" payment options list

**Replace with:**
- Payment Summary box showing Total, Amount Paid, Balance Due (calculated from milestones with `paid` status or passed in via context)
- Milestone schedule table showing each milestone with status checkmarks (paid/due/upcoming)
- Brief event context (date, guest count, location -- NOT menu)
- "Need changes?" note with phone number
- CTA: "Complete Payment Now" linking to portal

The milestone and payment data will come from the context object passed to `getEmailContentBlocks`.

### Part 2: Fetch milestones + payment totals (send-customer-portal-email)

In `send-customer-portal-email/index.ts` line 140:

- Add `payment_reminder` to the milestone fetch condition
- Also fetch completed payment transactions to calculate total paid:

```typescript
if (type === 'approval_confirmation' || type === 'estimate_ready' || type === 'payment_reminder') {
  // fetch milestones (existing code)
}

if (type === 'payment_reminder') {
  const { data: payments } = await supabase
    .from('payment_transactions')
    .select('amount')
    .eq('invoice_id', invoice.id)
    .eq('status', 'completed');
  
  const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
  // Pass totalPaid into getEmailContentBlocks context
}
```

This ensures the email accurately reflects custom payments, partial payments, and the true remaining balance -- not just the scheduled milestone amounts.

### Part 3: Add confirmation dialog before sending (EventList.tsx)

Instead of firing immediately on button click, show a small dialog that:

1. Displays the primary email address (pre-filled from the quote's email)
2. Allows editing the email address
3. Allows adding additional CC recipients (comma-separated input)
4. Shows a brief summary: event name, invoice number, balance due
5. Has Cancel and Send buttons

**Implementation:**
- Create a `SendPaymentReminderDialog` component (inline in EventList or as a small separate component)
- Uses Radix AlertDialog or Dialog pattern already in the project
- On "Send", calls `send-customer-portal-email` with `override_email` for each recipient
- The `override_email` parameter is already supported by the edge function

**Flow:**
```
Click $ button -> Dialog opens (shows email, event name, balance)
                -> Edit email or add more addresses
                -> Click "Send" -> sends to each address
                -> Toast: "Payment reminder sent to 2 recipients"
```

### Part 4: Log manual reminders to prevent duplicates

After successfully sending, insert a record into `reminder_logs`:

```typescript
await supabase.from('reminder_logs').insert({
  invoice_id: invoiceId,
  reminder_type: 'manual_payment_reminder',
  recipient_email: email,
  urgency: 'medium',
});
```

This creates a paper trail and allows the automated `unified-reminder-system` to see that a reminder was recently sent, preventing double-sends within the 72-hour cooldown window.

### Edge Cases Handled

| Edge Case | How It's Handled |
|-----------|-----------------|
| No payments made yet | Balance = total amount, milestones all show "pending" |
| Partial/custom payments applied | `payment_transactions` summed for actual paid amount |
| All milestones paid (invoice fully paid) | Button hidden -- `paid` is not in `paymentReminderStatuses` |
| Rush event with single 100% milestone | Shows single milestone row, balance = full amount or $0 |
| Government Net 30 milestones | Milestone schedule displays correctly with due dates |
| Admin sends reminder + auto system sends same day | `reminder_logs` entry from manual send triggers cooldown in unified-reminder-system |
| Multiple email addresses entered | Each address gets a separate email via `override_email` |
| Invalid email address entered | Edge function will return error, shown in toast |

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/emailTemplates.ts` | Replace `payment_reminder` blocks: remove menu/services/bank options, add payment summary + milestone schedule |
| `supabase/functions/send-customer-portal-email/index.ts` | Fetch milestones and payment totals for `payment_reminder` type |
| `src/components/admin/events/EventList.tsx` | Replace direct send with confirmation dialog showing email, event info, and multi-recipient support; log to `reminder_logs` after send |

### What Does NOT Change

- No DB schema changes (uses existing `reminder_logs` table)
- No changes to the automated `unified-reminder-system`
- No status changes on send
- Customer portal tokens unaffected
- Estimate send/resend logic unaffected
- PDF generation unaffected

