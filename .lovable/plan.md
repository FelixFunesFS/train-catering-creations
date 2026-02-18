

## Label Consolidation and Remaining Gaps -- Safe Implementation Plan

### Current State: Complete Audit of All 7 Label Maps

| # | Location | File | FINAL | COMBINED | Has Waterfall? |
|---|----------|------|-------|----------|----------------|
| 1 | Canonical (frontend) | `paymentFormatters.ts:33` | "Full Payment (Net 30)" | "Booking Deposit" | N/A (source) |
| 2 | Admin desktop | `PaymentScheduleSection.tsx:48` | "Final Payment" | "Combined Payment" | Yes (waterfall working) |
| 3 | Admin mobile | `MobileEstimateView.tsx:769` | "Full Payment (Net 30)" | "Booking Deposit" | **NO -- shows raw amount_cents** |
| 4 | Billing list | `PaymentList.tsx:259` | "Full Payment (Net 30)" | "Booking Deposit" | **NO -- shows raw amount_cents** |
| 5 | Email (schedule display) | `emailTemplates.ts:89` | "Final Balance" | "Booking Deposit" | No (server-side, OK) |
| 6 | Email (paid receipt) | `emailTemplates.ts:1986` | "Final Payment" | "Combined Deposit" | No (server-side, OK) |
| 7 | PDF generator | `generate-invoice-pdf/index.ts:162` | "Final Balance" | "Booking Deposit" | No (server-side, OK) |

### What Needs Fixing (4 categories)

---

**Category A: Fix the canonical label (1 line)**

`paymentFormatters.ts` line 39: `final: 'Full Payment (Net 30)'` should be `final: 'Final Balance'`

This is the single source of truth for all frontend components. Once fixed, every frontend file that imports `getMilestoneLabel` automatically gets the correct label.

**Risk: None.** Pure label text change. No logic affected.

---

**Category B: Replace duplicate frontend maps with canonical import (2 files)**

**File 1: `PaymentScheduleSection.tsx`**
- Delete `formatMilestoneType` function (lines 48-58)
- Import `getMilestoneLabel` from `@/utils/paymentFormatters`
- Replace `formatMilestoneType(milestone.milestone_type)` on line 238 with `getMilestoneLabel(milestone.milestone_type)`

**Risk: None.** The canonical `getMilestoneLabel` handles case-insensitive lookup via `.toLowerCase()`. The local `formatMilestoneType` uses uppercase keys (`'DEPOSIT'`, `'MILESTONE'`). Since `getMilestoneLabel` lowercases the input before lookup, it handles both `'DEPOSIT'` and `'deposit'` correctly. No behavior change.

**File 2: `MobileEstimateView.tsx`**
- Delete inline `getMilestoneLabel` function (lines 769-780) defined inside `.map()` callback
- Import `getMilestoneLabel` from `@/utils/paymentFormatters` at top of file
- The call on line 787 already uses `getMilestoneLabel(milestone.milestone_type)` -- no change needed

**Risk: Low.** Same case-insensitive handling applies. One subtle difference: the local version uses a `switch` statement, the canonical uses an object lookup. Both produce identical results for all known milestone types. The fallback is slightly different (local: `type.replace('_', ' ')`, canonical: `type.replace('_', ' ')`) -- identical.

---

**Category C: Fix the billing list label map (1 file)**

**`PaymentList.tsx` lines 258-265**: Replace the inline IIFE `typeMap` with imported `getMilestoneLabel`.

Current code:
```typescript
const typeMap: Record<string, string> = {
  DEPOSIT: 'Booking Deposit', COMBINED: 'Booking Deposit',
  MILESTONE: 'Milestone Payment', BALANCE: 'Final Balance',
  FULL: 'Full Payment', FINAL: 'Full Payment (Net 30)',
};
return typeMap[nextMilestone.milestone_type?.toUpperCase()] || ...
```

Replace with: `getMilestoneLabel(nextMilestone.milestone_type)`

**Risk: None.** Same labels, same fallback behavior. The canonical map handles case via `.toLowerCase()`.

---

**Category D: Fix the email paid-receipt label map (1 file, edge function)**

`emailTemplates.ts` lines 1986-1995 (`getPaidMilestoneLabel`):
- Line 1989: `'combined': 'Combined Deposit'` should be `'combined': 'Booking Deposit'`
- Line 1992: `'balance': 'Final Payment'` should be `'balance': 'Final Balance'`
- Line 1993: `'final_payment': 'Final Payment'` should be `'final_payment': 'Final Balance'`

**Risk: Low.** Only affects the label shown in payment confirmation emails (e.g., "Booking Deposit Received" instead of "Combined Deposit Received"). No logic or workflow changes.

---

### Category E: MobileEstimateView Missing Waterfall (Gap Found)

`MobileEstimateView.tsx` line 794 shows `milestone.amount_cents` -- the raw scheduled amount, not the remaining balance after partial payments. This is the same bug that was fixed in `PaymentScheduleSection.tsx` and `PaymentCard.tsx` but was missed in the mobile admin view.

**Fix:**
- Import `calculateMilestoneBalances` from `@/utils/paymentFormatters`
- Apply waterfall to milestones using the transaction-based totalPaid
- Display `remainingCents` alongside `amount_cents` when they differ

**Risk: Low.** The mobile view currently shows raw amounts. After the fix, it shows remaining amounts (same as the desktop admin view). The waterfall calculator is pure math -- no side effects.

**Workflow concern:** The mobile view doesn't currently fetch `payment_transactions` separately. It uses the `milestones` array passed from the parent. Need to check if `totalPaid` is available in the parent scope.

---

### Category F: Print View Uses Milestone-Based totalPaid (Gap Found)

`EstimatePrintView.tsx` line 339 calculates totalPaid by summing milestones with `status === 'paid'`:
```typescript
milestones.filter(m => m.status === 'paid').reduce((s, m) => s + m.amount_cents, 0)
```

This misses custom/overflow payments. For the Super Bowl Test: deposit ($40.33) is "paid" so totalPaid = $40.33, but actual totalPaid from transactions is $50.33. The remaining balances shown in the print view will be wrong.

**Fix:** Fetch `payment_transactions` for the invoice and use the sum of completed transactions. Fall back to the milestone-based calculation if no transactions are found (for admin RLS access scenarios).

**Risk: Low.** Adds one additional Supabase query to the print view page load. The print view already makes multiple queries. The RLS policy on `payment_transactions` allows admin access (ALL policy with `is_admin()`) so this will work for admin users. For customer-accessed print views (if any), the fallback to milestone-based totalPaid ensures no breakage.

---

### Workflow Impact Assessment

| Workflow | Impact | Safe? |
|----------|--------|-------|
| Customer pays via Stripe | No change -- PaymentCard already sends `remainingCents` as custom amount | Yes |
| Admin records manual payment | No change -- PaymentRecorder uses its own amount input | Yes |
| Milestone regeneration | No change -- only label display affected | Yes |
| Payment confirmation email | Label text changes ("Combined Deposit" becomes "Booking Deposit") | Yes |
| Overdue detection in PaymentList | No change -- uses `milestone_type` for grace period check, which checks for "deposit"/"booking" in lowercase. `getMilestoneLabel` is only used for display | Yes |
| Government toggle / NET 30 | No change -- schedule tier logic untouched | Yes |
| Stripe webhook processing | No change -- server-side, doesn't use frontend labels | Yes |
| PDF generation | No change -- already has correct labels | Yes |

### Files to Change (Summary)

| File | Change | Risk |
|------|--------|------|
| `src/utils/paymentFormatters.ts` | Fix `final` label to "Final Balance" | None |
| `src/components/admin/events/PaymentScheduleSection.tsx` | Delete local map, import canonical | None |
| `src/components/admin/mobile/MobileEstimateView.tsx` | Delete local map, import canonical, add waterfall display | Low |
| `src/components/admin/billing/PaymentList.tsx` | Replace inline map with canonical import | None |
| `src/pages/EstimatePrintView.tsx` | Fetch transactions for accurate totalPaid | Low |
| `supabase/functions/_shared/emailTemplates.ts` | Fix 3 labels in `getPaidMilestoneLabel` | Low |

### What Does NOT Change

- Database schema, RPC functions, triggers
- Stripe checkout/webhook flow
- Payment waterfall edge function
- Customer portal PaymentCard (already correct)
- Query key fixes (already applied in previous session)
- `formatMilestoneLabel` in emailTemplates.ts line 89 (already correct)
- PDF generator label map (already correct)

### Deploy Order

1. Fix `paymentFormatters.ts` (canonical source -- 1 line)
2. Update `PaymentScheduleSection.tsx`, `MobileEstimateView.tsx`, `PaymentList.tsx` (remove duplicates, add waterfall to mobile)
3. Fix `EstimatePrintView.tsx` (add transaction fetch)
4. Fix `emailTemplates.ts` (3 label corrections)
5. Deploy affected edge functions

