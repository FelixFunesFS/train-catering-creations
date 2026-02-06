

# Fix: Status Display for Partially Paid Events

## Problem

Felix and Pryce both show "Awaiting Payment" instead of "Approved" with a "Deposit Paid" payment badge. Two issues:

1. `awaiting_payment` status is missing from both helper functions in `statusHelpers.ts`
2. The payment badge immediately shows "Milestone Due" after a deposit is paid, even when the next milestone is weeks away -- creating false urgency

## Desired Behavior

The payment badge should reflect **what needs attention now**:

| Situation | Estimate Badge | Payment Badge |
|-----------|---------------|---------------|
| Approved, no payment yet | Approved | Deposit Due |
| Deposit paid, next milestone is weeks away | Approved | Deposit Paid |
| Next milestone due within 7 days | Approved | Milestone Due (Apr 23) |
| Milestone is past due | Approved | Overdue |
| All milestones paid | Approved | Paid in Full |

---

## Changes

### 1. `src/utils/statusHelpers.ts`

**Add `awaiting_payment` to both functions:**
- Add to `getEstimateStatus` status map as "Approved" (same as `partially_paid`)
- Add to `getPaymentStatus`'s `paymentStates` array

**Add due-date awareness to `getPaymentStatus`:**
- Accept optional `nextMilestoneDueDate` parameter
- If `partially_paid` or `awaiting_payment` and the next milestone is NOT due within 7 days, show "Deposit Paid" (green badge) instead of the milestone-type label
- If due within 7 days, show the contextual label ("Milestone Due", "Final Due", etc.)
- If past due, show "Overdue"

**Add new "Deposit Paid" status entry:**

```typescript
// New status for when deposit is paid and nothing else is due yet
{ label: 'Deposit Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'CheckCircle', showBadge: true }
```

**Update `getNextUnpaidMilestone` return type** to include `due_date` (already does).

### 2. `src/components/admin/events/EventList.tsx`

Update both mobile and desktop views to pass `due_date` from the next unpaid milestone into `getPaymentStatus`:

```typescript
const nextMilestone = getNextUnpaidMilestone(invoice.payment_milestones);
const paymentStatus = getPaymentStatus(
  invoice.workflow_status, 
  nextMilestone?.milestone_type,
  nextMilestone?.due_date  // new parameter
);
```

No other UI changes needed -- the badge rendering already uses `paymentStatus.label` and `paymentStatus.color`.

### 3. `src/components/customer/CustomerDetailsSidebar.tsx` (if applicable)

Same pattern: pass `due_date` to `getPaymentStatus` wherever it is called.

---

## Technical Detail: Updated `getPaymentStatus` Signature

```typescript
export function getPaymentStatus(
  workflowStatus: string, 
  nextMilestoneType?: string | null,
  nextMilestoneDueDate?: string | null  // NEW
): PaymentStatusInfo | null
```

Logic addition before the milestone-type lookup:

```text
1. Check if workflowStatus is 'paid' -> "Paid in Full"
2. Check if workflowStatus is 'overdue' -> "Overdue"  
3. If partially_paid/awaiting_payment AND nextMilestoneDueDate exists:
   a. If due date is in the past -> show milestone label (urgent)
   b. If due date is within 7 days -> show milestone label (upcoming)
   c. If due date is more than 7 days away -> show "Deposit Paid"
4. Otherwise fall through to existing milestone-type labels
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/statusHelpers.ts` | Add `awaiting_payment`, add due-date logic, add "Deposit Paid" status |
| `src/components/admin/events/EventList.tsx` | Pass `due_date` to `getPaymentStatus` calls |

No edge functions or database changes needed. This is a display-only fix.
