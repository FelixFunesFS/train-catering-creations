

## Final Confirmed Plan: No Additional Email Files Needed

After auditing every edge function that sends email, the plan already covers all affected files. Here is the complete audit:

### Email Functions With the Encoding Bug (3 files -- all in the plan)

| File | Line(s) | Issue |
|------|---------|-------|
| `send-quote-notification/index.ts` | 232 (subject), 235 (replyTo) | Uses `safeContactName`, `safeEventName`, `safeEmail` |
| `send-manual-email/index.ts` | 111, 144, 176 | Uses `safeEventName` in 3 subject lines |
| `process-change-request/index.ts` | 169 | Uses `escapeHtml()` directly in subject |

### Email Functions Already Using Raw Values (no fix needed)

| File | Subject Line | Status |
|------|-------------|--------|
| `send-event-followup/index.ts` | `quote.event_name` | OK |
| `send-change-request-notification/index.ts` | raw `eventName` | OK |
| `unified-reminder-system/index.ts` | raw `event.event_name` (2 emails) | OK |
| `send-status-notification/index.ts` | raw `quote.event_name` | OK |
| `send-batch-test-emails/index.ts` | raw `quote.event_name` | OK |

---

### Complete Implementation Plan (unchanged from previous review)

**Change 1: PaymentRecorder -- Default Stripe + Custom Amount**
- `src/components/admin/billing/PaymentRecorder.tsx`
- Set `defaultValue="stripe"`, add custom amount option with balance warning

**Change 2: Webhook Guard for Custom Amounts**
- `supabase/functions/stripe-webhook/index.ts`
- Guard milestone auto-match with `if (payment_type !== 'custom')`

**Change 3: Email Subject Encoding Fix (3 files)**
- `send-quote-notification/index.ts`: Raw values in subject + replyTo
- `send-manual-email/index.ts`: Raw values in 3 subject lines
- `process-change-request/index.ts`: Raw value in subject

**Change 4: Desktop Scroll Fix**
- `src/components/admin/billing/PaymentHistory.tsx`
- Increase ScrollArea to 60vh, add 85vh max-height to DialogContent

**Change 5: One-Time Data Fix (manual SQL)**
- Fix 3 stuck pending transactions for INV-2026-0204

No additional files need modification. The plan is complete.
