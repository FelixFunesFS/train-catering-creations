# Payment clarity follow-ups + database cleanup

## Storage findings (checked live)
Total database use is small (about 27 MB). Largest items:
- Scheduled-job run history: 17 MB, 11,289 rows (grows every time a scheduled job runs)
- Visitor analytics events: 5 MB, 7,385 rows
- Quote form analytics: 1.7 MB, 2,495 rows
- Audit/status logs: under 1 MB each — keep (business history)

Nothing is urgent. Invoices, quotes, payments and audit history are not touched.

## 1. Database cleanup
- Delete scheduled-job run history older than 7 days, and add a weekly job that keeps it trimmed.
- Delete visitor and form analytics older than 12 months (reports use recent data).
- Unschedule the legacy daily token-renewal job so it stops writing repeat reminder rows.

## 2. Customer portal: calm "bank payment processing" notice
- On load, if an online payment is still processing, the payment card shows "Your bank payment is processing (3-5 business days) — no need to pay again" and hides the Pay button for that amount.

## 3. Admin alerts on main event screens
- Show the Overpaid / Possible duplicate / Payment in progress banners on desktop event detail and the mobile event view, not only in Payment History.

## 4. Abandoned checkouts expire in 1 hour
- Stripe checkout links expire after 1 hour; the expiry event marks the pending attempt as expired so it no longer blocks or clutters.

## 5. Small cleanup
- Remove unused legacy edge functions (token-renewal-manager, automated-customer-workflow, confirm-event, sync-invoice-with-quote, fix-workflow-status, workflow-orchestrator) after confirming no callers or cron jobs use them.
- Fix the 3 failing change-request tests' mocks.

## Technical details
- Cleanup via migration: `delete from cron.job_run_details where end_time < now() - interval '7 days'`; `cron.schedule` weekly purge; analytics deletes by `created_at`; `cron.unschedule` token-renewal job.
- Portal notice: reuse customer-safe payment RPC data / pending transaction status; no token logic changes.
- `expires_at = now + 3600` in create-checkout-session; handle `checkout.session.expired` in stripe-webhook.
- Reuse `src/utils/paymentAlerts.ts` in EventDetail.tsx and MobileEstimateView.tsx.
