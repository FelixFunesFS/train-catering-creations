# Prevent Double Payments (ACH + Card) and Make Payment Status Clear for Admins

## What is happening today
When a customer starts a new online payment, the system marks every earlier "pending" online payment for that invoice as "Superseded" (voided) without checking Stripe first. A bank (ACH) payment can take 3-5 business days to clear, so Cyan's ACH payment was still processing when she paid by card. The system voided the ACH record, but Stripe kept processing it, so both charges went through.

## Goals
- A customer cannot pay twice while a bank payment is still processing.
- Admins can see right away when a payment is "Processing (bank transfer)", "Paid", "Failed", or "Overpaid".
- Overpayments get flagged for the admin to resolve. They are never absorbed silently or refunded automatically.
- Existing estimates, invoices, line items and Cyan's records are not rewritten.

## Changes

### 1. Block a second checkout while ACH is processing (server)
- Before creating a new checkout, look up each pending Stripe transaction's session with Stripe.
- If its payment is still `processing` (ACH in flight) or already succeeded, do not void it. Return a clear message instead: "A bank payment of $X started on [date] is still processing. It usually clears in 3-5 business days."
- Only void a pending transaction when Stripe confirms it was abandoned, expired, or declined.

### 2. Customer portal message
- If a bank payment is processing, replace the Pay button with a calm notice: "Your bank payment of $X is processing. No further action is needed. We'll email a receipt once it clears." The notice also lists the phone number (843) 970-0265.

### 3. Admin clarity
- New status badge "Processing - Bank Transfer" (amber) in payment history on desktop and mobile, showing the amount and start date.
- An "Overpaid by $X" alert banner on the event and billing views when total paid is more than the invoice total. It suggests next steps (refund in Stripe, or apply as a credit) and has a "Mark resolved" note field. Resolving it only logs the note; money is not moved.
- A "Possible duplicate payment" flag when two successful payments for the same invoice land within 72 hours.

### 4. Webhook safety
- Handle `checkout.session.async_payment_succeeded` the same way as a normal success, including for transactions previously marked voided/superseded. The ACH record gets revived instead of being lost.
- Run the balance update atomically and idempotently by session id, so two successes arriving close together are each counted once. When they push the total past the invoice total, the overpayment flag is set.

### 5. Cyan Brown (read-only)
- Look up her two transactions and the matching Stripe sessions. Report what Stripe shows (both succeeded, or one still processing) without changing records. The admin decides on a refund in Stripe.

## Out of scope
- No automatic refunds. Reminder, tax, cancellation and thank-you rules stay as they are. The 10/40/50 milestone logic does not change, except that overpayment does not get applied to future milestones.

## Technical details
- `create-checkout-session`: replace blind voiding (lines ~256-299) with `stripe.checkout.sessions.retrieve(id, {expand:['payment_intent']})`. If `payment_intent.status` is `processing`, `succeeded` or `requires_action`, return 409 with `{code:'PAYMENT_PROCESSING', amount, created_at}`.
- `stripe-webhook`: add an `async_payment_succeeded` branch; match by `stripe_session_id` regardless of status; guard with an `already processed` check; compute the overpayment using `total_paid ?? 0` vs `total_amount ?? 0`.
- Migration: add `processing` to the allowed transaction statuses (if constrained), plus `overpaid_cents` and `overpayment_resolved_note` on invoices. These columns are only readable by admins under the existing RLS.
- Frontend: handle 409 in the portal payment component; add badges/banners in the admin payment history, EventDetail, and MobileEstimateView.
- Tests: a Bun test for the overpayment calculation and duplicate-within-72h detection.
