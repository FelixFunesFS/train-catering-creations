

## Fix: PaymentSuccess Page Shows "Fully Paid" Incorrectly

### Root Cause

There are **two issues** causing this:

**Issue 1 (Primary): The published site has old code**

When the embedded Stripe checkout completes, the `return_url` in the edge function (line 198 of `create-checkout-session/index.ts`) redirects to:
```
https://www.soultrainseatery.com/payment-success?session_id=...&token=...&type=custom
```

This is the **published** site, which has an older version of `PaymentSuccess.tsx` that does NOT have the tier logic (fully paid vs deposit vs milestone). The old code likely always shows "Your event is fully paid and confirmed" regardless of what `verify-payment` returns.

The test/preview environment has the correct code, but it was never published.

**Issue 2 (Code Bug): Loading state initializes as `false`**

Line 27: `const [loading, setLoading] = useState(false);`

When `PaymentSuccess` mounts with a `session_id` in the URL, it renders immediately with `loading = false` and `paymentDetails = null` before `verifyPayment()` sets `loading = true`. This causes a brief flash of incorrect content. The page should show a loading spinner immediately when a session_id is present.

### The Fix

**1. Fix the loading state initialization in `PaymentSuccess.tsx`**

Change `useState(false)` to `useState(!!sessionId)` -- but since `sessionId` comes from hooks, we need to initialize based on URL params:

```typescript
const [loading, setLoading] = useState(true); // Start true, set false when done or no session
```

Then in the useEffect, if there's no sessionId, set loading to false. This prevents the flash of wrong content.

**2. Publish the site**

After fixing the loading state, the site needs to be published so the live `soultrainseatery.com` domain serves the updated PaymentSuccess page with the correct tier logic.

### What the verify-payment Edge Function Returns (Already Correct)

The logs confirm the backend works properly:
```
Payment verification: { totalPaid: 5433, invoiceTotal: 40330, isFullyPaid: false }
Invoice marked as partially_paid
```

It returns `is_fully_paid: false` and `payment_type: 'custom'`. The frontend tier logic (lines 100-106) correctly handles this:
- `isFullyPaid = false` -- won't show "fully paid"
- `effectivePaymentType = 'custom'` -- won't match 'deposit'
- `isMilestoneOrOther = true` -- shows "Your payment has been received" (correct)

The code IS correct in the test environment. The customer just never sees it because they're redirected to the published site.

### Changes

**File: `src/pages/PaymentSuccess.tsx`**

- Line 27: Change `useState(false)` to `useState(true)` so the spinner shows immediately
- Line 37: Keep `setLoading(false)` in the else branch (no session_id case)

This is a 1-line change. The rest of the tier logic is already correct.

### After This Fix

1. Apply the loading state fix (1 line)
2. **Publish the site** -- this is the critical step. Without publishing, customers will continue seeing the old PaymentSuccess page on soultrainseatery.com

### No Other Workflows Affected

- The verify-payment edge function is already deployed and returning correct data
- The tier display logic (lines 100-106, 152-181) is already correct
- The remaining balance display (lines 133-140) is already correct
- No database, Stripe, or email changes needed

