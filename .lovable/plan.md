

# Link Fixes & Thank-You Email Consolidation

## Summary

This plan updates all Google review links to the official URL, removes broken/placeholder links, and consolidates thank-you email logic to prevent duplicate customer communications.

---

## Changes Overview

| File | Change |
|------|--------|
| `src/pages/Reviews.tsx` | Update Google placeholder to official URL, fix Facebook link |
| `supabase/functions/send-event-followup/index.ts` | Update Google link, remove broken feedback CTA |
| `supabase/functions/send-event-reminders/index.ts` | Remove duplicate thank-you email section (lines 164-193) |

---

## Detailed Changes

### 1. Reviews.tsx - Fix Placeholder Links

**Lines 141 & 151**

Update the Google review link from placeholder to official:
```tsx
// Before
href="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"

// After
href="https://g.page/r/CWyYHq7bIsWlEBM/review"
```

Fix Facebook link consistency:
```tsx
// Before
href="https://facebook.com/soultrainseatery/reviews"

// After
href="https://www.facebook.com/soultrainseatery/reviews"
```

---

### 2. send-event-followup/index.ts - Update & Simplify

**Remove broken feedback link (lines 85-98)**

The `/feedback` route does not exist, causing 404 errors. Replace the feedback CTA button with a simpler text-based message:

```typescript
// Before - links to non-existent /feedback page
const feedbackLink = `${FRONTEND_URL}/feedback?token=${invoice.customer_access_token}`;
const feedbackBoxHtml = `
  ...
  <a href="${feedbackLink}" ...>Share Your Feedback</a>
  ...
`;

// After - simple text with phone link
const feedbackBoxHtml = `
  <div style="background:${BRAND_COLORS.lightGray};border:2px solid ${BRAND_COLORS.gold};padding:25px;border-radius:12px;margin:20px 0;text-align:center;">
    <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">We'd Love to Hear From You!</h3>
    <p style="margin:0;font-size:15px;line-height:1.6;">Your feedback helps us continue serving Charleston families with the best Southern catering experience. Feel free to reply to this email or call us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:600;">(843) 970-0265</a>.</p>
  </div>
`;
```

**Update Google review link (line 104)**

```typescript
// Before
href="https://www.google.com/search?q=soul+train%27s+eatery+charleston"

// After
href="https://g.page/r/CWyYHq7bIsWlEBM/review"
```

---

### 3. send-event-reminders/index.ts - Remove Duplicate Logic

**Remove lines 164-193 (Post-Event Thank You section)**

This section duplicates the functionality of `send-event-followup/index.ts`. Both currently send thank-you emails the day after an event, which could result in customers receiving two identical emails.

```typescript
// REMOVE THIS ENTIRE SECTION (lines 164-193):
// Post-Event Thank You (1 day after)
if (daysUntil === -1) {
  const thankYouHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ...
    </div>
  `;
  
  await supabaseClient.functions.invoke('send-smtp-email', {
    body: {
      to: quote.email,
      subject: `Thank You for Choosing Soul Train's Eatery! - ${quote.event_name}`,
      html: thankYouHtml
    }
  });
  
  results.push({
    quote_id: quote.id,
    event_name: quote.event_name,
    reminder_type: 'thank_you',
    status: 'sent'
  });
  continue;
}
```

**Result:** `send-event-followup/index.ts` becomes the single source of truth for post-event thank-you emails, eliminating the risk of duplicate communications.

---

## Architecture After Changes

```text
Event Day Timeline:
                                                                  
 ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
 │  7 Days Before   │   │  2 Days Before   │   │  Event Day       │
 │  send-event-     │   │  send-event-     │   │  (No automated   │
 │  reminders       │──▶│  reminders       │──▶│  emails)         │
 │  "Prep Reminder" │   │  "Final Details" │   │                  │
 └──────────────────┘   └──────────────────┘   └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  1 Day After     │
                                               │  send-event-     │
                                               │  followup        │
                                               │  "Thank You"     │
                                               │  (SINGLE SOURCE) │
                                               └──────────────────┘
```

---

## Verification Checklist

After implementation:
- All Google review buttons link to `https://g.page/r/CWyYHq7bIsWlEBM/review`
- All Facebook review buttons link to `https://www.facebook.com/soultrainseatery/reviews`
- Thank-you emails are only sent from `send-event-followup` (no duplicates)
- No broken `/feedback` links in any emails

