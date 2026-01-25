
# Context-Aware Payment Email Messaging

## Problem Statement
Currently, all payment reminder emails use the same generic "Payment Due" title regardless of whether the customer is being asked for:
- An initial deposit to secure their event date
- A scheduled milestone payment
- The final payment before the event

This creates a missed opportunity to use compelling, action-oriented messaging that emphasizes the value of each payment stage.

## Solution Overview
Implement context-aware payment email messaging that differentiates between deposit payments, milestone payments, and final payments. The system will pass milestone context to the reminder function and dynamically adjust the email subject, hero badge, and title accordingly.

---

## Implementation Approach

### 1. Update Payment Reminder Function

Modify `supabase/functions/send-payment-reminder/index.ts` to accept milestone context and dynamically adjust messaging.

**New Request Interface:**
```typescript
interface ReminderRequest {
  invoiceId: string;
  customerEmail: string;
  customerName?: string;
  eventName?: string;
  balanceRemaining: number;
  daysOverdue: number;
  urgency: 'low' | 'medium' | 'high';
  milestoneType?: string;  // NEW: DEPOSIT, MILESTONE, FINAL, FULL
  isDueNow?: boolean;      // NEW: Is this the first payment due now?
}
```

**Dynamic Messaging Logic:**
```typescript
// Determine context-aware messaging
let subject = '';
let urgencyBadge = '';
let urgencyMessage = '';
let heroVariant: 'orange' | 'crimson' | 'gold' = 'orange';
let heroTitle = 'Payment Reminder';

if (urgency === 'high') {
  // Overdue - keep urgent messaging
  subject = `URGENT: Payment Overdue - ${eventName}`;
  urgencyBadge = `OVERDUE ${daysOverdue} DAYS`;
  heroTitle = 'Payment Overdue';
  heroVariant = 'crimson';
} else if (milestoneType === 'DEPOSIT' || isDueNow) {
  // Initial deposit - emphasize date security
  subject = `Secure Your Date - Deposit Due for ${eventName}`;
  urgencyBadge = '🔒 DEPOSIT DUE';
  heroTitle = 'Secure Your Event Date';
  heroVariant = 'gold';
  urgencyMessage = `Complete your deposit of <strong>${formatCurrency(balanceRemaining)}</strong> to lock in your event date. Our calendar fills up fast!`;
} else if (milestoneType === 'FINAL') {
  // Final payment - emphasize completion
  subject = `Final Payment Due - ${eventName}`;
  urgencyBadge = '✅ FINAL PAYMENT';
  heroTitle = 'Final Payment Due';
  urgencyMessage = `Your final payment of <strong>${formatCurrency(balanceRemaining)}</strong> is due to complete your booking.`;
} else if (milestoneType === 'MILESTONE') {
  // Mid-schedule milestone
  subject = `Milestone Payment Due - ${eventName}`;
  urgencyBadge = '💳 PAYMENT DUE';
  heroTitle = 'Scheduled Payment Due';
  urgencyMessage = `Your scheduled payment of <strong>${formatCurrency(balanceRemaining)}</strong> is due.`;
} else {
  // Default/fallback
  subject = `Payment Reminder - ${eventName}`;
  urgencyBadge = 'REMINDER';
  heroTitle = 'Payment Due';
}
```

---

### 2. Update Unified Reminder System

Modify `supabase/functions/unified-reminder-system/index.ts` to pass milestone context when invoking payment reminders.

**For milestone reminders (lines ~290-305):**
```typescript
const { error: emailError } = await supabase.functions.invoke('send-payment-reminder', {
  body: {
    invoiceId: milestone.invoice_id,
    customerEmail: email,
    customerName: milestone.invoices?.quote_requests?.contact_name,
    eventName: milestone.invoices?.quote_requests?.event_name,
    balanceRemaining: milestone.amount_cents ?? 0,
    daysOverdue: 0,
    urgency: 'medium',
    milestoneType: milestone.milestone_type,  // NEW
    isDueNow: milestone.is_due_now            // NEW
  }
});
```

---

### 3. Email Subject Line Strategy

| Scenario | Subject Line |
|----------|--------------|
| Initial Deposit | "🔒 Secure Your Date - Deposit Due for [Event Name]" |
| Milestone Payment | "💳 Milestone Payment Due - [Event Name]" |
| Final Payment | "✅ Final Payment Due - [Event Name]" |
| Overdue (any) | "⚠️ URGENT: Payment Overdue - [Event Name]" |

---

## File Changes Required

| File | Changes |
|------|---------|
| `supabase/functions/send-payment-reminder/index.ts` | Add `milestoneType` and `isDueNow` to request interface; implement context-aware subject/badge/title logic |
| `supabase/functions/unified-reminder-system/index.ts` | Pass `milestoneType` and `isDueNow` when invoking payment reminders |

---

## User Experience Impact

**Before:**
> Subject: "Payment Reminder - Johnson Wedding"
> Badge: "⏰ PAYMENT DUE"
> Title: "Payment Reminder"

**After (Deposit):**
> Subject: "🔒 Secure Your Date - Deposit Due for Johnson Wedding"
> Badge: "🔒 DEPOSIT DUE"
> Title: "Secure Your Event Date"

This creates a sense of urgency and value - customers understand they're locking in their date, not just paying a bill.

---

## Technical Notes

1. **Backward Compatibility**: If `milestoneType` is not provided, the system falls back to current generic messaging
2. **Existing Overdue Logic**: High-urgency overdue emails retain their current urgent styling
3. **No Database Changes**: All changes are in edge function logic only
4. **Milestone Types Used**: DEPOSIT, MILESTONE, FINAL, FULL (from generate-payment-milestones)
