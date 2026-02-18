

## Comprehensive Payment Display Accuracy Fix

### Summary of All Issues

Six issues identified across emails, PDF, and print view. The plan ensures milestone labels are human-readable everywhere and remaining balances use authoritative transaction-based totals.

---

### Issue 1: Payment Received Email -- Wrong Remaining Balance (CRITICAL)

**Where:** `emailTemplates.ts` lines 1956-1958

The customer "payment received" email calculates remaining balance by summing unpaid milestones. For custom payments that don't mark any milestone as paid, this shows the full invoice amount as remaining instead of the correct reduced balance.

**Additionally:** `send-customer-portal-email/index.ts` does NOT fetch milestones or totalPaid for `payment_confirmation` type (line 139 only fetches milestones for approval, estimate, reminder; line 150 only fetches totalPaid for reminder). So the template receives empty milestones and zero totalPaid.

**Fix:**
- In `send-customer-portal-email/index.ts`: Add `payment_confirmation` to the milestone fetch condition (line 139) and totalPaid fetch condition (line 150)
- In `emailTemplates.ts`: Replace the milestone-based remaining calc with `invoice.total_amount - totalPaid` (where totalPaid comes from context)
- In `stripe-webhook/index.ts`: Pass `totalPaid` in the email metadata so it's available even before the edge function queries it

---

### Issue 2: Admin Payment Email -- Wrong Remaining Balance

**Where:** `emailTemplates.ts` line 2060

The admin "payment received" email shows: `Remaining = total_amount - current_payment_amount`. This only subtracts the current payment, not the cumulative total. A second $5 payment shows remaining as $398.30 instead of $352.97.

**Fix:** Use cumulative totalPaid: `Remaining = total_amount - totalPaid`. The totalPaid value will be passed through the same metadata fix from Issue 1.

---

### Issue 3: Estimate Ready Email -- Raw Milestone Labels

**Where:** `emailTemplates.ts` line 1789

Displays `(m.milestone_type || 'payment').replaceAll('_', ' ')` which renders "DEPOSIT", "MILESTONE", "FINAL" in uppercase with no friendly mapping.

**Fix:** Create a shared `formatMilestoneLabel()` function at the top of `emailTemplates.ts` with case-insensitive lookup. Use it here and in all other email milestone displays.

---

### Issue 4: Approval Confirmation Email -- Label Map Mismatch

**Where:** `emailTemplates.ts` lines 1840-1848

Local `getMilestoneLabel` has lowercase keys (booking_deposit, deposit, mid_payment, etc.) that don't match the database values (DEPOSIT, MILESTONE, FINAL). Falls through to raw string display.

**Fix:** Replace with the shared `formatMilestoneLabel()` that normalizes to lowercase before lookup.

---

### Issue 5: PDF -- Label Map Mismatch

**Where:** `generate-invoice-pdf/index.ts` lines 162-172

`formatMilestoneType` has keys like `booking_deposit`, `midpoint`, `full_payment` -- none match the actual DB values (DEPOSIT, MILESTONE, FINAL). Fallback capitalizes each word but doesn't map to friendly names, so "DEPOSIT" stays as "Deposit" (acceptable) but "MILESTONE" becomes "Milestone" (should be "Milestone Payment").

**Fix:** Update the keys to match actual DB values with case-insensitive lookup: DEPOSIT -> "Booking Deposit", MILESTONE -> "Milestone Payment", FINAL -> "Final Balance", FULL -> "Full Payment", COMBINED -> "Booking Deposit".

---

### Issue 6: Print View -- Raw milestone_type with No Label Map

**Where:** `EstimatePrintView.tsx` line 345

Uses `milestone.milestone_type.replace('_', ' ')` with CSS `capitalize`. "DEPOSIT" renders as "Deposit" (ok), but "MILESTONE" renders as "Milestone" (missing "Payment" suffix).

**Fix:** Import and use `getMilestoneLabel` from `paymentFormatters.ts` instead of raw string manipulation.

---

### Changes by File

**1. `supabase/functions/_shared/emailTemplates.ts`**

- Add a shared `formatMilestoneLabel(type: string)` near the top (alongside existing `formatCurrency`, `formatDate` helpers). Keys: deposit, combined -> "Booking Deposit"; milestone -> "Milestone Payment"; final, balance -> "Final Balance"; full -> "Full Payment".
- **Line 1789** (estimate_ready): Replace `.replaceAll('_', ' ')` with `formatMilestoneLabel(m.milestone_type)`
- **Lines 1840-1848** (approval_confirmation): Replace local `getMilestoneLabel` with shared `formatMilestoneLabel`
- **Lines 1956-1958** (payment_received customer): Replace `remainingMilestones.reduce(...)` with `(invoice?.total_amount || 0) - (context as any).totalPaid` to use transaction-based remaining
- **Line 2060** (payment_received admin): Replace `(invoice?.total_amount || 0) - amount` with `(invoice?.total_amount || 0) - totalPaid` where totalPaid comes from context
- **Line 2115** (payment_reminder): Replace `m.description || m.milestone_type || 'Payment'` with `m.description || formatMilestoneLabel(m.milestone_type) || 'Payment'`

**2. `supabase/functions/send-customer-portal-email/index.ts`**

- **Line 139**: Add `'payment_confirmation'` to the condition that fetches milestones (change from `type === 'approval_confirmation' || type === 'estimate_ready' || type === 'payment_reminder'` to also include `type === 'payment_confirmation'`)
- **Line 150**: Add `'payment_confirmation'` to the condition that fetches totalPaid from transactions

**3. `supabase/functions/stripe-webhook/index.ts`**

- **Lines 226-231** (full payment email metadata): Add `totalPaid` to the metadata object
- **Lines 256-260** (partial payment email metadata): Add `totalPaid` to the metadata object
- **Lines 210-213** (admin notification full): Add `totalPaid` to metadata
- **Lines 274-278** (admin notification partial): Add `totalPaid` to metadata

**4. `supabase/functions/generate-invoice-pdf/index.ts`**

- **Lines 162-172**: Update `formatMilestoneType` to normalize input with `.toLowerCase()` and add correct keys: deposit -> "Booking Deposit", combined -> "Booking Deposit", milestone -> "Milestone Payment", balance/final -> "Final Balance", full -> "Full Payment"

**5. `src/pages/EstimatePrintView.tsx`**

- **Line 1**: Import `getMilestoneLabel` from `@/utils/paymentFormatters`
- **Line 345**: Replace `milestone.milestone_type.replace('_', ' ')` with `getMilestoneLabel(milestone.milestone_type)`

---

### Deploy Order

1. Update `emailTemplates.ts` (shared label function + remaining balance fixes)
2. Update `send-customer-portal-email/index.ts` (fetch milestones + totalPaid for payment confirmations)
3. Update `stripe-webhook/index.ts` (pass totalPaid in email metadata)
4. Update `generate-invoice-pdf/index.ts` (fix label map)
5. Update `EstimatePrintView.tsx` (use shared label function)
6. Deploy edge functions: stripe-webhook, send-customer-portal-email, generate-invoice-pdf

### What Does NOT Change

- Customer portal PaymentCard (already fixed with transaction-based progress from RPC)
- Admin PaymentScheduleSection (already correct -- uppercase keys, transaction history display)
- Payment Success page (already uses verify-payment response)
- Milestone generation/waterfall logic (already correct)
- Checkout session creation (already fixed)
- Payment reminder emails (already use transaction-based totalPaid from context -- line 2069)

### Risk Assessment

All changes are additive or replace incorrect calculations with correct ones. No workflow logic changes. No database schema changes. The only behavioral change is that payment confirmation emails will now show accurate remaining balances instead of milestone-derived ones.
