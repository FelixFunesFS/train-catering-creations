

## Streamline Admin Card Payment to One Step

### The Problem

When an admin clicks "Record Payment" and lands on the Stripe tab, they currently must:
1. Review a payment type dropdown (defaulted to "Full Balance")
2. Click "Take Payment" to generate the checkout session
3. Wait for the embedded Stripe form to load
4. Enter card details

Steps 1-2 are unnecessary for the most common case (full balance). The card form should just appear.

### The Solution

Auto-initiate the Stripe embedded checkout for "Full Balance" as soon as the Stripe tab mounts. Provide a "Change amount" escape hatch for less common scenarios.

### New Flow

```text
Open dialog --> Stripe tab (default) --> Card form loads immediately (full balance)
                                     --> "Change amount" link available if needed
```

### Technical Changes

**File:** `src/components/admin/billing/PaymentRecorder.tsx`

1. **Auto-trigger checkout on mount**: Add a `useEffect` that calls `handleTakePayment()` automatically when the Stripe tab first renders and `balanceRemaining > 0`, with `stripePaymentType` defaulted to `'full'`. This fires once after the invoice summary loads, so the embedded checkout starts loading without any clicks.

2. **Restructure the Stripe tab UI into two states**:
   - **Default state (card form)**: Show the embedded checkout immediately with a small summary line ("Charging full balance: $X,XXX.XX") and a "Change amount" text button below.
   - **"Change amount" state**: Show the existing payment type dropdown, milestone selector, custom amount input, and "Take Payment" button (the current step-2 UI). A "Back" button returns to the auto-loaded checkout.

3. **Add a `showAmountPicker` state** (boolean, default `false`):
   - When `false`: auto-loaded embedded checkout is shown
   - When `true`: the payment type selector UI is shown
   - Selecting a new payment type and clicking "Take Payment" replaces the client secret and returns to the checkout view

4. **Keep the "Share link instead" option** accessible from both states.

### What the Admin Sees

**Most common path (full balance):**
- Open dialog -> card form is already loading -> enter card -> done

**Custom amount path:**
- Open dialog -> click "Change amount" -> pick type/amount -> click "Take Payment" -> card form loads -> enter card -> done

### Edge Cases Handled

- **Balance is zero**: Skip auto-trigger; show "Paid in Full" message instead of loading checkout
- **Invoice still loading**: The `useEffect` waits for `invoiceSummary` to be available before firing
- **Network error on auto-trigger**: Falls back to showing the payment type selector with an error toast, so the admin can retry manually
- **Switching tabs**: If admin switches to Manual tab and back, the checkout session is already loaded (no duplicate calls)

### Files Changed

- `src/components/admin/billing/PaymentRecorder.tsx` -- restructure Stripe tab, add useEffect for auto-trigger, add `showAmountPicker` toggle state

No other files, services, or edge functions are modified.
