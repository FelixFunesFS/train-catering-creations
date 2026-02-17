

## Embed Stripe Payment Directly in Admin Dialog

### The Problem

Currently, clicking "Take Payment" in the admin Record Payment dialog generates a Stripe Checkout link and either opens a new browser tab or shows a "Payment Link Ready" intermediate screen. The admin wants to enter the customer's card details right there in the dialog without leaving the page.

### Why This Requires Careful Thought

The entire payment pipeline (milestones, invoice status updates, confirmation emails, payment history) is triggered by the **stripe-webhook** listening for `checkout.session.completed`. If we bypass Checkout Sessions entirely (e.g., using raw PaymentIntents + Stripe Elements), none of those automations would fire -- we'd have to duplicate all that logic in a new `payment_intent.succeeded` handler.

### Recommended Approach: Stripe Embedded Checkout

Stripe offers an **Embedded Checkout** mode (`ui_mode: 'embedded'`) that renders the full Stripe card form inside a container on your page. The key advantage: it still creates a Checkout Session, so the existing `checkout.session.completed` webhook fires exactly as it does today. Zero changes to milestone logic, invoice status, emails, or payment history.

### What Changes

**1. New dependency: `@stripe/stripe-js`**
- Lightweight Stripe frontend SDK (~15KB). Required to render the embedded checkout.

**2. Edge function: `create-checkout-session/index.ts`**
- Accept a new optional parameter `ui_mode: 'embedded'`
- When `ui_mode` is `'embedded'`, pass `ui_mode: 'embedded'` and a `return_url` (instead of `success_url`/`cancel_url`) to `stripe.checkout.sessions.create()`
- Return `{ clientSecret: session.client_secret }` instead of `{ url: session.url }`
- When `ui_mode` is not set, behavior stays exactly the same (backward compatible)

**3. New component: `src/components/admin/billing/EmbeddedCheckout.tsx`**
- Uses `@stripe/stripe-js` to call `stripe.initEmbeddedCheckout({ clientSecret })`
- Renders the Stripe card form inside a div within the existing dialog
- Handles the `onComplete` callback to close the dialog and show a success toast
- Shows a loading spinner while the form initializes

**4. Updated component: `PaymentRecorder.tsx`**
- After the admin selects payment type and clicks "Take Payment":
  - Calls `create-checkout-session` with `ui_mode: 'embedded'`
  - Instead of opening a new tab, transitions the dialog to show the `EmbeddedCheckout` component
  - The Stripe card form appears right inside the dialog
  - Admin enters the customer's card details and submits
- The "Copy Link" / "Open Checkout" fallback buttons remain available as a secondary option via a small "Share link instead" toggle

### What Does NOT Change

- `stripe-webhook/index.ts` -- no modifications needed; `checkout.session.completed` fires the same way
- Milestone waterfall logic -- unchanged
- Invoice status transitions -- unchanged  
- Confirmation emails -- unchanged
- Payment history / transactions -- unchanged
- Customer portal -- unchanged
- Manual payment tab -- unchanged
- The `create-payment-intent` edge function -- left as-is (unused but not removed)

### Flow Comparison

**Current flow:**
Admin clicks "Take Payment" then clicks "Open Checkout Page" then enters card in new tab then returns to admin portal

**New flow:**
Admin clicks "Take Payment" then card form appears in dialog then admin enters card and clicks Pay then dialog shows success and closes

### Technical Details

```text
PaymentRecorder Dialog
+----------------------------------+
| Record Payment                   |
| [Manual] [Stripe (Card)]        |
|                                  |
| Payment Type: [Full Balance v]   |
| Checkout Amount: $3,270.00       |
|                                  |
| [Take Payment]                   |
|         |                        |
|         v  (click)               |
| +------------------------------+|
| | Stripe Embedded Checkout     ||
| | Card number: [____________]  ||
| | Expiry: [__/__] CVC: [___]  ||
| |                              ||
| | [Pay $3,270.00]              ||
| +------------------------------+|
| [Share link instead] [Cancel]    |
+----------------------------------+
```

### Edge Cases Addressed

- **Stripe publishable key**: This is a public key and is safe to store in code. We'll need to add it as a `VITE_STRIPE_PUBLISHABLE_KEY` env variable or hardcode it.
- **Browser compatibility**: Embedded Checkout works in all modern browsers. No popup blockers to worry about.
- **Payment declined**: Stripe's embedded form shows inline error messages. The webhook handles `checkout.session.expired` for abandoned sessions as it does today.
- **Dialog closed mid-payment**: The checkout session stays pending. The `checkout.session.expired` webhook handler will clean it up after Stripe's expiry window.

### Files Modified

| File | Change | Risk |
|------|--------|------|
| `package.json` | Add `@stripe/stripe-js` | None |
| `create-checkout-session/index.ts` | Add `ui_mode: 'embedded'` support | Low (additive, backward compatible) |
| `EmbeddedCheckout.tsx` (new) | Stripe embedded form component | None (new file) |
| `PaymentRecorder.tsx` | Show embedded form instead of opening new tab | Low (UI only) |

