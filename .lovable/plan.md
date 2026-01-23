
Goal
- Fix missing quote-submission emails (customer confirmation + business/admin notification) for submissions like envision@mkqconsulting.com.
- Add a reliable way to “review the most recent emails” inside the app (delivery auditing).
- Adjust the Estimate Ready (customer) email layout so the “Estimate Validity” card appears after menu selection and before the payment schedule.

What I found (root cause + why emails appear “not sent”)
1) Admin notification email is currently broken for public quote submissions
- The public form calls the `submit-quote-request` edge function.
- `submit-quote-request` invokes:
  - `send-quote-confirmation` with `{ quote_id }`  ✅ (matches expected input)
  - `send-quote-notification` with `{ quote_id }`  ❌ (BUT `send-quote-notification` currently expects the entire quote payload like `contact_name`, `email`, `event_name`, etc.)
- Result: the admin notification function can generate an email with missing data and may fail (but it returns 200 “non-critical” in many flows), so the admin inbox never receives the notification.

2) Customer confirmation may “silently fail” without a central audit trail
- `send-quote-confirmation` is explicitly “non-blocking” and returns HTTP 200 even if SMTP fails.
- That’s good UX for not blocking submission, but it makes it hard to “review what happened” later unless we log delivery attempts somewhere persistent.
- Right now there isn’t a dedicated delivery log table, and the existing edge logs don’t provide a per-recipient history you can browse in-app.

3) Estimate email content order change is straightforward
- In `_shared/emailTemplates.ts`, the `estimate_ready` customer template inserts `estimateValidityHtml` very early (right after the intro text).
- You want it moved to: after menu selection, before the payment schedule block.

Implementation plan

A) Fix admin notification email so it works with `submit-quote-request` (most important)
1) Update `supabase/functions/send-quote-notification/index.ts` to accept `{ quote_id: string }` as input (same pattern as `send-quote-confirmation`).
2) Inside the function:
- Fetch the quote record from `quote_requests` using the provided `quote_id`.
- Build the admin email using the fetched quote (and existing HTML generation), ensuring `replyTo` uses the customer’s name/email.
- Send to the business inbox (currently hardcoded `soultrainseatery@gmail.com`), and return a JSON response including:
  - `admin_email_sent: boolean`
  - `email_error?: string`
  - `quote_id`
3) Ensure the function no longer relies on “requestData.contact_name” coming from the caller.

Why this solves your problem:
- The public form can keep sending `{quote_id}` exactly as it does today.
- The admin notification becomes deterministic and consistent for every quote submission.

B) Add persistent “Email Delivery Audit” logging so you can review recent emails (customer + admin)
Goal: When you say “review the most recent emails,” we should be able to answer that with actual data, not guesses.

Approach (no schema migration required):
- Use the existing `analytics_events` table (already in your schema) to log email attempts.

1) Update `supabase/functions/send-smtp-email/index.ts` to insert a row into `analytics_events` for every send attempt:
- event_type: e.g. `email_send_attempt` and `email_send_success` / `email_send_failure`
- entity_type: `email`
- metadata: include `{ to, subject, from, ok, errorMessage?, timestamp }`
2) Log both outcomes:
- Success after `client.send(...)`
- Failure in the catch block with the sanitized error message

Why this is the best “review recent emails” foundation:
- Every single email in the system funnels through `send-smtp-email`, so you get a single source of truth for delivery attempts.
- You can later add an Admin UI page that reads `analytics_events` and filters `event_type like 'email_%'` to show a “Recent Emails” feed (recipient, subject, status, time).

C) Reorder “Estimate Validity” card in the Estimate Ready customer email
Update `supabase/functions/_shared/emailTemplates.ts` in the `case 'estimate_ready'` block:
- Current order (simplified):
  1) Intro text
  2) Estimate validity card
  3) Event details
  4) Menu with pricing
  5) Add-ons
  6) Payment schedule
  7) Action buttons
- Desired order:
  1) Intro text
  2) Event details
  3) Menu with pricing (menu selection)
  4) Add-ons (optional, but typically “part of the selection” experience)
  5) Estimate validity card
  6) Payment schedule
  7) Action buttons

D) Verification steps (we’ll do this right after changes)
1) Quote submission emails:
- Submit a new quote using the public form with:
  - Customer email: envision@mkqconsulting.com (or a test inbox you control)
- Confirm:
  - Customer receives confirmation email
  - Business receives admin notification email
2) Delivery audit:
- Check `analytics_events` for the last ~20 email events and confirm:
  - both “attempt” and “success/failure” records exist with correct `to` + `subject`
3) Estimate template content order:
- Use Email Preview (admin) for `estimate_ready` and visually confirm:
  - validity card is below the menu selection block and above payment schedule

Files that will change
- supabase/functions/send-quote-notification/index.ts
- supabase/functions/send-smtp-email/index.ts
- supabase/functions/_shared/emailTemplates.ts

Notes / edge cases we’ll handle
- Gmail recipients: If deliverability issues persist (spam/quarantine), the new audit logs will at least confirm whether SMTP accepted the send attempt and whether the function errored.
- If you want admin notifications sent to a different address than `soultrainseatery@gmail.com`, we can move that recipient into `business_config` (configurable) as a follow-up.
