

## Fix: Prevent Outlook/Gmail Thread Trimming on Payment Reminder Emails

### Problem

Outlook's conversation view groups emails with similar subjects and collapses repeated HTML sections (header/footer) behind "..." dots. The email content IS being delivered -- it is just hidden by the email client.

### Fix (2 changes)

**1. Unique subject line without balance** (`send-customer-portal-email/index.ts`, line ~204)

Include the invoice number in the subject to break thread-matching, but omit the balance amount:

```
Before: "Payment Reminder - Uscg Chiefs Call To Initiation Acceptance Dinner"
After:  "Payment Due - INV-2025-0042 - Uscg Chiefs Call To Initiation Acceptance Dinner"
```

```typescript
'payment_reminder': `Payment Due - ${invoice.invoice_number || 'Invoice'} - ${quote.event_name}`,
```

**2. Unique HTML fingerprint per send** (`emailTemplates.ts`, line ~2145)

Add an invisible HTML comment with a unique timestamp as the first content block so the body is never identical to previous emails:

```html
<!-- ref: payment_reminder-1708234567890 -->
```

```typescript
contentBlocks = [
  { type: 'custom_html', data: { html: `<!-- ref: payment_reminder-${Date.now()} -->` }},
  { type: 'text', data: { html: greetingHtml }},
  { type: 'custom_html', data: { html: paymentSummaryHtml }},
  // ... rest unchanged
];
```

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/send-customer-portal-email/index.ts` | Subject line includes invoice number and event name (no balance) |
| `supabase/functions/_shared/emailTemplates.ts` | Add unique HTML comment as first content block |

### What Does NOT Change

- Contextual greeting logic (deposit/mid-payment/overdue) -- kept as-is
- Email layout, payment summary, milestones, CTA -- all unchanged
- No other email types affected
- No UI or database changes

