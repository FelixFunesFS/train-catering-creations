
# Email Consistency & Data Completeness Audit - Fix Plan

## Executive Summary

After comprehensive review, I've identified **three categories of issues**:

1. **Payment Timeline Inconsistency**: "Thank You for Payment" email says "7 days before event" but the actual schedule is "14 days (2 weeks) before event"
2. **Admin Event Reminder Missing Supplies Section**: The admin variant of `event_reminder` doesn't include supplies/equipment information
3. **Milestone-Aware Messaging**: Payment confirmation doesn't dynamically reflect remaining milestones (e.g., "50% remaining" vs "40% remaining")

---

## Issue 1: Payment Timeline Mismatch

### Current State (Lines 1870-1871 in emailTemplates.ts)
```typescript
<p style="margin:5px 0 0 0;color:#666;">Remaining balance due 7 days before your event</p>
```

### Correct State (from paymentScheduling.ts)
The actual payment schedule has **three scenarios** for final payment:
- **SHORT_NOTICE (15-30 days out)**: Final 40% due **7 days before event**
- **MID_RANGE (31-44 days out)**: Final 40% due **14 days (2 weeks) before event**
- **STANDARD (45+ days out)**: Final 40% due **14 days (2 weeks) before event**

### Fix Required
The "Thank You for Payment" email should dynamically determine the correct due date based on the milestone data, not hardcode "7 days."

### Technical Change

```typescript
// In payment_received case (line 1863-1874)
// Replace static "7 days" text with dynamic milestone-based messaging

// Calculate next milestone due date from actual milestones array
const nextMilestone = milestones?.find(m => m.status !== 'paid');
const nextDueText = nextMilestone 
  ? (nextMilestone.is_net30 
      ? 'Net 30 after event' 
      : nextMilestone.due_date 
        ? formatDate(nextMilestone.due_date)
        : 'Upon completion')
  : 'Fully paid';

const remainingAmount = milestones
  ?.filter(m => m.status !== 'paid')
  .reduce((sum, m) => sum + m.amount_cents, 0) || 0;

const nextStepsHtml = `
  ${!fullPay && remainingAmount > 0 ? `
    <div style="border-bottom:1px solid #dee2e6;padding:12px 0;display:flex;align-items:flex-start;">
      <span style="font-size:24px;margin-right:12px;">💳</span>
      <div>
        <strong style="color:${BRAND_COLORS.crimson};">${nextMilestone?.description || 'Next Payment'}</strong>
        <p style="margin:5px 0 0 0;color:#666;">
          ${formatCurrency(remainingAmount)} remaining • Due ${nextDueText}
        </p>
      </div>
    </div>
  ` : ''}
  ...
`;
```

---

## Issue 2: Admin Event Reminder Missing Supplies Section

### Current State (Lines 1951-1959)
```typescript
// Admin event_reminder variant
contentBlocks = [
  { type: 'text', data: { html: `...` }},
  { type: 'customer_contact' },
  { type: 'event_details' },
  { type: 'menu_summary' },
  { type: 'service_addons' },
  // MISSING: supplies_summary
];
```

### Fix Required
Add `{ type: 'supplies_summary' }` to the admin event_reminder content blocks so admins see the full equipment/supplies list for prep.

### Technical Change
```typescript
// In event_reminder admin variant (line 1951-1959)
contentBlocks = [
  { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;"><strong>${quote.event_name}</strong> is coming up soon! Here are the event details:</p>` }},
  { type: 'customer_contact' },
  { type: 'event_details' },
  { type: 'menu_summary' },
  { type: 'service_addons' },
  { type: 'supplies_summary' }, // ADD THIS
];
```

---

## Issue 3: Milestone-Aware Payment Confirmation

### Current State (Lines 1855-1860)
```typescript
const paymentStatusHtml = fullPay ? `...` : `
  <div style="...">
    <h3>💰 Deposit Received</h3>
    <p>We've received your deposit of ${formatCurrency(amount)}</p>
    <p>Remaining balance: ${formatCurrency((invoice?.total_amount || 0) - amount)}</p>
  </div>
`;
```

### Problem
- Always says "Deposit" even if it's a milestone payment (50%) or final payment (40%)
- Remaining balance doesn't account for previously paid milestones

### Fix Required
Use the milestones array to:
1. Determine what TYPE of payment was just made (Deposit, Milestone, Final)
2. Calculate ACTUAL remaining balance from unpaid milestones
3. Show which milestone(s) remain

### Technical Change
```typescript
// Determine payment type from just-paid milestone
const getPaidMilestoneType = (milestones: any[], paymentAmount: number): string => {
  // Find the milestone that most closely matches the payment amount
  const closestMatch = milestones?.find(m => 
    m.status === 'paid' && 
    Math.abs(m.amount_cents - paymentAmount) < 100 // Within $1 tolerance
  );
  
  if (!closestMatch) return 'Payment';
  
  const labels: Record<string, string> = {
    'DEPOSIT': 'Booking Deposit',
    'deposit': 'Booking Deposit',
    'booking_deposit': 'Booking Deposit',
    'COMBINED': 'Combined Deposit',
    'combined': 'Combined Deposit',
    'MILESTONE': 'Milestone Payment',
    'milestone': 'Milestone Payment',
    'mid_payment': 'Milestone Payment',
    'BALANCE': 'Final Payment',
    'balance': 'Final Payment',
    'final_payment': 'Final Payment',
    'FULL': 'Full Payment',
    'full_payment': 'Full Payment',
  };
  
  return labels[closestMatch.milestone_type] || 'Payment';
};

// Calculate remaining from unpaid milestones (not from total - payment)
const remainingMilestones = milestones?.filter(m => m.status !== 'paid') || [];
const remainingBalance = remainingMilestones.reduce((sum, m) => sum + m.amount_cents, 0);
const paidMilestoneLabel = getPaidMilestoneType(milestones, amount);

const paymentStatusHtml = fullPay ? `
  <div style="background:linear-gradient(135deg,${BRAND_COLORS.gold}30,${BRAND_COLORS.gold}50);padding:25px;border-radius:12px;margin:20px 0;text-align:center;border:2px solid ${BRAND_COLORS.gold};">
    <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;font-size:24px;">✅ Your Event is Fully Confirmed!</h3>
    <p style="margin:0;font-size:18px;font-weight:bold;">We've received your full payment of ${formatCurrency(amount)}</p>
  </div>
` : `
  <div style="background:${BRAND_COLORS.lightGray};padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid ${BRAND_COLORS.gold};">
    <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;">💰 ${paidMilestoneLabel} Received</h3>
    <p style="margin:0;font-size:16px;">We've received your payment of ${formatCurrency(amount)}</p>
    ${remainingBalance > 0 ? `
      <p style="margin:10px 0 0 0;color:#666;">
        Remaining balance: <strong>${formatCurrency(remainingBalance)}</strong>
        ${remainingMilestones.length === 1 ? ` (Final payment)` : ` (${remainingMilestones.length} payments remaining)`}
      </p>
    ` : ''}
  </div>
`;
```

---

## Issue 4: send-event-reminders Also Missing Supplies

### Current State (send-event-reminders/index.ts)
The 7-day and 48-hour reminder emails use `{ type: 'menu_summary' }` but don't include supplies or service addons for the customer view either.

### Fix Required
Add `{ type: 'service_addons' }` and optionally `{ type: 'supplies_summary' }` to customer reminders so they know what to expect on event day.

---

## Complete Change Summary

| File | Location | Change |
|------|----------|--------|
| `_shared/emailTemplates.ts` | Lines 1855-1874 | Make payment confirmation milestone-aware with dynamic labels and remaining balance |
| `_shared/emailTemplates.ts` | Lines 1863-1874 | Replace hardcoded "7 days" with dynamic due date from milestones |
| `_shared/emailTemplates.ts` | Lines 1951-1959 | Add `supplies_summary` block to admin event_reminder |
| `send-event-reminders/index.ts` | Lines 101-112 | Add `service_addons` to 7-day customer reminder |
| `send-event-reminders/index.ts` | Lines 150-160 | Add `service_addons` to 48-hour customer reminder |

---

## Data Flow Analysis

To ensure customer details are not missing, here's the complete data that SHOULD be included in each email type:

### Customer Payment Confirmation (`payment_received`)
Current blocks:
- `text` (greeting)
- `custom_html` (payment status)
- `event_details`
- `menu_summary`
- `custom_html` (next steps)
- `text` (contact info)

**Missing**: `service_addons`, `supplies_summary`

**Recommended**: Add these blocks to remind customer what services/supplies are included with their confirmed booking.

### Admin Event Reminder (`event_reminder` admin)
Current blocks:
- `text` (event coming up)
- `customer_contact`
- `event_details`
- `menu_summary`
- `service_addons`

**Missing**: `supplies_summary`

**Required**: Admins need to see equipment checklist before event day.

### Customer Event Reminder (`event_reminder` customer)
Current blocks:
- `text` (greeting)
- `event_details`
- `menu_summary`
- `service_addons`
- `text` (contact prompt)

**Status**: Complete for customer view.

---

## Best Way to Think About This

1. **Payment amounts must come from milestones, not calculations**
   - Never calculate remaining as `total - paid`
   - Always use `SUM(unpaid_milestones.amount_cents)`
   
2. **Due dates are tier-specific**
   - SHORT_NOTICE: 7 days before
   - MID_RANGE/STANDARD: 14 days before
   - GOVERNMENT: Net 30 after event
   
3. **Every email should pass the "prep checklist" test**
   - Customer emails: Can they understand what they're getting?
   - Admin emails: Can they prepare everything for the event?
   
4. **Content blocks should be comprehensive by default**
   - When in doubt, include `menu_summary`, `service_addons`, and `supplies_summary`
   - Only omit when space is truly constrained (e.g., quick status notifications)

---

## Implementation Order

1. Fix `payment_received` to be milestone-aware (highest impact - fixes the "7 days" error)
2. Add `supplies_summary` to admin `event_reminder`
3. Add `service_addons` to `send-event-reminders` customer emails
4. Add `supplies_summary` to customer `payment_received` (nice-to-have)

---

## Testing After Implementation

Re-run batch test with invoice INV-2026-0196 for these email types:
```json
{
  "invoiceId": "b9e5f0b4-9f01-4eb3-970e-64aa58d10520",
  "targetEmail": "envision@mkqconsulting.com",
  "typesToSend": ["payment_received", "event_reminder"],
  "delayMs": 2000
}
```

Verify:
1. Payment confirmation shows correct milestone label (Deposit/Milestone/Final)
2. Remaining balance matches sum of unpaid milestones
3. Due date is accurate (not hardcoded "7 days")
4. Admin event reminder includes supplies section
5. Customer event reminder includes service add-ons
