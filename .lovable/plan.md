

# Fix: Billing View Shows Unapproved Estimates as "Awaiting Payment"

## The Issue

Brian Wilson never approved his estimate. His database state is correct:
- Quote status: `estimated`
- Invoice status: `sent`
- Payments: $0 (no transactions)

But he appears in the **Billing / Payment Tracking** view under the **"Awaiting"** tab because the billing view includes `sent` and `viewed` invoices alongside `approved` and `payment_pending` ones.

## The Mental Model

The billing view should only track invoices where **payment is expected** -- meaning the customer has approved the estimate. Unapproved estimates (`sent`, `viewed`) belong in the Events view, not the payment tracker.

```text
Events View (Status Column)     Billing View (Payment Tracking)
----------------------------    --------------------------------
pending                         (not shown)
estimated / sent / viewed       (not shown) <-- Brian belongs here only
confirmed / approved            approved, payment_pending
confirmed / deposit paid        partially_paid
confirmed / paid in full        paid
overdue                         overdue
```

## Changes

### `src/components/admin/billing/PaymentList.tsx`

**1. Remove `sent` and `viewed` from the main filter (line 48):**

```typescript
// From:
['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid', 'paid', 'overdue']
// To:
['approved', 'payment_pending', 'partially_paid', 'paid', 'overdue']
```

**2. Update the "Awaiting" tab filter (line 55):**

```typescript
// From:
['sent', 'viewed', 'approved', 'payment_pending']
// To:
['approved', 'payment_pending']
```

**3. Update the tab count (line 144):**

Same filter change so the count matches.

**4. Update the empty state message (line 113):**

```text
"Approved estimates will appear here once customers confirm them."
```

This is a 4-line change. No edge functions or database changes needed. Brian Wilson will no longer appear in the billing view, and will only show in the Events view as "Estimated" (correct).

