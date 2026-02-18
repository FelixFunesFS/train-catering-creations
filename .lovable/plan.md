

## Remove Milestone Button and Fix Partial-Payment-Aware Amounts

### Problem 1: Redundant "Milestone" button

The inline amount selector currently has four options: **Full**, **Deposit**, **Milestone**, and **Custom**. The "Deposit" button already dynamically picks the next pending milestone and shows its label and amount. The separate "Milestone" button duplicates this with an extra dropdown step. It should be removed.

### Problem 2: Milestone amounts ignore already-paid amounts

This is the more significant issue. Here is how it works today:

- A milestone is created with `amount_cents` = percentage of invoice total (e.g., 50% of $5,000 = $2,500)
- The waterfall logic (in `apply-payment-waterfall`) correctly marks milestones as `paid` or `partial` after a payment completes
- **But the admin payment UI charges the full milestone `amount_cents`**, even if part of that milestone has already been paid

**Example scenario:**
- Invoice total: $5,000
- Milestone: 50% = $2,500
- Customer already paid $1,000 toward this milestone (status: `partial`)
- Admin clicks "Deposit" -- the UI shows $2,500 and charges $2,500
- Customer is now overcharged by $1,000

This same issue exists in the **customer-facing checkout** via `create-checkout-session`, where `payment_type: 'deposit'` charges `Math.round(invoice.total_amount * 0.5)` without checking existing payments.

### Where this is an issue

| Location | Issue |
|----------|-------|
| `PaymentRecorder.tsx` (admin UI) | `depositAmount` uses `nextPendingMilestone.amount_cents` -- full milestone amount, not remaining |
| `create-checkout-session` (edge function) | Deposit calculation uses `Math.round(invoice.total_amount * 0.5)` -- ignores partial payments |
| `usePaymentCheckout.ts` (customer hook) | Passes amount directly from above without adjustment |

### The fix

**Principle:** The amount charged for any milestone should be `milestone.amount_cents - amount_already_paid_toward_it`. The `invoice_payment_summary` view already includes milestone data, and `balance_remaining` tracks the overall balance. We need per-milestone remaining amounts.

### Changes

**1. Update `PaymentRecorder.tsx`**

- Remove the "Milestone" button and its dropdown (lines 470-527)
- Remove `selectedMilestoneId` state and `stripePaymentType === 'milestone'` branches
- Calculate `depositAmount` as: `Math.min(nextPendingMilestone.amount_cents, balanceRemaining)` -- this ensures the deposit never exceeds what is actually owed
- For partially-paid milestones (status `partial`), compute the remaining amount using total paid against cumulative milestone thresholds (matching the waterfall logic)

**2. Update `create-checkout-session/index.ts`**

- When `payment_type === 'deposit'`, query `payment_transactions` for completed payments on this invoice
- Calculate the deposit amount as: `Math.max(0, depositTarget - totalAlreadyPaid)` where `depositTarget` is the cumulative amount through the next pending milestone
- If the remaining deposit amount is 0 or negative (milestone already satisfied), return an error instead of charging $0

**3. Simplify the type options**

After removing "Milestone", the admin sees only three options:
- **Full** -- charges `balanceRemaining` (already correct)
- **Deposit** -- charges the remaining amount on the next unpaid milestone (fixed)
- **Custom** -- admin enters any amount (already correct)

### Technical detail: calculating milestone remaining

The waterfall logic in `apply-payment-waterfall` already does this calculation. The same approach should be mirrored:

```text
totalPaid = sum of completed transactions
cumulativeRequired = 0

for each milestone (ordered by due_date):
  cumulativeRequired += milestone.amount_cents
  if totalPaid >= cumulativeRequired:
    milestone is fully paid, skip
  else:
    remaining on this milestone = cumulativeRequired - totalPaid
    this is the deposit amount to charge
    break
```

This ensures the deposit button always reflects exactly what the customer still owes on the next milestone, regardless of partial payments.

### Files changed

| File | Change |
|------|--------|
| `src/components/admin/billing/PaymentRecorder.tsx` | Remove "Milestone" button and dropdown; compute deposit as milestone remaining after partial payments |
| `supabase/functions/create-checkout-session/index.ts` | Fix deposit calculation to subtract already-paid amounts |

