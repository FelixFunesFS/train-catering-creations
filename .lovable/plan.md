

## Final Comprehensive Fix: All Payment Accuracy Issues

### Already in Plan (Confirmed Correct)

| # | File | Fix |
|---|------|-----|
| 1 | `send-admin-notification/index.ts` | Replace hardcoded "50% Deposit" with calculated percentage and type |
| 2 | `verify-payment/index.ts` | Return `is_fully_paid`, `total_paid`, `invoice_total`, `payment_type` |
| 3 | `src/pages/PaymentSuccess.tsx` | Three-tier messaging (fully paid / deposit / milestone-custom) |
| 4 | `create-payment-link/index.ts` | Add `invoice_id` and `type` to success URL |

### Two NEW Issues Found

**Issue 5: Customer confirmation email subject always says "Deposit Received" for all partial payments**

In `send-customer-portal-email/index.ts` line 207:
```
'payment_received': is_full_payment
  ? `[CONFIRMED] Payment Received - Your Event is Secured!`
  : `[PAYMENT] Deposit Received - ${quote.event_name}`,
```

A milestone or custom payment still gets the subject "Deposit Received." This should use the actual `payment_type` from metadata to say "Payment Received" for non-deposit partials.

Fix:
```typescript
'payment_received': is_full_payment
  ? `[CONFIRMED] Payment Received - Your Event is Secured!`
  : metadata?.payment_type === 'deposit'
    ? `[PAYMENT] Deposit Received - ${quote.event_name}`
    : `[PAYMENT] Payment Received - ${quote.event_name}`,
```

---

**Issue 6: Stripe webhook hardcodes `payment_type: 'deposit'` for ALL partial payments (lines 261, 279)**

Both the customer email call (line 261) and admin notification call (line 279) hardcode `payment_type: 'deposit'` regardless of whether it was a milestone, final, or custom payment. The actual type is available in `session.metadata.payment_type`.

Fix (lines 259-263 and 277-281):
```typescript
// Customer email metadata
metadata: {
  amount: session.amount_total,
  payment_type: session.metadata?.payment_type || 'deposit',
  is_full_payment: false
}

// Admin notification metadata
metadata: {
  amount: session.amount_total,
  payment_type: session.metadata?.payment_type || 'deposit',
  full_payment: false
}
```

---

### Already Accurate (No Changes Needed)

These were reviewed and confirmed working correctly:

- **Customer confirmation email body** (`emailTemplates.ts` lines 1950-2010): Already uses milestone data to dynamically label payments ("Booking Deposit", "Milestone Payment", "Final Payment") and shows accurate remaining balance from unpaid milestones. No fix needed.
- **Payment reminder emails**: Already fixed in the previous change (unique subject + HTML fingerprint).
- **Milestone generation logic**: 10/40/50 waterfall is correct.
- **Custom payment milestone skip guard**: Correct by design.
- **Invoice status updates**: Both webhook and verify-payment correctly distinguish `paid` vs `partially_paid`.
- **AR Dashboard / Billing views**: Database-driven, already accurate.
- **Customer portal milestone display**: Reads directly from `payment_milestones` table.

---

### Complete File Change Summary

| File | Change | Risk |
|------|--------|------|
| `supabase/functions/send-admin-notification/index.ts` | Line 190: dynamic percentage label | None -- only changes display string |
| `supabase/functions/verify-payment/index.ts` | Lines 143-153: add 4 fields to response | None -- additive, no consumers break |
| `src/pages/PaymentSuccess.tsx` | Three-tier UI: fully paid / deposit / other partial | None -- graceful fallback if fields missing |
| `supabase/functions/create-payment-link/index.ts` | Line 192: add `invoice_id` and `type` to success URL | None -- PaymentSuccess already reads these params |
| `supabase/functions/stripe-webhook/index.ts` | Lines 261 + 279: pass actual `payment_type` from session metadata | None -- `session.metadata.payment_type` always set by create-checkout-session and create-payment-link; fallback to `'deposit'` |
| `supabase/functions/send-customer-portal-email/index.ts` | Line 207: subject uses payment_type for non-deposit partials | None -- only changes subject string |

### Technical Detail: Three-Tier Success Page Logic

```text
if paymentDetails.is_fully_paid:
  --> "Your event is fully paid and confirmed"
  --> Next steps: final details, menu finalization

else if paymentDetails.payment_type === 'deposit':
  --> Blue banner: "Your Event Date is Now Secured!"
  --> Next steps: service agreement, remaining balance schedule

else (milestone, custom, other):
  --> "Thank you! Your payment has been received."
  --> Shows: remaining balance = invoice_total - total_paid
  --> Next steps: updated schedule in portal, final confirmation
```

### What Does NOT Change

- Database schema (no migrations)
- Milestone generation (10/40/50 schedule)
- Custom payment milestone skip guard
- Customer confirmation email body (already accurate via milestone labels)
- Payment reminder emails (already fixed)
- PDF generation
- Approval flow emails

