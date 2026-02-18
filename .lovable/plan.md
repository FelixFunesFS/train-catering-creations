

## Disable Stripe Link, Fix Branding, Swap Tab Order

Three safe, low-risk changes with no downstream breakage.

### 1. Swap tab order so Stripe (Card) is first

**File:** `src/components/admin/billing/PaymentRecorder.tsx` (lines 249-258)

Move the Stripe `TabsTrigger` before the Manual `TabsTrigger`. Purely visual — `defaultValue="stripe"` already controls the active tab.

### 2. Disable Stripe Link on embedded checkout

**File:** `supabase/functions/create-checkout-session/index.ts`

Add `payment_method_options` to the session params to explicitly disable the Link email/code prompt:

```typescript
payment_method_options: {
  link: { enabled: false },
},
```

This keeps `payment_method_types: ["card"]` unchanged. The admin will only see the card entry fields — no Link codes.

### 3. Update product name branding

**File:** `supabase/functions/create-checkout-session/index.ts` (line 164)

Change the `product_data.name` to:

```
Soul Train's Eatery LLC - ${event_name || 'Catering Event'} (${payment_type === 'deposit' ? 'Deposit' : 'Payment'})
```

### Manual step (not code)

Update the bold business name shown at the top of the Stripe Checkout page in your **Stripe Dashboard**: Settings > Business > Public details > Business name. Change "Dominick Ward" to "Soul Train's Eatery LLC".

### Files changed

- `src/components/admin/billing/PaymentRecorder.tsx` — swap tab order
- `supabase/functions/create-checkout-session/index.ts` — disable Link, update product name

