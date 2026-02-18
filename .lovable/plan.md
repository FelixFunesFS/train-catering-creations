

## Comprehensive Fix: Milestone Display Accuracy Across All Surfaces

### The Core Problem

There are **three distinct categories** of issues remaining:

1. **Per-milestone remaining balance not shown** -- All surfaces display the original `amount_cents` instead of what's actually still owed on each milestone after partial payments
2. **Stale UI after regeneration** -- Query key mismatches prevent the admin portal from refreshing after clicking Regenerate
3. **Billing label inconsistency** -- PaymentList uses raw string replacement instead of friendly labels

---

### Category 1: Per-Milestone Remaining Balance (The Big One)

**Current behavior:** The Super Bowl Test has $50.33 paid ($40.33 deposit + $5 + $5 custom). The 40% milestone shows "$161.32" everywhere. But $10.00 of that has already been covered by the custom payments overflowing past the deposit. The milestone should show "$151.32 remaining".

**This affects 4 surfaces:**

| Surface | File | What it shows | What it should show |
|---------|------|---------------|---------------------|
| Customer portal milestone list | `PaymentCard.tsx` line 278 | `$161.32` | `$151.32 remaining` |
| Customer portal Pay button | `PaymentCard.tsx` lines 69, 176, 315, 348 | Pay $161.32 | Pay $151.32 |
| Admin milestone list | `PaymentScheduleSection.tsx` line 227 | `$161.32` | `$161.32 (scheduled) / $151.32 remaining` |
| Print view | `EstimatePrintView.tsx` line 350 | `$161.32` | `$151.32 remaining` |

**Fix -- 2 parts:**

**Part A: New waterfall calculator in `paymentFormatters.ts`**

Add a `calculateMilestoneBalances(milestones, totalPaid)` function that walks through milestones in order, distributing `totalPaid` across them:

```text
For each milestone (in due-date order):
  appliedCents = min(milestone.amount_cents, remainingPaid)
  remainingCents = milestone.amount_cents - appliedCents
  remainingPaid -= appliedCents
```

Returns enriched milestone array with `appliedCents` and `remainingCents` per milestone.

**Part B: Update display components**

- **PaymentCard.tsx**: Call `calculateMilestoneBalances(milestones, totalPaidFromTransactions)` and display `remainingCents` for unpaid milestones. Show "X remaining of Y" when they differ. Fix `handlePayMilestone` to send `remainingCents` instead of `amount_cents`.
- **PaymentScheduleSection.tsx**: Same waterfall calculation using the transaction-based `totalPaid` already computed on line 94. Show remaining per milestone.
- **EstimatePrintView.tsx**: Apply waterfall and show remaining amounts.

**Part C: Checkout session safety (already handled)**

The `create-checkout-session` edge function at line 150-157 uses `milestone.amount_cents` directly when `payment_type === 'milestone'`. However, since `PaymentCard.tsx` sends a `milestone_id` (not an explicit amount), the server fetches the original `amount_cents`. This means clicking "Pay" on the milestone would charge $161.32 even though only $151.32 is owed.

Fix: Change `PaymentCard.tsx` to send `paymentType: 'custom'` with `amount: remainingCents` instead of `paymentType: 'milestone'` with `milestoneId`. Alternatively, pass the remaining amount explicitly. The checkout session already handles `customAmount` correctly at line 115-117.

---

### Category 2: Stale UI After Regeneration (Query Key Mismatch)

The actual query key for milestone data is:
```text
['invoices', 'detail', invoiceId, 'with-milestones']
```
(from `invoiceKeys.detail(id)` which is `['invoices', 'detail', id]` + `'with-milestones'`)

But three locations invalidate the wrong key `['invoice-with-milestones', invoiceId]`:

| File | Line | Wrong Key | Correct Key |
|------|------|-----------|-------------|
| `useEstimateActions.tsx` | 98 | `['invoice-with-milestones', id]` | `[...invoiceKeys.detail(id), 'with-milestones']` |
| `usePaymentScheduleSync.ts` | 48 | `['invoice-with-milestones', id]` | `[...invoiceKeys.detail(id), 'with-milestones']` |
| `useInvoiceTotalSync.ts` | 67, 112 | `['invoice-with-milestones', id]` | `[...invoiceKeys.detail(id), 'with-milestones']` |

Additionally, `handleRegenerateMilestones` should also invalidate:
- `[...invoiceKeys.detail(id), 'payment-summary']` -- refreshes payment summary
- `['payment-transactions', id]` -- refreshes transaction list
- `['events']` -- refreshes event list badges

---

### Category 3: Billing Label in PaymentList

**File:** `PaymentList.tsx` line 258

Uses raw regex replacement: `milestone_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())`

This turns "DEPOSIT" into "Deposit" and "MILESTONE" into "Milestone" (should be "Milestone Payment").

Fix: Add a label map matching the one in `PaymentScheduleSection.tsx` (uppercase keys: DEPOSIT, MILESTONE, BALANCE, FULL, FINAL, COMBINED).

---

### Category 4: Preview Email Sample Data (Minor)

**File:** `preview-email/index.ts` lines 92-96

Sample milestones use old types (`deposit`, `mid_payment`, `final_payment`) that don't match actual DB values (`DEPOSIT`, `MILESTONE`, `FINAL`). This means the email preview in Settings shows labels that won't match real emails.

Fix: Update sample milestone types to uppercase DB values.

---

### Changes by File

**1. `src/utils/paymentFormatters.ts`**
- Add `calculateMilestoneBalances(milestones: Milestone[], totalPaid: number)` function
- Returns array of `{ ...milestone, appliedCents, remainingCents }` objects
- Uses same waterfall logic as backend `apply-payment-waterfall`

**2. `src/components/customer/PaymentCard.tsx`**
- Import and call `calculateMilestoneBalances` with milestones + `totalPaidFromTransactions`
- In milestone list (line 278): show `remainingCents` instead of `amount_cents` for unpaid milestones; show "X remaining of Y" when they differ
- In desktop CTA (lines 176, 202): show `remainingCents`
- In mobile scheduled tab (lines 315, 328, 348): show `remainingCents`
- In `handlePayMilestone`: send `remainingCents` as amount with `paymentType: 'custom'` instead of sending `milestone.amount_cents` with `paymentType: 'milestone'`

**3. `src/components/admin/events/PaymentScheduleSection.tsx`**
- Import and call `calculateMilestoneBalances` with milestones + `paymentSummary.totalPaid`
- In milestone display (line 227): show remaining alongside original when they differ (e.g., "$151.32 remaining of $161.32")

**4. `src/pages/EstimatePrintView.tsx`**
- Import `calculateMilestoneBalances` from `paymentFormatters.ts`
- Apply waterfall before rendering milestone table
- Show remaining amount column

**5. `src/hooks/useEstimateActions.tsx`**
- Line 98: Replace `['invoice-with-milestones', invoiceId]` with `[...invoiceKeys.detail(invoiceId), 'with-milestones']`
- Add invalidation for payment-summary, payment-transactions, events

**6. `src/hooks/usePaymentScheduleSync.ts`**
- Line 48: Replace `['invoice-with-milestones', invoiceId]` with correct key
- Line 49: Also add payment-summary invalidation

**7. `src/hooks/useInvoiceTotalSync.ts`**
- Lines 67, 112: Replace `['invoice-with-milestones', invoiceId]` with correct key

**8. `src/components/admin/billing/PaymentList.tsx`**
- Line 258: Replace raw regex with label map (DEPOSIT -> "Booking Deposit", MILESTONE -> "Milestone Payment", etc.)

**9. `supabase/functions/preview-email/index.ts`**
- Lines 93-95: Update sample milestone types from `deposit`/`mid_payment`/`final_payment` to `DEPOSIT`/`MILESTONE`/`FINAL`

---

### What Does NOT Change

- Database schema or milestone records (`amount_cents` stays as original scheduled amount -- it represents the target, not the balance)
- Backend waterfall logic (`apply-payment-waterfall` -- already correct)
- Checkout session edge function (already handles custom amounts at line 115-117)
- Email templates (already fixed in previous changes)
- PDF generation edge function (already fixed labels)
- Overall progress bar calculations (already use transaction-based `totalPaid`)

### Deploy Order

1. Update `paymentFormatters.ts` (add waterfall calculator)
2. Update `PaymentCard.tsx` (customer portal display + payment button fix)
3. Update `PaymentScheduleSection.tsx` (admin display)
4. Update `EstimatePrintView.tsx` (print view)
5. Fix query key mismatches in `useEstimateActions.tsx`, `usePaymentScheduleSync.ts`, `useInvoiceTotalSync.ts`
6. Fix `PaymentList.tsx` labels
7. Fix `preview-email/index.ts` sample data
8. Deploy `preview-email` edge function

### Risk Assessment

- The waterfall calculator is pure client-side math -- no database changes
- Payment button fix is critical for preventing overcharges (currently could charge $161.32 when only $151.32 is owed)
- Query key fixes are low-risk -- they only affect cache invalidation timing
- All changes are additive or replace incorrect values with correct ones

