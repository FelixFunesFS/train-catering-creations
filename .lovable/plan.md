
# Payment Confirmation Flow - End-to-End Audit & Fix Plan

## Executive Summary

The customer made a $40.33 deposit payment that was successfully processed, but **three critical issues** prevented the full flow from completing:

1. **CRITICAL: Stripe Webhook Signature Verification Failing** - The `stripe-webhook` function is failing with "SubtleCryptoProvider cannot be used in a synchronous context"
2. **Invoice Link Not Working** - The `customerAccessToken` is never saved to sessionStorage, so the "View Invoice" button has no token to use
3. **Milestones Not Updated** - Because the webhook failed, the milestone status wasn't updated from `pending` to `paid`

---

## Current Data State (Evidence from Database)

| Field | Value |
|-------|-------|
| Transaction ID | `70a1a1db-54ef-450d-a0f5-e57e045943f0` |
| Amount | $40.33 (4033 cents) |
| Transaction Status | `completed` (updated by verify-payment) |
| Invoice Status | `approved` (should be `partially_paid`) |
| DEPOSIT Milestone | `pending` (should be `paid`) |
| Payment History | 1 record (created by verify-payment fallback) |

---

## Issue 1: Stripe Webhook Signature Verification Failing (CRITICAL)

### Root Cause
The logs show repeated failures:
```
[STRIPE-WEBHOOK] Webhook signature verification failed - 
{"error":"SubtleCryptoProvider cannot be used in a synchronous context.
Use `await constructEventAsync(...)` instead of `constructEvent(...)`"}
```

The Stripe SDK for Deno requires **async** signature verification using `constructEventAsync()` instead of the synchronous `constructEvent()`.

### Current Code (Line 54 in stripe-webhook/index.ts)
```typescript
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### Required Fix
```typescript
event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
```

### Impact
Because the webhook fails, none of the following happens:
- Transaction status not updated to `completed`
- Milestone not marked as `paid`
- Invoice workflow_status not updated to `partially_paid`
- Customer confirmation email not sent
- Admin notification not sent

The only reason the transaction shows `completed` is because `verify-payment` runs as a fallback when the PaymentSuccess page loads.

---

## Issue 2: Invoice Link Not Working

### Root Cause
The PaymentSuccess page tries to get the token from sessionStorage:
```typescript
const token = sessionStorage.getItem('customerAccessToken') || 
              new URLSearchParams(window.location.search).get('token');
```

But **nothing ever sets** `sessionStorage.setItem('customerAccessToken', ...)` anywhere in the codebase.

### Flow Analysis
1. Customer is on `/estimate?token=abc123`
2. Customer clicks "Pay Now" → redirected to Stripe
3. After payment, Stripe redirects to `/payment-success?session_id=xxx`
4. The token is **lost** because:
   - It's not in the URL params
   - It's not in sessionStorage
   - The checkout session metadata has `invoice_id` but not `customer_access_token`

### Required Fix (Two Options)

**Option A: Pass token in success URL** (simpler)
In `create-checkout-session/index.ts`, update the success URL:
```typescript
const defaultSuccessUrl = `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&token=${invoice.customer_access_token}&type=deposit`;
```

**Option B: Save token to sessionStorage before redirect**
In `usePaymentCheckout.ts` or the PaymentCard component, save the token before redirecting:
```typescript
// Before redirecting to Stripe
sessionStorage.setItem('customerAccessToken', accessToken);
window.location.href = data.url;
```

**Recommendation**: Use Option A (pass in URL) because:
- It survives browser session loss
- Works if customer opens payment link in a new tab
- More reliable than sessionStorage

---

## Issue 3: Milestones Not Updated to "Paid"

### Root Cause
This is a consequence of Issue #1 (webhook failing). The webhook is responsible for:
1. Matching the payment to the correct milestone
2. Updating milestone status to `paid`
3. Checking if invoice is fully paid

### Current State
The deposit milestone for INV-2026-0197:
```
id: 1825a8dd-b29d-4f8f-924b-de192a5ef6e8
amount_cents: 4033
status: pending  ← Should be "paid"
milestone_type: DEPOSIT
```

The payment transaction:
```
id: 70a1a1db-54ef-450d-a0f5-e57e045943f0
amount: 4033
status: completed  ← Correctly marked by verify-payment
milestone_id: null  ← Never linked to milestone
```

### Fix
Once the webhook is fixed with `constructEventAsync`, it will correctly:
1. Find the milestone with matching `amount_cents`
2. Update its status to `paid`
3. Update invoice to `partially_paid`

---

## Issue 4: verify-payment Also Has Problems

### Current Behavior
The `verify-payment` function tries to update the invoice with:
```typescript
.update({ status: 'paid', paid_at: ... })
```

But the invoices table uses `workflow_status`, not `status`. This is why logs show:
```
Error updating invoice status
```

### Fix Required
```typescript
// verify-payment/index.ts - Line 66-70
.update({
  workflow_status: 'paid',  // Not 'status'
  paid_at: new Date().toISOString(),
})
```

Also, verify-payment should:
1. Check if it's a partial payment before marking as fully paid
2. Update the milestone status to `paid`
3. Update workflow_status to `partially_paid` for deposits

---

## Issue 5: PaymentSuccess Page Hardcodes "10 days prior" (Minor)

### Current Text (Line 167)
```
Remaining balance due 10 days prior to event
```

### Actual Schedule
Based on the payment tier system:
- SHORT_NOTICE: 7 days before
- MID_RANGE/STANDARD: 14 days before
- GOVERNMENT: Net 30 after event

### Fix
This should dynamically pull from milestone data, not be hardcoded. But since the webhook isn't passing milestone data to the success page, we should at least correct it to "14 days" for consistency with the most common case.

---

## Complete Fix Summary

| Issue | File | Line | Change |
|-------|------|------|--------|
| #1 Webhook Async | `stripe-webhook/index.ts` | 54 | Change `constructEvent` to `await constructEventAsync` |
| #2 Token in URL | `create-checkout-session/index.ts` | 149 | Add `&token=${invoice.customer_access_token}&type=${payment_type}` |
| #3 Milestone Update | (Fixed by #1) | - | Webhook will work after async fix |
| #4 verify-payment status | `verify-payment/index.ts` | 67 | Change `status` to `workflow_status` |
| #4 verify-payment partial | `verify-payment/index.ts` | 63-76 | Add logic to detect partial vs full payment |
| #5 Due date text | `PaymentSuccess.tsx` | 167 | Change "10 days" to "2 weeks" or make dynamic |

---

## Implementation Priority

1. **CRITICAL: Fix stripe-webhook async** - This is blocking ALL payment processing
2. **HIGH: Fix token passing in success URL** - Customers can't navigate back to invoice
3. **HIGH: Fix verify-payment status field** - Fallback processor is failing silently
4. **MEDIUM: Enhance verify-payment for partial payments** - Proper milestone tracking
5. **LOW: Fix hardcoded due date text** - UX consistency

---

## Testing Plan After Implementation

1. **Deploy updated edge functions**
2. **Make a test payment** on invoice INV-2026-0197
3. **Verify webhook logs** show "Webhook signature verified" (not failed)
4. **Check database**:
   - Milestone status = `paid`
   - Invoice workflow_status = `partially_paid`
   - Payment transaction = `completed` with `milestone_id` populated
5. **Verify PaymentSuccess page**:
   - "View Invoice" button works
   - Redirects to `/estimate?token=...` correctly
6. **Check customer email**:
   - Received payment confirmation
   - Correct remaining balance shown

---

## Technical Details for Implementation

### Fix 1: stripe-webhook async signature verification
```typescript
// Line 52-62 in stripe-webhook/index.ts
let event: Stripe.Event;
try {
  event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  logStep("Webhook signature verified");
} catch (err) {
  logStep("Webhook signature verification failed", { error: err.message });
  return new Response(JSON.stringify({ error: "Invalid signature" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 400,
  });
}
```

### Fix 2: Pass token in success URL
```typescript
// Line 149 in create-checkout-session/index.ts
const defaultSuccessUrl = `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&token=${invoice.customer_access_token}&type=${payment_type}`;
```

### Fix 3: verify-payment workflow_status and partial payment logic
```typescript
// Lines 62-76 in verify-payment/index.ts
if (session.payment_status === 'paid' && transaction) {
  // Calculate total paid for this invoice
  const { data: allTxs } = await supabase
    .from('payment_transactions')
    .select('amount')
    .eq('invoice_id', transaction.invoice_id)
    .eq('status', 'completed');
  
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('id', transaction.invoice_id)
    .single();
  
  const totalPaid = (allTxs || []).reduce((sum, t) => sum + t.amount, 0);
  const isFullyPaid = invoice && totalPaid >= invoice.total_amount;
  
  const { error: invoiceUpdateError } = await supabase
    .from('invoices')
    .update({
      workflow_status: isFullyPaid ? 'paid' : 'partially_paid',
      ...(isFullyPaid && { paid_at: new Date().toISOString() }),
    })
    .eq('id', transaction.invoice_id);
  
  // Also update the matching milestone
  const { data: milestones } = await supabase
    .from('payment_milestones')
    .select('id, amount_cents')
    .eq('invoice_id', transaction.invoice_id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true });
  
  if (milestones?.length) {
    const match = milestones.find(m => m.amount_cents === transaction.amount) || milestones[0];
    await supabase
      .from('payment_milestones')
      .update({ status: 'paid' })
      .eq('id', match.id);
  }
}
```

---

## Admin Process Review

The admin should be able to see:
1. **Event list**: Payment status indicator updated
2. **Event detail**: Payment card showing partial payment received
3. **Notification**: Admin notification email when payment received

All of these depend on the webhook working correctly. Once `constructEventAsync` is fixed, the entire flow will work.

---

## Best Way to Think About This

The payment flow has **three layers of processing**:

1. **Stripe Webhook** (primary) - Should handle all payment processing
   - Update transaction
   - Update milestone
   - Update invoice status
   - Send emails
   
2. **verify-payment** (fallback) - Runs when PaymentSuccess page loads
   - Provides immediate feedback to customer
   - Should NOT duplicate webhook work, but handle edge cases
   
3. **PaymentSuccess UI** (display) - Shows confirmation to customer
   - Needs token to link back to invoice
   - Needs payment details from verify-payment

Currently, Layer 1 is broken (async issue), so Layer 2 is doing partial work but with bugs (wrong field name). Layer 3 is missing the token.

The fix is to repair all three layers to work correctly independently and together.
