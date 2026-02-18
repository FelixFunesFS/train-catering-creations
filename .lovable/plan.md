

## Complete Milestone Display Fix -- Every Remaining Gap

### Summary of What's Already Fixed vs What's Still Broken

**Already using waterfall (correct):**
- Customer portal (`PaymentCard.tsx`) -- shows remainingCents
- Admin desktop (`PaymentScheduleSection.tsx`) -- shows remainingCents
- Print view (`EstimatePrintView.tsx`) -- shows remainingCents

**Still showing raw amount_cents (broken):**

| # | Surface | File | Line | Shows | Should Show |
|---|---------|------|------|-------|-------------|
| 1 | Billing list | `PaymentList.tsx` | 262 | `$161.32` | `$151.32 remaining` |
| 2 | Admin mobile | `MobileEstimateView.tsx` | 783 | `$161.32` | `$151.32 remaining` |

**Label gaps remaining:**

| # | File | Issue |
|---|------|-------|
| 3 | `emailTemplates.ts:1986` | `getPaidMilestoneLabel` missing `'final': 'Final Balance'` key (has `final_payment` but DB stores `FINAL`) |

Emails and PDFs are point-in-time snapshots generated at send/download time, so their amounts are correct at that moment. The two admin surfaces (billing list, mobile) are live views that need the waterfall.

---

### Fix 1: PaymentList.tsx -- Apply Waterfall to Next Milestone Amount

**Current code (line 262):**
```
{formatCurrency(nextMilestone.amount_cents || 0)}
```

**Problem:** `nextMilestone` comes from `invoice.milestones` (the `invoice_payment_summary` view JSON). It's the raw scheduled amount. `invoice.total_paid` is available on the same object.

**Fix:**
- Import `calculateMilestoneBalances` from `@/utils/paymentFormatters`
- After getting `nextMilestone`, run the full milestones array through `calculateMilestoneBalances(milestones, totalPaid)` 
- Find the matching enriched milestone and display its `remainingCents`
- Show "of $X scheduled" when remaining differs from scheduled

**Data available:** `invoice.milestones` (JSON array), `invoice.total_paid` (number) -- both from the `invoice_payment_summary` view. Everything needed is already present, no new queries required.

---

### Fix 2: MobileEstimateView.tsx -- Apply Waterfall to Milestone List

**Current code (line 783):**
```
<p className="font-medium">{formatCurrency(milestone.amount_cents)}</p>
```

**Problem:** Shows raw scheduled amount for every milestone, ignoring overflow payments.

**Fix:**
- Import `calculateMilestoneBalances` from `@/utils/paymentFormatters`
- The component has access to `paymentSummary` (which contains `totalPaid` from transactions) via the parent data
- Before the `.map()` at line 769, run `calculateMilestoneBalances(milestones, totalPaid)` to get enriched milestones
- Display `remainingCents` for unpaid milestones, show "X applied" when partial payment exists

**Data check:** Need to verify `paymentSummary.totalPaid` is available in scope. The component receives `milestones` and `paymentSummary` from the parent `MobileEstimateView` props/state.

---

### Fix 3: emailTemplates.ts getPaidMilestoneLabel -- Missing 'final' Key

**Current code (line 1986-1996):**
The label map has `'final_payment': 'Final Balance'` but NOT `'final': 'Final Balance'`. The database stores milestone types as `FINAL` (not `final_payment`). So when a FINAL milestone is paid and the confirmation email is sent, `getPaidMilestoneLabel` looks up `'final'` in the map, finds nothing, and falls back to the generic "Payment" label.

**Fix:** Add `'final': 'Final Balance'` to the labels map in `getPaidMilestoneLabel`.

---

### What Does NOT Need Fixing

- **Email schedule table** (`emailTemplates.ts:2125`): Shows `m.amount_cents` -- this is correct because emails are point-in-time snapshots sent when the schedule is generated. At generation time, no overflow payments have occurred yet.
- **PDF milestone table** (`generate-invoice-pdf/index.ts:572`): Same reasoning -- PDFs are generated at a specific moment.
- **PDF label map** (`generate-invoice-pdf/index.ts:162`): Already has correct values matching the canonical map.
- **Email `formatMilestoneLabel`** (`emailTemplates.ts:89`): Already has correct values.
- **Customer portal**: Already fully fixed with waterfall.
- **Admin desktop PaymentScheduleSection**: Already fully fixed with waterfall.
- **Print view**: Already fully fixed with waterfall.

---

### Changes by File

**1. `src/components/admin/billing/PaymentList.tsx`**
- Import `calculateMilestoneBalances` from `@/utils/paymentFormatters`
- After `getNextMilestone()` call (~line 189), apply waterfall:
  - Parse milestones array, run through `calculateMilestoneBalances(parsedMilestones, totalPaid)`
  - Find the enriched version of `nextMilestone` by matching `id`
  - On line 262, display `enrichedNext.remainingCents` instead of `nextMilestone.amount_cents`
  - When remaining differs from scheduled, append context text

**2. `src/components/admin/mobile/MobileEstimateView.tsx`**
- Import `calculateMilestoneBalances` from `@/utils/paymentFormatters`
- Before the milestones `.map()` at line 769, compute enriched milestones using `calculateMilestoneBalances(milestones, paymentSummary.totalPaid)`
- In the map callback, use enriched milestone data:
  - Show `remainingCents` for unpaid milestones
  - Show "X applied" annotation when partial payment exists
  - Keep showing `amount_cents` for paid milestones (they're fully settled)

**3. `supabase/functions/_shared/emailTemplates.ts`**
- Line 1986-1996: Add `'final': 'Final Balance'` to the `getPaidMilestoneLabel` labels map (between existing `'combined'` and `'milestone'` entries)

---

### Risk Assessment

| Change | Risk | Reason |
|--------|------|--------|
| PaymentList waterfall | None | Pure display math, data already available, no new queries |
| MobileEstimateView waterfall | Low | Need to confirm `totalPaid` is available in scope; fallback to 0 if not |
| emailTemplates missing key | None | Adding one key-value pair to a lookup map |

### Workflow Impact: None

All three changes are display-only. No payment flows, Stripe integrations, database writes, or business logic are affected. The waterfall calculator is a pure function that takes milestones + totalPaid and returns enriched objects -- no side effects.

### Deploy Order

1. Fix `PaymentList.tsx` and `MobileEstimateView.tsx` (frontend, instant)
2. Fix `emailTemplates.ts` (edge function shared code)
3. Deploy edge functions that use the updated email templates
