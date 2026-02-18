

## Fix: Clarify Payment Amount in Admin Record Payment View

### Edge Case Review (Requested)

**Deposit already met**: The PaymentRecorder waterfall logic skips fully-satisfied milestones. If the 10% deposit is paid, the "Deposit" button either shows the next milestone (e.g., "Milestone Payment 40%") or hides entirely when `depositAmount === 0`. The Stripe line item label follows `payment_type`, which is set by the button the admin clicks -- so it can never say "Deposit" if no deposit is owed.

**Custom amount paid**: The webhook milestone skip guard prevents custom payments from auto-matching milestones. The Stripe line item will say "Partial Payment" and the "Charging" badge will show the exact custom dollar amount. No ambiguity.

Both cases are handled correctly because the labels mirror the existing amount selector logic.

### Changes (2 files)

**1. `supabase/functions/create-checkout-session/index.ts` (line 201) -- Descriptive Stripe line item name**

Replace the vague "Payment" / "Deposit" label with a specific payment type:

```
BEFORE: Soul Train's Eatery LLC - Super Bowl Test (Payment)
AFTER:  Super Bowl Test - Full Balance Payment
        Super Bowl Test - Deposit
        Super Bowl Test - Partial Payment
```

Code change at line 201:
```typescript
name: `${invoice.quote_requests?.event_name || 'Catering Event'} - ${
  payment_type === 'full' ? 'Full Balance Payment'
  : payment_type === 'deposit' ? 'Deposit'
  : payment_type === 'custom' ? 'Partial Payment'
  : 'Payment'
}`,
```

**2. `src/components/admin/billing/PaymentRecorder.tsx` -- Add "Charging" badge above embedded checkout**

Insert a small highlighted bar between the amount selector and the Stripe card form so the admin always sees the exact amount about to be charged:

```typescript
<div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
  <span className="text-xs text-muted-foreground">Charging</span>
  <span className="text-sm font-semibold text-primary">
    {formatCurrency(getStripeAmount())}
  </span>
</div>
```

### What Does NOT Change

- Payment amounts (already correct based on selector)
- Webhook milestone skip guard for custom payments
- Waterfall logic for deposit/milestone calculation
- Manual payment tab
- Any other edge functions

