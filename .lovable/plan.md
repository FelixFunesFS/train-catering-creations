

## Enhancement: Contextual Payment Reminder Greeting Based on Payment Stage

### Current Behavior

The payment reminder email always shows:

> "Hi [Name], This is a friendly reminder about your upcoming event [Event Name]."

This is the same whether it's the very first deposit request or a follow-up on an overdue final payment.

### Proposed Change

Make the greeting message dynamic based on the payment stage, determined from the `totalPaid` and `milestones` data already available in the template:

**Stage 1 -- Deposit Due (totalPaid === 0, first milestone is deposit)**

> "Hi [Name], We're so excited to be part of your upcoming event, [Event Name]! To secure your date and lock everything in, the next step is a quick deposit. Here's a summary of what's due:"

**Stage 2 -- Mid-Payment / Milestone Due (totalPaid > 0, balance remaining)**

> "Hi [Name], Thank you for your deposit -- your event date is secured! This is a friendly reminder about the next payment for [Event Name]."

**Stage 3 -- Overdue / Final Balance**

> "Hi [Name], This is a friendly reminder about the remaining balance for [Event Name]. We want to make sure everything is set for your big day!"

### How It Works

The logic uses data already passed into the template context -- no new data fetching needed:

- `totalPaid === 0` --> Deposit stage (excited tone)
- `totalPaid > 0 && balanceDue > 0` --> Mid-payment (thank-you tone)
- All milestones have overdue dates --> Overdue (gentle urgency)

### Technical Details

**File: `supabase/functions/_shared/emailTemplates.ts` (lines 2130-2131)**

Replace the static greeting text block with a conditional that checks `totalPaid` and milestone status to select the appropriate message. The payment summary box, milestone schedule, event details, and CTA all remain unchanged.

```typescript
// Determine greeting based on payment stage
const isFirstPayment = totalPaid === 0;
const hasOverdueMilestones = milestones?.some((m: any) => 
  m.status !== 'paid' && m.due_date && new Date(m.due_date) < new Date()
);

let greetingHtml: string;
if (isFirstPayment) {
  greetingHtml = `<p>Hi ${quote.contact_name},</p>
    <p>We're so excited to be part of your upcoming event, <strong>${quote.event_name}</strong>! 
    To secure your date and lock everything in, the next step is a quick deposit. 
    Here's a summary of what's due:</p>`;
} else if (hasOverdueMilestones) {
  greetingHtml = `<p>Hi ${quote.contact_name},</p>
    <p>This is a friendly reminder about the remaining balance for 
    <strong>${quote.event_name}</strong>. We want to make sure everything 
    is set for your big day!</p>`;
} else {
  greetingHtml = `<p>Hi ${quote.contact_name},</p>
    <p>Thank you for your deposit — your event date is secured! 
    This is a friendly reminder about the next payment for 
    <strong>${quote.event_name}</strong>.</p>`;
}
```

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/emailTemplates.ts` | Replace static greeting (line 2131) with conditional greeting based on payment stage |

### What Does NOT Change

- Payment summary box, milestone schedule, event details, CTA -- all unchanged
- No new data fetching needed (uses existing `totalPaid`, `milestones`)
- No UI changes
- No status logic changes
- No other email templates affected

