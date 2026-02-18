

## Inline Amount Selector on Embedded Checkout

### The Problem

Currently, changing the payment amount from the Stripe card view requires three steps:
1. Click "Change amount" (destroys the card form)
2. Select a new amount from a dropdown on a separate screen
3. Click "Take Payment" (reloads the card form)

This creates unnecessary friction. The admin loses context and has to wait for the form to reload twice.

### The Solution

Replace the separate "amount picker" screen with a compact inline amount selector that sits **above** the embedded checkout form. When the admin picks a different amount, the checkout automatically reloads with the new amount -- no extra clicks, no separate screen.

**Layout (top to bottom):**
1. Compact amount selector row (segmented buttons or small dropdown) + share link button
2. Embedded Stripe card form

### How It Works

- The amount selector shows options as compact buttons or a single-line dropdown: **Full Balance**, **Deposit (next milestone %)**, **Custom**
- Selecting a different option immediately triggers a new checkout session and swaps the embedded form
- The "Share link instead" button stays inline at the top alongside the selector
- The separate `showAmountPicker` screen/state is removed entirely -- no more toggling between views
- Custom amount shows a small inline input field that appears when "Custom" is selected, with a confirmation button to reload the form

### What Changes

**File:** `src/components/admin/billing/PaymentRecorder.tsx`

1. **Remove the `showAmountPicker` state** and the entire amount picker conditional block (lines 403-531). This screen is no longer needed.

2. **Replace the embedded checkout section** (lines 532-583) with a unified view:
   - A compact row at the top with amount options (e.g., radio-style buttons: "Full | Deposit | Custom") and the "Share link" button
   - When "Custom" is selected, a small inline dollar input appears below the selector row
   - The `EmbeddedCheckout` component renders below
   - Changing the selection clears `embeddedClientSecret`, sets the new `stripePaymentType`, and calls `handleTakePayment()` automatically

3. **Update `handleTakePayment`** error handling: on failure, instead of `setShowAmountPicker(true)`, just show the toast error and keep the selector visible (since it's always visible now).

### Edge Cases and Workflow Impact

- **No workflow impact**: The `create-checkout-session` edge function, webhooks, milestone logic, and verify-payment flow are all unchanged. Only the UI arrangement changes.
- **Rapid switching**: If the admin clicks between options quickly, only the latest checkout session matters. Previous pending sessions expire automatically in Stripe (they are not charged).
- **Milestone option**: Only appears if there are pending milestones, same as today.
- **Custom amount validation**: The inline input validates minimum amount and warns if exceeding balance, same as today but inline.
- **Loading state**: While a new session loads after switching, show a small spinner overlay on the card form area rather than destroying it entirely.

### Files Changed

| File | Change |
|------|--------|
| `src/components/admin/billing/PaymentRecorder.tsx` | Remove separate amount picker screen; add inline amount selector above embedded checkout; remove `showAmountPicker` state |

