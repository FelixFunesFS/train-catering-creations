

# Complete Email Emoji Removal Plan

## Root Cause Confirmed

The `denomailer` library **double-encodes** subjects:
1. We pre-encode: `=?utf-8?B?...?=`
2. Library sees special characters (`=`, `?`) and encodes again
3. Result: `=?utf-8?Q?=3d?utf-8?B?...` (completely broken)

**Solution**: Remove emojis from ALL subject lines and revert the encoding function.

---

## Files to Modify

### 1. `supabase/functions/send-smtp-email/index.ts`

**Remove the `encodeSubjectRFC2047()` function** (lines 96-118) and revert to plain subject pass-through (line 239).

```typescript
// Before:
subject: encodeSubjectRFC2047(subject),

// After:
subject: subject,
```

---

### 2. `supabase/functions/send-quote-notification/index.ts` (Line 231)

**Admin notification for new quotes**

| Before | After |
|--------|-------|
| `🚂 NEW QUOTE from ${name} - ${event}` | `[NEW QUOTE] ${name} - ${event}` |

---

### 3. `supabase/functions/send-admin-notification/index.ts`

**All admin notification types** (Lines 119, 156, 192, 226, 257)

| Type | Before | After |
|------|--------|-------|
| customer_approval | `✅ Customer Approved: ${event}` | `[APPROVED] ${event}` |
| change_request | `📝 Change Request: ${event}` | `[CHANGE REQUEST] ${event}` |
| payment_received | `💰 Payment Received: ${event}` | `[PAYMENT] ${event}` |
| payment_failed | `❌ Payment Failed: ${event}` | `[PAYMENT FAILED] ${event}` |
| default | `🔔 Notification: ${event}` | `[NOTIFICATION] ${event}` |

---

### 4. `supabase/functions/send-payment-reminder/index.ts`

**Customer payment reminders** (Lines 72, 79, 86, 92)

| Type | Before | After |
|------|--------|-------|
| Overdue | `⚠️ URGENT: Payment Overdue - ${event}` | `URGENT: Payment Overdue - ${event}` |
| Deposit | `🔒 Secure Your Date - Deposit Due for ${event}` | `Secure Your Date - Deposit Due for ${event}` |
| Final | `✅ Final Payment Due - ${event}` | `Final Payment Due - ${event}` |
| Milestone | `💳 Milestone Payment Due - ${event}` | `Payment Due - ${event}` |

---

## What Stays Unchanged

### Hero Badges (HTML Body)
These emojis are **safe** - they're in HTML which handles UTF-8 correctly:
- `🚂 NEW QUOTE` badge in hero section
- `✅ APPROVED` badge in hero section
- `💰 PAYMENT RECEIVED` badge in hero section
- All other badge text in email bodies

The HTML body is already minified and encoded correctly. Only subject lines need changes.

### Other Email Functions (No Emoji Subjects)
These already use ASCII-only subjects and need no changes:
- `send-quote-confirmation/index.ts` - Customer confirmation
- `unified-reminder-system/index.ts` - Event reminders (7-day, 2-day, thank you)
- `send-event-followup/index.ts` - Post-event follow-up
- `send-manual-email/index.ts` - Admin manual emails
- `send-status-notification/index.ts` - Status updates

---

## Why This Will Work

| Before (Broken) | After (Fixed) |
|-----------------|---------------|
| `🚂 NEW QUOTE from John - Wedding` | `[NEW QUOTE] John - Wedding` |
| Contains emoji → Library encodes → Double-encoding | Pure ASCII → No encoding needed → Clean delivery |

The brackets `[NEW QUOTE]` provide similar visual distinction to emojis while being 100% ASCII-safe.

---

## Summary of Changes

| File | Lines Changed | Change Type |
|------|---------------|-------------|
| `send-smtp-email/index.ts` | 96-118, 239 | Remove encoding function, revert to plain subject |
| `send-quote-notification/index.ts` | 231 | Remove 🚂 emoji from subject |
| `send-admin-notification/index.ts` | 119, 156, 192, 226, 257 | Remove ✅📝💰❌🔔 emojis from subjects |
| `send-payment-reminder/index.ts` | 72, 79, 86, 92 | Remove ⚠️🔒✅💳 emojis from subjects |

**Total: 4 files, ~13 line changes**

---

## Testing After Deployment

1. Resend the Angela Powell admin notification
2. Verify subject displays as: `[NEW QUOTE] Msgt Angela Powell - Arhs Afjrotc Military Ball`
3. Verify email body still shows emoji badges correctly
4. Test a customer payment reminder to ensure no issues

