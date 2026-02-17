

## Plan: Admin Stripe Payment + Declined Status Fix

### Understanding the Request

You want the admin to be able to **accept a Stripe card payment** directly from the billing view -- for example, when a customer calls in and wants to pay by card over the phone. Currently the admin can only record manual payments (cash, check, Venmo, etc.). The Stripe checkout flow only works from the customer portal using their access token.

The best approach: **Add a "Pay via Stripe" option inside the existing PaymentRecorder dialog** that generates a Stripe Checkout link using the invoice's `customer_access_token` (which already exists in the database). The admin can then either:
- Open the checkout page themselves (customer on phone, admin enters card details)
- Copy the link and send it to the customer directly

This reuses the entire existing `create-checkout-session` edge function and all its downstream workflows (webhook processing, milestone updates, invoice status transitions, emails) -- zero duplication.

---

### Change 1: Add "Pay via Stripe" Tab to PaymentRecorder

**File:** `src/components/admin/billing/PaymentRecorder.tsx`

Transform the dialog into a **tabbed interface** with two tabs:

**Tab 1: "Manual" (current behavior, unchanged)**
- Cash, Check, Venmo, Zelle, etc.
- Records payment immediately as `completed`
- All existing workflows remain identical

**Tab 2: "Stripe (Card)"**
- Fetches the invoice's `customer_access_token` from the `invoices` table
- Shows payment amount options: Pay Full Balance, Pay Next Milestone, or Custom Amount
- "Generate Payment Link" button calls `create-checkout-session` with the token
- Returns a Stripe Checkout URL displayed in the dialog
- Admin can click "Open Checkout" (opens in new tab) or "Copy Link" (to share with customer)
- The payment then flows through the normal Stripe pipeline: webhook fires, transaction completes, milestones update, invoice status transitions, emails send

**Why this works without breaking anything:**
- The `create-checkout-session` edge function already accepts an `access_token` and creates the checkout session
- The Stripe webhook already handles `checkout.session.completed` for all downstream updates
- The admin is simply generating the same checkout URL a customer would get, but from the admin view
- Payment type tracking: transactions show `payment_method: 'stripe'` and `payment_type: 'milestone'/'full'/'deposit'` -- clearly distinguishable from manual payments

**What the admin needs to fetch:** The invoice's `customer_access_token` and `payment_milestones` for the invoice. Both are already accessible to admin via RLS policies.

---

### Change 2: Handle `checkout.session.expired` in Stripe Webhook

**File:** `supabase/functions/stripe-webhook/index.ts`

Add a new handler block after line 317 for `checkout.session.expired`:

- Retrieve the expired session from the event
- Look up the `payment_transactions` record by `stripe_session_id`
- If the session has a `payment_intent`, fetch it from Stripe to get the actual decline reason (e.g., `last_payment_error.decline_code` = `card_velocity_exceeded`)
- Update the transaction to `status: 'failed'` with a human-readable `failed_reason`
- If no payment intent (customer abandoned before attempting), mark as `status: 'failed'` with reason "Checkout session expired"

**Stripe Dashboard Action Required:** Verify that `checkout.session.expired` is enabled in your webhook endpoint at Developers > Webhooks. If not listed, add it.

---

### Change 3: Fix Existing Stuck Transactions (One-Time Data Fix)

Update the 3 orphaned pending transactions for INV-2026-0204:

```text
UPDATE payment_transactions
SET status = 'failed',
    failed_reason = 'Payment declined by bank (card_velocity_exceeded)',
    processed_at = now()
WHERE invoice_id = (SELECT id FROM invoices WHERE invoice_number = 'INV-2026-0204')
  AND status = 'pending';
```

---

### Change 4: Show Declined/Failed Transactions in Payment History

**File:** `src/components/admin/billing/PaymentHistory.tsx`

Currently, `failed` transactions are not grouped or displayed with decline reasons. Changes:

1. Add a `failedTransactions` filter group alongside `pendingTransactions` and `voidedTransactions`
2. Add a "Declined / Failed" section with red alert styling
3. Enhance `getStatusBadge()` to show "Declined" (red) when `failed_reason` contains a bank decline code
4. Display the `failed_reason` text below each failed transaction

**File:** `src/services/PaymentDataService.ts`

Add `failed_reason` to the `getPaymentTransactions` query (it exists in the DB but is not currently fetched).

---

### Change 5: Responsive Improvements

**File:** `src/components/admin/billing/PaymentRecorder.tsx`
- Add `max-h-[90vh] overflow-y-auto` for small screen overflow
- Stack action buttons vertically on mobile: `flex-col sm:flex-row`

**File:** `src/components/admin/billing/PaymentHistory.tsx`
- Ensure dialog uses responsive max-width
- Transaction cards stack properly on mobile (already mostly works)

---

### How Admin Stripe Payments Are Distinguished

| Source | `payment_type` | `payment_method` | `status` at creation |
|--------|----------------|-------------------|---------------------|
| Customer portal | `deposit`/`milestone`/`full` | `stripe` | `pending` (until webhook) |
| Admin Stripe tab | `deposit`/`milestone`/`full` | `stripe` | `pending` (until webhook) |
| Admin Manual tab | `manual` | `cash`/`check`/`venmo`/etc. | `completed` (immediate) |

Both admin and customer Stripe payments flow through the same webhook pipeline. The `description` field on the transaction will note the event name and payment type.

---

### What Does NOT Change

| Component | Impact |
|-----------|--------|
| `create-checkout-session` edge function | Untouched -- reused as-is |
| `stripe-webhook` completed handler | Untouched -- only adding expired handler |
| `PaymentDataService.recordManualPayment` | Untouched |
| Milestone waterfall logic | Untouched |
| Invoice status transitions | Untouched |
| Customer portal / PaymentCard | Untouched |
| Email templates | Untouched |

### Files Changed Summary

| File | Change | Risk |
|------|--------|------|
| `src/components/admin/billing/PaymentRecorder.tsx` | Add Stripe tab with checkout link generation | Low -- additive, manual tab unchanged |
| `supabase/functions/stripe-webhook/index.ts` | Add `checkout.session.expired` handler | Low -- additive only |
| `src/components/admin/billing/PaymentHistory.tsx` | Add failed/declined transaction display | Low -- display only |
| `src/services/PaymentDataService.ts` | Add `failed_reason` to transaction query | Low -- adds 1 field |
| Data fix (one-time) | Update 3 stuck pending transactions | Low -- corrects bad data |

