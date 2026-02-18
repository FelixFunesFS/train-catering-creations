

## Updated Plan: 10/40/50 Cumulative Schedule with Custom Payment Safety Analysis

### How Custom Payments Currently Flow

A custom payment is any arbitrary amount the admin sends via the PaymentRecorder (e.g., "$75 one-time payment"). Here is how it moves through every layer:

```text
Admin enters $75 custom amount
        |
        v
PaymentRecorder.tsx --> payment_type = 'custom'
        |
        v
create-checkout-session --> uses customAmount directly (no waterfall calc)
        |
        v
Stripe Checkout --> customer pays $75
        |
        v
stripe-webhook:
  1. Records payment_transaction (amount=7500, status=completed)
  2. payment_type === 'custom' --> SKIPS milestone auto-match (line 107)
  3. Sums all completed transactions vs invoice total
  4. If totalPaid >= total_amount --> marks invoice 'paid'
  5. Otherwise --> marks invoice 'partially_paid'
  6. Sends email (deposit confirmation for partial, full for complete)
        |
        v
generate-payment-milestones (on next regeneration):
  1. Queries payment_transactions for all completed amounts
  2. Applies waterfall: subtracts total paid from milestones oldest-first
  3. Marks milestones as 'paid' if cumulative payments cover them
```

### Why Custom Payments Are SAFE with the 10/40/50 Change

The custom payment guard in the webhook (line 107: `payment_type !== 'custom'`) means custom payments never directly mark a milestone as paid. Instead:

- They record a transaction in `payment_transactions`
- The invoice status updates based on total paid vs total amount
- Milestone statuses are only reconciled when `generate-payment-milestones` runs with `force_regenerate: true`

Since the waterfall logic in `generate-payment-milestones` reads **percentages from the code** (not from existing milestones), changing from 50/40 to 40/50 means:

- New milestones get the correct 40/50 split
- Regenerated milestones get the correct 40/50 split
- The waterfall marks them paid based on actual transaction totals -- regardless of percentages

### What the Plan Changes (6 Files, Percentages + Descriptions Only)

**1. `supabase/functions/generate-payment-milestones/index.ts`**
- Standard tier (45+ days): Change `midAmount` from `0.5` to `0.4`, update percentage column from `50` to `40`
- Final: percentage becomes `50` (auto-calculated as remainder)
- Update description strings to clarify cumulative meaning

**2. `supabase/functions/generate-invoice-from-quote/index.ts`**
- Mirror the same percentage change for milestones created during invoice generation
- Not all invoices go through this path, but it must stay in sync

**3. `src/utils/paymentScheduling.ts`**
- MILESTONE percentage: 50 to 40
- BALANCE percentage: 40 to 50
- Update description strings

**4. `supabase/functions/_shared/termsAndConditions.ts`**
- Update wording: "50% of the total is required no later than 30 days prior" (stays -- it IS cumulative)
- Change "remaining 40%" to "remaining balance (50%)" for the final payment line

**5. `src/data/faqData.ts`**
- Update payment terms FAQ answer to match new wording

**6. `src/hooks/useCateringAgreement.ts`**
- Update DEFAULT_TERMS fallback percentages

### What Does NOT Change (and Why)

| Component | Reason it is safe |
|-----------|-------------------|
| `stripe-webhook` | Reads transaction amounts, not percentages. Custom payment guard stays. Invoice paid/partial logic uses totals only. |
| `create-checkout-session` | Deposit waterfall already reads milestone `amount_cents` from DB. Custom amount passthrough unchanged. |
| `PaymentRecorder.tsx` (admin) | Waterfall reads milestones from DB. New percentages flow through automatically. |
| `PaymentCard.tsx` (customer portal) | Displays `milestone.amount_cents` and `milestone.percentage` from DB. |
| Customer emails | Payment confirmation emails use transaction amounts. Payment schedule emails render from DB milestones. |
| PDF generation | Reads milestones from DB at render time. |
| `recalculate_milestone_amounts` DB trigger | Uses `percentage` column from DB -- auto-adjusts when invoice total changes. |
| Customer access tokens | Completely unrelated to payment percentages. |
| Reminder system | Sends reminders based on milestone due dates and paid status -- no hardcoded percentages. |
| Payment history / audit log | Records actual transaction amounts, not percentages. |

### Existing Invoices: Migration Path

Invoices already generated with 10/50/40 milestones will keep their old milestones until regenerated. The admin can trigger regeneration from the billing panel (`force_regenerate: true`). The waterfall preserves paid status from `payment_transactions`, so no financial data is lost.

No bulk migration is needed -- milestones update naturally when the admin reviews each event.

### Risk Summary

- **Zero logic changes**: Only percentage constants and description strings change
- **Custom payments unaffected**: They bypass milestone matching entirely (webhook guard)
- **Waterfall is percentage-agnostic**: It operates on `amount_cents` from the DB, not hardcoded values
- **All downstream consumers** (emails, PDFs, customer portal, admin UI) read from DB milestones -- they reflect whatever percentages were used at generation time

