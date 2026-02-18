

## Fix: Stale Pending Transactions from PaymentRecorder Auto-Trigger

### Root Cause

Every time an admin opens the "Record Payment" dialog, the PaymentRecorder auto-triggers an embedded Stripe Checkout session (lines 204-217). Each trigger calls `create-checkout-session`, which **inserts a new `payment_transactions` row with status `'pending'`** (line 229-238 of `create-checkout-session/index.ts`).

The problem is compounded by:
1. **Auto-trigger on mount** -- the dialog immediately fires a "full balance" checkout session
2. **Re-trigger on type change** -- switching between Full/Deposit/Custom creates additional sessions
3. **No cleanup** -- abandoned sessions remain as `pending` forever
4. **Amount stored is for the auto-selected type** -- defaults to `full` ($403.30), not the actual amount the admin intends to charge

The database currently shows **20 pending transactions** for a single invoice, most at $403.30 (the full balance), because the admin opened the dialog or switched payment types multiple times.

### Why This Matters

- Payment History shows a wall of "$403.30 Pending" entries that are just abandoned checkout sessions
- The `total_paid` calculations (used in summary views) correctly exclude pending, but the visual noise is confusing
- Each pending transaction is a Stripe Checkout Session that costs API calls and clutters Stripe Dashboard

### Fix (2 changes)

**1. `create-checkout-session/index.ts` -- Void previous pending transactions before creating a new one**

Before inserting a new pending transaction (line 229), find and void any existing pending transactions for the same invoice with the same Stripe payment method that never completed:

```typescript
// Before creating a new pending transaction, void stale ones from this invoice
await supabase
  .from('payment_transactions')
  .update({ status: 'voided', failed_reason: 'Superseded by new checkout session' })
  .eq('invoice_id', invoice_id)
  .eq('status', 'pending')
  .eq('payment_method', 'stripe');
```

This ensures only ONE pending Stripe transaction exists per invoice at any time.

**2. Clean up existing stale data -- one-time database cleanup**

Run a migration to void all existing orphaned pending transactions that are older than 1 hour (Stripe Checkout Sessions expire after 24h by default, but these are clearly abandoned):

```sql
UPDATE payment_transactions
SET status = 'voided',
    failed_reason = 'Stale checkout session - auto-cleaned'
WHERE status = 'pending'
  AND payment_method = 'stripe'
  AND created_at < NOW() - INTERVAL '1 hour';
```

### What This Does NOT Change

- The auto-trigger behavior itself (it provides a smooth UX for the admin)
- Payment processing logic
- Webhook handling
- Manual payment recording
- Any completed or failed transaction

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/create-checkout-session/index.ts` | Void previous pending Stripe transactions before creating new one |
| Database migration | One-time cleanup of existing stale pending transactions |

### Result

- Payment History shows only the **one active** pending transaction (if any) plus completed/failed ones
- No more wall of "$403.30 Pending" entries
- Each new checkout session cleanly replaces the previous abandoned one

