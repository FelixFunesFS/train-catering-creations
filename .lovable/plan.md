## Reviewed plan: customer notification + admin history

Yes, we should improve the plan so it covers both sides:

1. **Admin view** needs the actual reason in payment history.
2. **Customer view** needs a helpful explanation and next steps, not just “declined.”

Right now, the customer experience is limited:
- Stripe may show the customer a decline message during checkout, but our app does not currently show a detailed decline reason after they return.
- `/payment-canceled` only says the payment was canceled and suggests checking the payment method.
- Failed-payment emails are not currently sent to customers; the webhook only sends customer emails for successful payments.

## Best customer experience

The customer should see a clear, non-technical message like:

```text
Payment was not completed
Your card issuer declined this payment. No charge was made.

What to do next:
1. Call your bank/card issuer and authorize the charge to Soul Train's Eatery.
2. Confirm the billing ZIP code matches the card on file.
3. Try again, or use a different card.
4. If you need help, call Soul Train's Eatery at (843) 970-0265.
```

For this specific USCG case, the internal Stripe reason is `card_velocity_exceeded`, which usually means the bank blocked it due to daily limit/fraud velocity. The customer-facing text should **not** dump raw Stripe jargon. It should translate it into:

```text
The card issuer may have blocked this because of a daily limit or fraud-prevention rule. Please call the bank to approve the charge, then try again.
```

If ZIP verification failed, include:

```text
Also confirm the billing ZIP code entered at checkout matches the ZIP code your bank has on file.
```

## Revised implementation plan

### 1. Keep auto-void, but make it smarter
Auto-void should stay. It prevents multiple open/pending rows when the customer retries.

Change the behavior so when a new checkout session supersedes an older pending session:
- If the old Stripe session has a real decline error, mark it as `failed`, not just `voided`.
- Store a clean `failed_reason` with the decline code and readable message.
- If there was no payment attempt, keep it as `voided` with “Superseded by new checkout session.”

This keeps retry cleanup intact while preserving the real reason.

### 2. Show payment reasons in admin history
Update `PaymentHistory.tsx` so the Voided Transactions section also displays `failed_reason`.

Also update the badge logic:
- `failed` with decline reason = “Declined”
- `voided` with a decline-like reason = “Declined” or “Voided: declined attempt”
- normal `voided` with no decline = “Voided”

### 3. Improve the customer declined/canceled page
Update `/payment-canceled` so it can show:
- “No charge was made.”
- A friendly explanation when the reason is known.
- Action steps: call bank, confirm ZIP, try another card, contact Soul Train’s Eatery.
- A direct “Return to Estimate / Try Again” button using the token when available.

### 4. Pass enough context back to the app
Update the Stripe cancel URL to include the customer token and session ID when possible:

```text
/payment-canceled?session_id=...&token=...&type=...
```

Then `/payment-canceled` can query a safe edge function or existing transaction data to display the best available reason.

Because the customer page is public/token-based, do **not** expose internal admin data broadly. Only return a sanitized customer-safe reason for that session/token.

### 5. Optional but recommended: notify admins immediately on failed payment
Add an admin notification when Stripe records a failed/declined attempt:

```text
Payment declined for INV-2026-0207
Amount: $5,373.70
Reason: card_velocity_exceeded / ZIP check failed
Suggested action: ask customer to call bank or use another card.
```

I would **not** automatically email the customer on every decline at first. Stripe already shows decline feedback during checkout, and automated customer emails on every retry could feel spammy. Better first step:
- show the customer guidance on the canceled/failed page
- show the admin full details in history
- notify admin so you can follow up personally when needed

## Technical details

Files likely changed:
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts` if adding admin failed-payment notification
- `src/pages/PaymentCanceled.tsx`
- `src/components/admin/billing/PaymentHistory.tsx`

No new tables are needed. Existing `payment_transactions.failed_reason` is enough.

One one-off data correction should be made for the current USCG transaction so the existing history row shows the real reason instead of only “Superseded by new checkout session.”