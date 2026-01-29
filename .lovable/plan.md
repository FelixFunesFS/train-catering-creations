
# FAQ and Terms Consistency Fix

## Summary

This plan addresses inconsistencies between the FAQ page and the official Terms & Conditions (the single source of truth in `supabase/functions/_shared/termsAndConditions.ts`). We will update the FAQs to align with actual business terms and remove discontinued services.

---

## Discrepancies Found

| Location | Current (Wrong) | Correct (From Terms) |
|----------|-----------------|----------------------|
| FAQ: Payment Terms | "25% deposit, balance due 48 hours before" | "10% deposit + 50% @ 30 days + 40% @ 14 days" |
| FAQ: Quote Validity | "30 days" | "7 days" (standard) |
| FAQ: Cancellation | "$50 fee, 50% of deposit, full deposit" | "Deposit forfeited, 50% of total, 100% of total" |
| FAQ: Military Discount | "10% discount offered" | **Remove entirely** |
| FAQ: Alcohol Service | "Beverage service through partners" | **Remove entirely** |
| TermsConditions.tsx | Different cancellation tiers | Align with official terms |

---

## Files to Modify

### 1. `src/data/faqData.ts`

**Changes:**

1. **Remove "military-discounts" FAQ entirely** (lines 101-107)
   - User requested removal of the 10% discount mention

2. **Remove "alcohol-service" FAQ entirely** (lines 138-144)
   - User requested removal of this service

3. **Update "payment-terms" FAQ** (lines 154-160)
   - Change from: "25% deposit to secure your date, with balance due 48 hours before"
   - Change to: "A 10% deposit secures your date. 50% is due 30 days before your event, with the final 40% due 14 days before. We accept cash, check, credit/debit cards, ACH bank transfer, Venmo, and Zelle. A 3% processing fee applies to credit card payments over $1,000."

4. **Update "quote-validity" FAQ** (lines 169-174)
   - Change from: "Quotes are valid for 30 days"
   - Change to: "Quotes are valid for 7 days from the date issued. For events within 30 days, validity may be shorter due to market conditions. We recommend securing your booking promptly. We'll honor quoted prices once your deposit is received."

5. **Update "cancellation-policy" FAQ** (lines 208-213)
   - Change from: "$50 processing fee, 50% of deposit, full deposit forfeited"
   - Change to: "Cancellations 14+ days before event: Deposit forfeited only. Cancellations 8-14 days before: 50% of total amount forfeited. Cancellations within 7 days: 100% of total amount forfeited. One complimentary reschedule is allowed per booking (subject to availability)."

---

### 2. `src/pages/TermsConditions.tsx`

**Update Cancellation Policy section** (lines 107-118) to match official terms:

- Change from:
  - "30+ days: Full refund minus processing fees"
  - "14-29 days: 50% refund of total contract"
  - "Less than 14 days: No refund, full payment due"

- Change to:
  - "14+ days before event: Deposit forfeited only"
  - "8-14 days before event: 50% of total amount forfeited"
  - "Within 7 days of event: 100% of total amount forfeited"
  - "Rescheduling: One complimentary reschedule per booking (14+ days notice required)"

---

## Before/After Summary

### FAQs Removed:
- "Do you offer military discounts?" - DELETED
- "Do you provide alcohol service?" - DELETED

### FAQs Updated:

| FAQ | Before | After |
|-----|--------|-------|
| Payment Terms | 25% deposit, balance 48 hrs before | 10%/50%/40% tiered schedule |
| Quote Validity | 30 days | 7 days (standard) |
| Cancellation | $50 fee, deposit forfeit | Deposit/50%/100% based on timing |

### Page Updates:
- TermsConditions.tsx cancellation policy aligned with official terms

---

## Technical Details

### File 1: `src/data/faqData.ts`

**Remove two FAQ items:**
```typescript
// DELETE lines 101-107 (military-discounts)
// DELETE lines 138-144 (alcohol-service)
```

**Update payment-terms answer:**
```typescript
answer: "We follow a tiered payment schedule: A 10% non-refundable deposit secures your date and is credited toward your final payment. 50% is due 30 days before your event, and the final 40% is due 14 days before. We accept cash, check, credit/debit cards, ACH bank transfer, Venmo, and Zelle. A 3% processing fee applies to credit card payments over $1,000.",
```

**Update quote-validity answer:**
```typescript
answer: "Quotes are valid for 7 days from the date issued. For events approaching quickly, validity may be shorter due to ingredient pricing and availability. We recommend securing your booking promptly to lock in your quoted price. Once your deposit is received, the quoted price is honored.",
```

**Update cancellation-policy answer:**
```typescript
answer: "Cancellations more than 14 days before your event forfeit the deposit only. Cancellations 8-14 days prior forfeit 50% of the total amount. Cancellations within 7 days of the event forfeit 100% of the total amount. Rescheduling requests must be made at least 14 days in advance, and one complimentary reschedule is allowed per booking, subject to availability.",
```

### File 2: `src/pages/TermsConditions.tsx`

**Update cancellation list (lines 109-113):**
```tsx
<ul className="list-disc pl-6 space-y-2">
  <li>14+ days before event: Deposit forfeited only</li>
  <li>8-14 days before event: 50% of total amount forfeited</li>
  <li>Within 7 days of event: 100% of total amount forfeited</li>
  <li>Rescheduling: One complimentary reschedule allowed per booking (14+ days notice required)</li>
</ul>
```

---

## Why This Approach is Safe

1. **Single Source of Truth**: All updates align with `termsAndConditions.ts` which is the canonical source
2. **Consistent Messaging**: Payment terms match across FAQ, Terms page, customer portal, and PDF invoices
3. **No Database Changes**: Only static content files are modified
4. **No Functionality Changes**: Just text updates to ensure accuracy

---

## Verification After Implementation

1. Visit `/faq` and verify:
   - Military discount FAQ is gone
   - Alcohol service FAQ is gone
   - Payment terms shows 10%/50%/40% schedule
   - Quote validity shows 7 days
   - Cancellation shows correct tiers

2. Visit `/terms-conditions` and verify:
   - Cancellation policy matches official terms

3. Compare with customer portal terms to confirm consistency
