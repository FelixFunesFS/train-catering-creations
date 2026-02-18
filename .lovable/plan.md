

## Fix: Stripe Charges Invoice Total Instead of Remaining Balance

### The Problem

When clicking "Full $352.97" in the admin Record Payment modal, the Stripe checkout form shows **$403.30** (the invoice total) instead of **$352.97** (the remaining balance).

**Root cause** -- Line 103 of `create-checkout-session/index.ts`:

```text
let paymentAmount = customAmount || invoice.total_amount;
```

When `payment_type === 'full'`, no `customAmount` is passed by the admin UI, so it falls back to `invoice.total_amount`. The `full` type has no branch to calculate the remaining balance -- only the `deposit` branch queries completed transactions.

The customer-facing PaymentCard happens to work because it explicitly passes `amount: remaining` in the request body, but the server should not rely on the client to calculate the correct balance.

### Quality Audit Findings

In addition to the main bug, two other issues were found:

1. **"Charging" badge is redundant** -- The badge added in the last edit duplicates information already visible in the amount selector buttons and the Stripe form itself. Should be removed.

2. **Missing event context in modal header** -- The dialog title only says "Record Payment" with no indication of which event or invoice the admin is working on. Should show event name, invoice number, and date.

3. **No other incorrect displays found** -- The customer PaymentCard correctly uses `remaining` for full balance, custom amounts, and milestone amounts. The `PaymentDataService` view correctly calculates `total_paid` and `balance_remaining`. The nullish coalescing pattern on line 54 (`balance_remaining || 0`) is safe because the fallback is `0`, not `total_amount`.

### Changes (2 files)

**1. `supabase/functions/create-checkout-session/index.ts` -- Calculate balance for all payment types**

Move the "query completed transactions" logic before the payment type branching so the `full` type uses `balanceRemaining` instead of `invoice.total_amount`.

Replace lines 103-152 with:

```typescript
// Query completed transactions for ALL payment types (not just deposit)
const { data: completedTx } = await supabase
  .from("payment_transactions")
  .select("amount")
  .eq("invoice_id", invoice_id)
  .eq("status", "completed");

const totalAlreadyPaid = completedTx?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
const balanceRemaining = Math.max(0, invoice.total_amount - totalAlreadyPaid);

let paymentAmount: number;

if (customAmount) {
  // Explicit amount from client (custom payments, or customer-facing full pay)
  paymentAmount = customAmount;
} else if (payment_type === 'full') {
  // Server-calculated remaining balance
  paymentAmount = balanceRemaining;
} else if (payment_type === 'deposit') {
  // Waterfall milestone logic (uses same totalAlreadyPaid, no duplicate query)
  const { data: milestones } = await supabase
    .from("payment_milestones")
    .select("amount_cents, due_date")
    .eq("invoice_id", invoice_id)
    .order("due_date", { ascending: true });

  if (milestones && milestones.length > 0) {
    let cumulative = 0;
    let depositRemaining = 0;
    for (const m of milestones) {
      cumulative += m.amount_cents;
      if (totalAlreadyPaid >= cumulative) continue;
      depositRemaining = cumulative - totalAlreadyPaid;
      break;
    }
    paymentAmount = Math.max(0, depositRemaining);
  } else {
    paymentAmount = Math.max(0, Math.round(invoice.total_amount * 0.5) - totalAlreadyPaid);
  }

  if (paymentAmount <= 0) {
    logStep("Deposit already satisfied", { totalAlreadyPaid });
    return new Response(
      JSON.stringify({ error: "This milestone is already fully paid", code: "DEPOSIT_SATISFIED" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
} else if (payment_type === 'milestone' && milestone_id) {
  const { data: milestone } = await supabase
    .from("payment_milestones")
    .select("amount_cents")
    .eq("id", milestone_id)
    .single();

  paymentAmount = milestone ? milestone.amount_cents : balanceRemaining;
} else {
  paymentAmount = balanceRemaining;
}
```

This eliminates the duplicate transaction query in the deposit branch and ensures every payment type has access to `balanceRemaining`.

**2. `src/components/admin/billing/PaymentRecorder.tsx` -- Two UI cleanups**

**a) Add event context to dialog header (lines 242-247)**

Replace the generic title with event name, invoice number, and date:

```
Record Payment
Super Bowl Test | INV-0012
Event Date: May 23, 2026
```

**b) Remove the "Charging" badge (lines 537-543)**

Delete the `bg-primary/5` indicator block. The amount selector buttons already show the selected amount ("Full $352.97"), and the Stripe embedded form will now correctly display the matching charge amount.

### What Stripe will display after the fix

| Button clicked | Amount on button | Stripe form shows |
|---|---|---|
| Full | $352.97 | $352.97 |
| Deposit 10% | $40.33 | $40.33 |
| Custom $150 | $150.00 | $150.00 |

All three now match. Previously, "Full" showed $352.97 on the button but $403.30 in the Stripe form.

### What does NOT change

- Customer-facing PaymentCard (already correct -- passes `remaining` explicitly)
- Deposit waterfall logic (same logic, just reuses the shared transaction query)
- Webhook handling and milestone status updates
- Manual payment tab
- Any other edge functions

