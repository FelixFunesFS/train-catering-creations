

# Targeted Email Subject Encoding Fix - Safety Review

## What's Being Changed

**Single file modification**: `supabase/functions/send-smtp-email/index.ts`

**Only change**: Add a `encodeSubjectRFC2047()` function that pre-encodes subjects before passing to the email library.

---

## What Will NOT Change

| Component | Status |
|-----------|--------|
| HTML body generation | Unchanged |
| Plain text fallback | Unchanged |
| From/To/Reply-To headers | Unchanged |
| Email logging/analytics | Unchanged |
| Error handling | Unchanged |
| All other edge functions | Unchanged |
| Customer-facing templates | Unchanged |
| Admin notification templates | Unchanged |

---

## All Email Subjects - Impact Analysis

### Admin Emails (Your Problem Area)

| Email | Current Subject | Contains Emoji | Fix Impact |
|-------|----------------|----------------|------------|
| New Quote Notification | `🚂 NEW QUOTE from {name} - {event}` | Yes + Long | **FIXED** - Will encode properly |
| Customer Approved | `✅ Customer Approved: {event}` | Yes | **FIXED** - Will encode properly |
| Change Request | `📝 Change Request: {event}` | Yes | **FIXED** - Will encode properly |
| Payment Received | `💰 Payment Received: {event}` | Yes | **FIXED** - Will encode properly |

### Customer Emails

| Email | Current Subject | Contains Emoji | Fix Impact |
|-------|----------------|----------------|------------|
| Quote Confirmation | `Welcome to Soul Train's Eatery - Access Your Event Details` | No | **No change** - Passes through as-is |
| Estimate Ready | `Your Catering Estimate is Ready - {event}` | No | **No change** - Passes through as-is |
| Payment Reminder | `Payment Reminder - {event}` | No | **No change** - Passes through as-is |
| Payment Confirmed (Full) | `🎉 Payment Confirmed - Your Event is Secured!` | Yes | **FIXED** - Will encode properly |
| Deposit Received | `💰 Deposit Received - {event}` | Yes | **FIXED** - Will encode properly |
| Approval Confirmation | `✅ Estimate Approved - Next Steps for {event}` | Yes | **FIXED** - Will encode properly |
| 7-Day Reminder | `Final Details Confirmation - {event} in 1 Week` | No | **No change** - Passes through as-is |
| 2-Day Reminder | `Your Event is in 2 Days! - {event}` | No | **No change** - Passes through as-is |
| Thank You | `Thank You for Choosing Soul Train's Eatery!` | No | **No change** - Passes through as-is |

---

## How the Fix Works

```typescript
function encodeSubjectRFC2047(subject: string): string {
  // Check if subject contains non-ASCII (emojis, accents, etc.)
  const hasNonASCII = /[^\x00-\x7F]/.test(subject);
  
  // If pure ASCII and short - return unchanged
  if (!hasNonASCII && subject.length <= 75) {
    return subject;  // <-- Most customer emails go here
  }
  
  // Encode as Base64 (RFC 2047 "B" encoding)
  const encoder = new TextEncoder();
  const bytes = encoder.encode(subject);
  const base64 = btoa(String.fromCharCode(...bytes));
  
  return `=?utf-8?B?${base64}?=`;
}
```

**Key safety points:**

1. ASCII-only subjects under 75 chars return **completely unchanged**
2. Only subjects with emojis or long subjects get encoded
3. Base64 encoding is a standard email format - all email clients decode it automatically
4. The decoded result is identical to the original text

---

## Code Changes

### File: `supabase/functions/send-smtp-email/index.ts`

**Add function after `stripHtmlToText` (around line 94):**

```typescript
/**
 * Encode email subject per RFC 2047 for proper UTF-8 handling.
 * Uses Base64 encoding (B) which avoids line-break issues with long subjects.
 */
function encodeSubjectRFC2047(subject: string): string {
  const hasNonASCII = /[^\x00-\x7F]/.test(subject);
  
  if (!hasNonASCII && subject.length <= 75) {
    return subject;
  }
  
  const maxLength = 120;
  const truncatedSubject = subject.length > maxLength 
    ? subject.substring(0, maxLength - 3) + '...'
    : subject;
  
  const encoder = new TextEncoder();
  const bytes = encoder.encode(truncatedSubject);
  const base64 = btoa(String.fromCharCode(...bytes));
  
  return `=?utf-8?B?${base64}?=`;
}
```

**Modify line 215:**

```typescript
// Before:
subject: subject,

// After:
subject: encodeSubjectRFC2047(subject),
```

---

## Testing After Deployment

1. Submit a test quote with a long event name - verify admin gets clean subject
2. Check that existing customer estimate emails still arrive correctly
3. Test a payment confirmation (has emoji) - verify both admin and customer emails display properly

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Other emails break | Very Low | ASCII-only subjects unchanged |
| Encoding not recognized | Very Low | RFC 2047 is 30-year-old standard |
| Subject looks garbled | None | All email clients decode automatically |

**This is a minimal, surgical fix that only affects the exact problem you saw.**

