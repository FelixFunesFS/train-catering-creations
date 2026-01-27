

# Complete Email Architecture Audit & Single Source of Truth Plan

## Executive Summary

After auditing **15 email-sending edge functions**, I've identified a clear path to achieving a single source of truth. Most functions already use `generateStandardEmail()`, but several build custom content blocks inline instead of using `getEmailContentBlocks()`, and **three functions need to be either refactored or deprecated**.

---

## Current State: Complete Function Audit

### Functions Using the Correct Pattern (NO CHANGES NEEDED)

| Function | Uses generateStandardEmail | Uses getEmailContentBlocks | Status |
|----------|---------------------------|---------------------------|--------|
| `send-customer-portal-email` | Yes | Yes | **GOLD STANDARD** |
| `send-status-notification` | Yes | Yes | Good |
| `send-batch-test-emails` | Yes | Yes | Good |
| `preview-email` | Yes | Yes | Good |
| `email-qa-report` | Yes | Yes | Good |
| `send-admin-notification` | Yes | Custom (appropriate) | Good - admin emails have unique switch logic |
| `send-change-request-notification` | Yes | Custom (appropriate) | Good - status-specific content |

### Functions Needing Consolidation (REFACTOR)

| Function | Current Issue | Lines to Refactor |
|----------|--------------|-------------------|
| `send-event-followup` | Builds custom feedbackBoxHtml + reviewLinksHtml inline | Lines 89-117 |
| `send-event-reminders` | Builds custom eventDetailsHtml + checklistHtml inline | Lines 81-160 |
| `unified-reminder-system` | Builds custom content for 7-day, 2-day, and thank-you emails | Lines 348-473 |
| `send-quote-confirmation` | Builds custom nextStepsHtml + referenceHtml inline | Lines 55-98 |
| `send-quote-notification` | Builds custom menuSectionHtml + suppliesHtml + notesHtml inline | Lines 100-208 |
| `send-payment-reminder` | Builds custom urgencyBoxHtml + invoiceDetailsHtml inline | Lines 105-152 |

### Functions That Must Be Deprecated/Removed

| Function | Issue | Resolution |
|----------|-------|------------|
| `send-manual-email` | Does NOT use generateStandardEmail at all - plain HTML with no branding | DEPRECATE or REFACTOR to use shared template |
| `token-renewal-manager` | Uses inline HTML (lines 99-115) with no shared template | REFACTOR to use generateStandardEmail |

---

## Complete Change List for True Single Source of Truth

### TIER 1: Priority Fixes (Resolve Template Inconsistencies)

#### 1. `supabase/functions/_shared/emailTemplates.ts` - Lines 2005-2010

**Current (minimal):**
```typescript
case 'event_followup':
  contentBlocks = [
    { type: 'text', data: { html: `...basic text...` }},
    { type: 'menu_summary' },
  ];
  break;
```

**Updated (complete with reviews inside feedback box):**
```typescript
case 'event_followup':
  const followupFeedbackBoxHtml = `
    <div style="background:${BRAND_COLORS.lightGray};border:2px solid ${BRAND_COLORS.gold};padding:25px;border-radius:12px;margin:20px 0;text-align:center;">
      <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">We'd Love to Hear From You!</h3>
      <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;">Your feedback helps us continue serving Charleston families with the best Southern catering experience. Feel free to reply to this email or call us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:600;">(843) 970-0265</a>.</p>
      <p style="font-size:15px;margin:0 0 12px 0;"><strong>Loved our service?</strong> We'd be honored if you could leave us a review:</p>
      <div style="margin-top:12px;">
        <a href="https://g.page/r/CWyYHq7bIsWlEBM/review" style="display:inline-block;background:${BRAND_COLORS.gold};color:${BRAND_COLORS.darkGray};text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;margin:4px;">⭐ Google Review</a>
        <a href="https://www.facebook.com/soultrainseatery/reviews" style="display:inline-block;background:#1877f2;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;margin:4px;">📘 Facebook Review</a>
      </div>
    </div>
  `;

  contentBlocks = [
    { type: 'text', data: { html: `
      <p style="font-size:16px;margin:0 0 12px 0;">Thank You, ${quote.contact_name}!</p>
      <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We hope <strong>${quote.event_name}</strong> was a wonderful success and that you and your guests enjoyed the authentic Southern flavors we prepared with love.</p>
      <p style="font-size:15px;margin:0;line-height:1.6;">It was an honor to be part of your special day, and we're grateful you chose Soul Train's Eatery to serve your guests.</p>
    ` }},
    { type: 'custom_html', data: { html: followupFeedbackBoxHtml }},
    { type: 'menu_summary' },
    { type: 'text', data: { html: `
      <p style="font-size:15px;margin:20px 0 0 0;">We look forward to serving you again soon!</p>
      <p style="margin-top:20px;">
        <strong>Warm regards,</strong><br/>
        Soul Train's Eatery<br/>
        Charleston's Lowcountry Catering<br/>
        <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;">(843) 970-0265</a> | 
        <a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};text-decoration:none;">soultrainseatery@gmail.com</a>
      </p>
    ` }}
  ];
  break;
```

#### 2. `supabase/functions/send-event-followup/index.ts` - Lines 88-117

**Refactor to use shared helper:**
```typescript
import { generateStandardEmail, EMAIL_CONFIGS, getEmailContentBlocks } from '../_shared/emailTemplates.ts';

// Replace lines 88-117 with:
const { contentBlocks } = getEmailContentBlocks('event_followup', 'customer', {
  quote,
  invoice: {},
  lineItems: [],
  milestones: [],
  portalUrl: '',
});

const emailHtml = generateStandardEmail({
  preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
  heroSection: {
    ...EMAIL_CONFIGS.event_followup.customer!.heroSection,
    subtitle: quote.event_name
  },
  contentBlocks,
  quote,
});
```

#### 3. `supabase/functions/unified-reminder-system/index.ts` - Lines 458-469

**Refactor thank-you section to use shared helper:**
```typescript
const { contentBlocks } = getEmailContentBlocks('event_followup', 'customer', {
  quote: event,
  invoice: {},
  lineItems: [],
  milestones: [],
  portalUrl: '',
});

const emailHtml = generateStandardEmail({
  preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
  heroSection: {
    ...EMAIL_CONFIGS.event_followup.customer!.heroSection,
    subtitle: event.event_name
  },
  contentBlocks,
  quote: event,
});
```

---

### TIER 2: Deprecate/Refactor Legacy Functions

#### 4. `supabase/functions/send-manual-email/index.ts` - ENTIRE FILE

**Options:**
- **Option A (Recommended)**: Refactor to use `generateStandardEmail()` for consistent branding
- **Option B**: Mark as deprecated and route all manual emails through `send-customer-portal-email`

This function currently builds plain HTML (lines 96-160) with no brand consistency:
```html
<h2>Your Catering Estimate from Soul Train's Eatery</h2>
<p>Dear ${safeCustomerName},</p>
...
```

Should be refactored to use the shared template system.

#### 5. `supabase/functions/token-renewal-manager/index.ts` - Lines 99-115

**Current (inline HTML):**
```typescript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: ${urgency === 'high' ? '#dc2626' : '#ea580c'};">Access Link Expiring Soon</h2>
    ...
  </div>
`
```

**Should be refactored to use generateStandardEmail with a new email type 'token_expiring'**

---

### TIER 3: Future Consolidation (Lower Priority)

These functions build custom inline HTML but it's acceptable because the content is highly dynamic:

| Function | Custom Content | Why It's Acceptable |
|----------|----------------|---------------------|
| `send-quote-confirmation` | nextStepsHtml, referenceHtml | Quote-specific flow content |
| `send-quote-notification` | menuSectionHtml, suppliesHtml | Admin notification with raw quote data |
| `send-payment-reminder` | urgencyBoxHtml, invoiceDetailsHtml | Urgency-based dynamic content |
| `send-event-reminders` | eventDetailsHtml, checklistHtml | Day-specific reminder content |

These could eventually be consolidated but are lower priority since they use `generateStandardEmail()` for the wrapper.

---

## Files to Change (Ordered by Priority)

| Priority | File | Change Type | Lines Affected |
|----------|------|-------------|----------------|
| 1 | `_shared/emailTemplates.ts` | Update `event_followup` case | 2005-2010 |
| 2 | `send-event-followup/index.ts` | Refactor to use `getEmailContentBlocks()` | 88-117 (remove ~30 lines) |
| 3 | `unified-reminder-system/index.ts` | Refactor thank-you section | 458-469 |
| 4 | `send-manual-email/index.ts` | Refactor or deprecate | 93-160 |
| 5 | `token-renewal-manager/index.ts` | Refactor to use shared template | 99-115 |

---

## Architecture After All Changes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     emailTemplates.ts - SINGLE SOURCE OF TRUTH               │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  getEmailContentBlocks(emailType, variant, context)                    │  │
│  │                                                                        │  │
│  │  Returns: { contentBlocks, ctaButton }                                 │  │
│  │                                                                        │  │
│  │  12 Email Types:                                                       │  │
│  │  • quote_received (admin) • quote_confirmation (customer)              │  │
│  │  • estimate_ready (customer) • estimate_reminder (customer)            │  │
│  │  • approval_confirmation (customer, admin) • payment_received (both)   │  │
│  │  • payment_reminder (customer) • event_reminder (customer, admin)      │  │
│  │  • change_request_submitted (both) • change_request_response (customer)│  │
│  │  • admin_notification (admin)                                          │  │
│  │  • event_followup (customer) ← NOW WITH FEEDBACK+REVIEWS BOX           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  generateStandardEmail(config)                                         │  │
│  │                                                                        │  │
│  │  Combines: header + hero + contentBlocks + footer → branded HTML       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
    ┌───────▼───────┐           ┌────────▼────────┐          ┌────────▼────────┐
    │ PRODUCTION    │           │ TESTING         │          │ PREVIEW         │
    │               │           │                 │          │                 │
    │ • send-event- │           │ • send-batch-   │          │ • preview-email │
    │   followup    │ ◄─ SAME ─►│   test-emails   │◄─ SAME ─►│                 │
    │               │  CONTENT  │                 │  CONTENT │ • email-qa-     │
    │ • unified-    │           │                 │          │   report        │
    │   reminder-   │           │                 │          │                 │
    │   system      │           │                 │          │                 │
    │               │           │                 │          │                 │
    │ • send-       │           │                 │          │ (Admin Settings │
    │   customer-   │           │                 │          │  Email Preview) │
    │   portal-email│           │                 │          │                 │
    └───────────────┘           └─────────────────┘          └─────────────────┘
```

---

## Verification After Implementation

1. **Re-run batch test for `event_followup`:**
```json
{
  "invoiceId": "b9e5f0b4-9f01-4eb3-970e-64aa58d10520",
  "targetEmail": "envision@mkqconsulting.com",
  "typesToSend": ["event_followup"]
}
```

2. **Expected Result:**
   - Thank you message with personalization
   - Combined feedback box containing:
     - Feedback invitation text with phone link
     - Google Review button (gold)
     - Facebook Review button (blue)
   - Menu summary
   - Closing with contact links

3. **Compare with Settings Preview:**
   - Navigate to `/admin/settings` → Email Templates
   - Select "Event Follow-up" template
   - Visual should match the test email exactly

---

## Summary of What Gets Removed/Changed

| What | Action | Reason |
|------|--------|--------|
| Custom feedbackBoxHtml in `send-event-followup` | REMOVE (use shared) | Consolidation |
| Custom reviewLinksHtml in `send-event-followup` | REMOVE (use shared) | Consolidation |
| Custom thank-you content in `unified-reminder-system` | REMOVE (use shared) | Consolidation |
| Plain HTML in `send-manual-email` | REFACTOR | No branding consistency |
| Inline HTML in `token-renewal-manager` | REFACTOR | No branding consistency |

After these changes, **all customer-facing emails will use the same content blocks** defined in `emailTemplates.ts`, ensuring perfect consistency between production, batch testing, and admin preview.

