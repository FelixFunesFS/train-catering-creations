

## Fix: Customer Portal Payment Progress Disagrees with Admin Billing

### The Root Cause

There are **two different data sources** for "amount paid":

1. **Admin billing** uses the `invoice_payment_summary` database view, which sums actual `payment_transactions` where `status = 'completed'`. This is the **authoritative source** and is always accurate.

2. **Customer portal** uses `calculatePaymentProgress()` in `paymentFormatters.ts`, which sums `amount_cents` of milestones where `status === 'paid'`. This is **derived from milestone statuses**, not actual transactions.

When a custom payment is made (e.g., two $5.00 payments), it doesn't match any milestone amount, so no milestone gets marked as "paid". The admin sees $50.33 paid (correct), but the customer portal sees only $40.33 paid (the deposit milestone), missing the $10.00 in custom payments entirely.

This is a **systemic design flaw**, not a one-off data issue. Any custom payment amount will cause this divergence.

### What Needs to Change

The customer portal's `get_estimate_with_line_items` RPC function currently returns only milestones. It needs to also return the transaction-based `total_paid` so the customer portal can display accurate payment progress.

### Changes (3 files)

**1. Database: Update `get_estimate_with_line_items` RPC to include `total_paid`**

Add a `total_paid` field to the RPC return value, calculated the same way as the `invoice_payment_summary` view (summing completed `payment_transactions`).

```sql
-- Inside the RETURN QUERY SELECT, add:
COALESCE(
  (SELECT sum(pt.amount) FROM payment_transactions pt 
   WHERE pt.invoice_id = v_invoice_id AND pt.status = 'completed'),
  0
) as total_paid
```

This makes the customer portal use the same authoritative source as the admin billing.

**2. `src/utils/paymentFormatters.ts` -- Accept optional `actualTotalPaid` override**

Update `calculatePaymentProgress` to accept an optional `actualTotalPaid` parameter. When provided (from the RPC), it uses that instead of summing milestone statuses.

```typescript
export const calculatePaymentProgress = (
  milestones: Milestone[], 
  actualTotalPaid?: number
): { amountPaid; totalAmount; remaining; percentComplete } => {
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount_cents, 0);
  
  // Use transaction-based total if available, fall back to milestone-based
  const amountPaid = actualTotalPaid !== undefined 
    ? actualTotalPaid 
    : milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount_cents, 0);
  
  const remaining = Math.max(0, totalAmount - amountPaid);
  const percentComplete = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
  
  return { amountPaid, totalAmount, remaining, percentComplete };
};
```

**3. Customer portal components -- Pass `total_paid` through**

Update `CustomerEstimateView.tsx` and `PaymentCard.tsx` to pass the `total_paid` value from the RPC response into `calculatePaymentProgress`.

- `CustomerEstimateView.tsx`: Extract `total_paid` from `estimateData` and pass to PaymentCard
- `PaymentCard.tsx`: Accept `totalPaidFromTransactions` prop and pass to `calculatePaymentProgress`

### After This Fix

| Metric | Admin Billing | Customer Portal | Match? |
|--------|--------------|-----------------|--------|
| Total Paid | $50.33 (from transactions) | $50.33 (from transactions via RPC) | Yes |
| Remaining | $352.97 | $352.97 | Yes |
| Progress % | 12% | 12% | Yes |

### What Does NOT Change

- Admin billing (already correct -- uses `invoice_payment_summary` view)
- Milestone schedule display (still shows individual milestone paid/pending status)
- Payment actions (unchanged)
- Edge functions (already fixed in previous changes)
- Email templates or PDF generation

### Technical Detail: Database Migration

A SQL migration is needed to update the `get_estimate_with_line_items` function to return `total_paid`. This is a non-breaking change -- it adds a new field to the JSON response without modifying existing fields.
