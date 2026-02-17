

## Payment Flow Integrity Fixes -- 4 Safe, Additive Changes

All four fixes are low-risk and purely additive. No existing flows are modified or broken.

---

### Fix 1: Cache Refresh After Embedded Stripe Payment

**Problem:** After a successful embedded Stripe payment, the admin sees stale balance/milestone data until they refresh the page.

**Change in `PaymentRecorder.tsx`:**
- Import `useQueryClient` from `@tanstack/react-query`
- In `handleEmbeddedComplete`, add the same `removeQueries` + `invalidateQueries` calls that `useRecordPayment` already uses (invoice-summary, payments, payment-transactions, ar-dashboard, dashboard KPIs)

**Risk:** None -- identical pattern already used by the manual payment path.

---

### Fix 2: "Share Link Instead" Race Condition

**Problem:** `setShowLinkFallback(true)` then immediately calling `handleTakePayment()` reads stale state, so it creates an embedded session instead of a link.

**Change in `PaymentRecorder.tsx`:**
- Refactor `handleTakePayment` to accept `useLinkMode?: boolean` parameter
- Use `useLinkMode` instead of reading `showLinkFallback` state
- Update the "Share link instead" button to call `handleTakePayment(true)` directly

**Risk:** None -- same logic, just passed as parameter instead of state.

---

### Fix 3: Dynamic Milestone Amount Instead of Hardcoded 50%

**Problem:** "50% Deposit" option always shows 50% of total, but the actual schedule may use 10/50/40 splits.

**Change in `PaymentRecorder.tsx`:**
- Replace the static "50% Deposit" option with the next pending milestone's actual label and amount
- Fall back to "50% Deposit" only if no milestones exist
- Update `getStripeAmount()` to use the milestone amount for the deposit option

**Risk:** None -- only changes what the dropdown displays and the amount sent to `create-checkout-session`. Backend handles any amount.

---

### Fix 4: Manual Payments Write to `payment_history` Table

**Problem:** Stripe webhook writes to both `payment_transactions` and `payment_history`. Manual payments only write to `payment_transactions`, so reporting views querying `payment_history` miss manual payments.

**Change in `PaymentDataService.ts`:**
- After the `payment_transactions` insert in `recordManualPayment`, add a second insert to `payment_history` with matching fields (amount, payment_method, status, invoice_id, notes)

**Risk:** None -- `payment_history` is a reporting-only table with no triggers or cascading effects.

---

### Files Modified

| File | Change |
|------|--------|
| `PaymentRecorder.tsx` | Fixes 1, 2, and 3 |
| `PaymentDataService.ts` | Fix 4 |

### What Does NOT Change

- `stripe-webhook/index.ts`
- `create-checkout-session/index.ts`
- `apply-payment-waterfall/index.ts`
- `EmbeddedCheckout.tsx`
- All email flows
- All milestone waterfall logic
- Customer portal
- Database schema
