# Edge-Case Hardening — Approved Subset

Implementing fixes #1, #2 (message-only), #3, #4, #5, #6. None change the happy path; all are either pure additions, completing an existing pattern, or replacing a silent failure with a logged/visible one.

---

## 1. Public quote form → use `anonSupabase`
**File:** `src/components/quote/SinglePageQuoteForm.tsx`
- Change the import from `@/integrations/supabase/client` to `@/integrations/supabase/anonymousClient` for the two `functions.invoke` calls (`submit-quote-request`, `log-submission-failure`).
- Keep the regular `supabase` import only if used elsewhere in the file (e.g., draft persistence). Otherwise replace fully.
- **Impact:** Stale admin/customer JWTs no longer attached to anonymous form submissions. Zero change for clean-session visitors.

## 2. Clearer "deposit already satisfied" message (no behavior change)
**File:** `supabase/functions/create-checkout-session/index.ts` (lines 144–150)
- Keep returning `400 DEPOSIT_SATISFIED` — do **not** auto-fall-through to next milestone.
- Improve the error payload so the UI can show a useful message:
  ```
  { error: "Your deposit is already paid. Use the 'Pay Next Milestone' or 'Pay Full Balance' option to continue.", code: "DEPOSIT_SATISFIED", balance_remaining: <cents> }
  ```
- **Customer portal toast handler** (`src/hooks/usePaymentCheckout.ts`): detect `code === 'DEPOSIT_SATISFIED'` and surface the human message instead of generic "Payment Error."
- **Impact:** Same payment behavior; customer just sees a helpful nudge instead of a generic error.

## 3. Audit SMTP callers (read-only)
- `rg "send-smtp-email" supabase/functions/` and confirm every caller's inner Supabase client uses `SUPABASE_SERVICE_ROLE_KEY`. If any caller uses the anon key for the `functions.invoke('send-smtp-email')` step, fix that one caller only.
- **Impact:** None unless a broken caller is found, in which case fixing it restores email that's currently silently failing.

## 4. Log email failures to `submission_failures`
**File:** `supabase/functions/submit-quote-request/index.ts` (after `Promise.all` of email invocations)
- When `send-quote-confirmation` or `send-quote-notification` returns `{ ok: false }`, write a row to `submission_failures` with `failure_stage: 'post_submit_email_failed'`, `email`, `quote_id`, and the error message.
- Customer response unchanged (still `{ success: true, quote_id }`).
- **Impact:** Admins see failed confirmation emails in the existing Submission Failures dashboard and can manually resend.

## 5. Subject-line empty fallback
**File:** `supabase/functions/send-smtp-email/index.ts` (line 218)
- After `subject.replace(/[^\x00-\x7F]/g, '').trim()`, if the result is empty, fall back to `"Soul Train's Eatery — Update"` and log a warning to `analytics_events`.
- **Impact:** Eliminates a silent SMTP error class. Cannot affect any currently-working email.

## 6. Log rate-limit hits to `submission_failures`
**File:** `supabase/functions/submit-quote-request/index.ts` (rate limit branch, line ~103)
- Before returning the 429, insert a row in `submission_failures` with `failure_stage: 'rate_limited'`, the email, and the requested event details (so admin can manually contact the planner).
- 429 response to the user is unchanged.
- Cap stays at 3/hour.
- **Impact:** Admin gains visibility into rate-limited leads. Customer experience unchanged.

---

## Why none of this breaks intended functionality

| Fix | Type | Affects happy path? |
|-----|------|---------------------|
| #1 | Client import swap (same key) | No |
| #2 | Error message + UI toast text | No |
| #3 | Read-only audit | No |
| #4 | Insert row on failure | No |
| #5 | Fallback when subject is empty | No |
| #6 | Insert row on 429 | No |

No DB migrations. No status transitions changed. No email content changed. No payment amount logic changed.

**Reply "approved" to implement.**
