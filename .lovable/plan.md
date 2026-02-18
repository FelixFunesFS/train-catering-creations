

## Fix Milestone Corruption and Prevent Future Issues

### What needs manual action after deploy

Only **Super Bowl Test (INV-2026-0197)** has corrupted data. After deploying, click the **Regenerate** button on its payment schedule in the admin panel. No other events are affected.

**Why it's corrupted:** Two $5.00 custom payments triggered the fallback logic in `verify-payment` and `stripe-webhook`, which marked the $161.32 MILESTONE as "paid" even though only $5.00 was received.

### Changes (4 files)

**1. `supabase/functions/stripe-webhook/index.ts` -- Remove dangerous fallback**

In the milestone-marking section, remove the `|| milestones[0]` fallback that marks the first pending milestone regardless of amount match. Add a guard to skip milestone marking for custom payments entirely.

Before:
```
const match = milestones.find(m => m.amount_cents === amount) || milestones[0];
```

After:
```
if (paymentType !== 'custom') {
  const exactMatch = milestones.find(m => m.amount_cents === amount);
  if (exactMatch) {
    // mark as paid
  } else {
    logStep("No exact milestone match, skipping direct marking");
  }
}
```

**2. `supabase/functions/verify-payment/index.ts` -- Same fix**

Same pattern: add custom payment guard and remove `|| milestones[0]` fallback on line ~107. The scoped variables (`isFullyPaid`, `totalPaid`, `invoiceData`) also need to be hoisted so they are accessible in the response body (currently they are block-scoped inside the `if` block but referenced in the return statement -- this is an existing bug that causes undefined values in the response).

**3. `src/utils/paymentFormatters.ts` -- Case-insensitive label lookup**

The database stores milestone types as uppercase (DEPOSIT, MILESTONE, FINAL) but the label map uses lowercase keys. Add `.toLowerCase()` before lookup:

```typescript
export const getMilestoneLabel = (type: string): string => {
  const labels: Record<string, string> = { ... };
  return labels[type.toLowerCase()] || type.replace('_', ' ');
};
```

**4. `src/components/admin/mobile/MobileEstimateView.tsx` -- Same case fix**

The local `formatMilestoneType` switch statement uses lowercase cases but receives uppercase values. Normalize with `.toLowerCase()` before the switch.

### Deploy order

1. Fix and deploy `stripe-webhook` and `verify-payment` edge functions
2. Apply the two frontend label fixes
3. Click **Regenerate** on Super Bowl Test's payment schedule in admin

### After the fix

| Event | Action Needed |
|-------|--------------|
| Super Bowl Test | Click Regenerate button |
| All other events | No action needed |

### What does NOT change

- `generate-payment-milestones` (already correct -- derives from transactions)
- `create-checkout-session` (just fixed in previous change)
- Customer PaymentCard component (correct once milestone data is fixed)
- Admin PaymentScheduleSection labels (already uses uppercase keys)
- Email templates and PDF generation
- Webhook payment processing flow (only the milestone-marking fallback is removed)
