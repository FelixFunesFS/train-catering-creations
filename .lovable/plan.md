

# Payment Milestone Bug: Root Cause Analysis and Fix

## The Bug: Pryce Porter's Milestones

Pryce Porter paid **$62.13** (10% deposit) but all 3 milestones show as **paid**:

| Milestone | Amount | Status | Should Be |
|-----------|--------|--------|-----------|
| 10% Deposit | $62.13 | paid | paid |
| 50% Milestone | $310.65 | paid | **pending** |
| 40% Final | $248.52 | paid | **pending** |

**Actual payment transactions**: 1 completed transaction for $62.13.

---

## Root Cause: Self-Perpetuating Paid Status

The `generate-payment-milestones` edge function has a **dual-waterfall bug** that causes incorrect paid statuses to copy forward on every regeneration.

### How It Works (Broken)

The function runs TWO independent paid-status calculations:

```text
Pass 1 (lines 49-65): Sum paid amounts from OLD milestones being deleted
   totalPaidCents = sum of old milestones where status='paid'
   
Pass 2 (lines 313-338): Query actual payment_transactions
   totalPaidFromTransactions = sum of completed transactions
```

**Both passes independently mark milestones as paid.** Pass 1 runs first during milestone generation (lines 258-274), then Pass 2 runs after and overwrites.

### What Happened to Pryce Porter

1. Deposit of $62.13 was paid -- stripe-webhook correctly marked DEPOSIT milestone as paid
2. Something triggered a milestone regeneration (likely admin editing the estimate or the `usePaymentScheduleSync` hook firing)
3. At that point, old milestones may have already had a corruption, OR the first regeneration incorrectly used `totalPaidCents` from old milestones
4. Once all 3 milestones were incorrectly marked `paid`, every subsequent regeneration reads those old statuses and perpetuates the error:
   - `totalPaidCents` = 62130 (sum of all old "paid" milestones)
   - First waterfall marks all new milestones as "paid" using this inflated number
   - Second waterfall (from transactions) only has 6213, which correctly marks only the deposit -- but the first pass already set them all to "paid"

**The critical issue**: Pass 1 uses milestone `status` as the source of truth instead of actual transactions. If milestones ever get incorrectly marked (even once), the error is permanent and self-replicating.

---

## The Fix

### Remove Pass 1 entirely. Only use actual payment transactions.

**File:** `supabase/functions/generate-payment-milestones/index.ts`

**Change 1:** Remove lines 49-65 (the `totalPaidCents` calculation from old milestones). The variable `totalPaidCents` is used in milestone status calculations at lines 148, 161, 172-182, 214-224, 258-274. All of these need to be changed to use `"pending"` as the default status, since Pass 2 (lines 313-338) will correctly set paid status from actual transactions afterward.

**Change 2:** Set all milestone statuses to `"pending"` during creation (lines 132-311). Remove the inline waterfall logic that uses `totalPaidCents`. The transaction-based waterfall at lines 313-338 will handle it.

**Change 3:** Keep Pass 2 (lines 313-338) exactly as-is. This is the correct logic -- it queries `payment_transactions` and applies waterfall.

### Simplified flow after fix:

```text
1. Delete old milestones (if force_regenerate)
2. Create new milestones with status = "pending"
3. Query payment_transactions for completed payments
4. Apply waterfall: mark milestones as "paid" based on actual money received
5. Insert milestones
```

### Data Fix: Correct Pryce Porter's milestones

After deploying the fix, trigger a regeneration for Pryce Porter's invoice to correct the data. This can be done via the admin "Regenerate" button or by calling the edge function directly. With the fix in place, only the $62.13 deposit milestone will be marked as paid.

---

## Other Risk Areas Identified

### 1. usePaymentScheduleSync hook triggers regeneration too aggressively

**File:** `src/hooks/usePaymentScheduleSync.ts`

This hook watches `totalAmount` and `isGovernment` and regenerates milestones whenever they change. It fires when the admin opens the event detail view if the cached total differs from the database total by even 1 cent. This is likely what triggered the regeneration for Pryce Porter.

**Risk:** Any time an admin opens an event page with stale cache data, milestones could be regenerated unnecessarily, and with the current bug, would propagate incorrect paid statuses.

**No code change needed** once the root cause (dual waterfall) is fixed -- regeneration will be safe because it will always use transaction data.

### 2. stripe-webhook only marks a single milestone as paid

**File:** `supabase/functions/stripe-webhook/index.ts` (lines 126-147)

The webhook uses `milestone_id` from Stripe metadata to mark ONE specific milestone. This is correct for the immediate payment, but if a customer overpays or pays out of order, it won't waterfall to the next milestone.

**Risk:** Low -- Stripe checkout sessions are generated for specific milestone amounts, so overpayment is unlikely. But worth noting.

### 3. No periodic milestone-transaction reconciliation

There is no scheduled job that verifies milestone statuses match actual transactions. If a webhook fails or a milestone status gets corrupted (as happened here), the error persists until manual intervention.

**Recommendation (future):** Add a reconciliation check in the `unified-reminder-system` that compares milestone paid totals against transaction totals and auto-corrects mismatches. This is not urgent but would prevent future drift.

---

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `generate-payment-milestones/index.ts` | Remove `totalPaidCents` from old milestones; set all initial statuses to "pending"; keep transaction-based waterfall as sole source of truth | ~30 lines removed/simplified |

**No other files need changes.** The stripe-webhook, usePaymentScheduleSync, and admin UI are all correct -- the bug is isolated to the milestone generation function using stale milestone data instead of transaction data.

