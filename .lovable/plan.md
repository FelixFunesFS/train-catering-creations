

## Problem

The quote `workflow_status` is set to `'estimated'` in **two places** that fire **before** the estimate is emailed:

1. **`generate-invoice-from-quote/index.ts` (line 407)** — Sets `workflow_status = 'estimated'` when the draft invoice is created (no email sent yet)
2. **`update-quote-workflow/index.ts` (line 63)** — Sets `workflow_status = 'estimated'` on the `create_estimate` action (also before email)

Meanwhile, the database trigger `sync_invoice_to_quote_workflow` correctly maps invoice `'sent'` → quote `'estimated'`. So the trigger would handle the transition properly if those two premature assignments were fixed.

The correct flow should be:
- **Invoice generated (draft)** → quote stays `under_review` (not `estimated`)
- **Estimate emailed to customer** → invoice becomes `'sent'` → trigger sets quote to `'estimated'`

## Plan (2 changes, no UI changes needed)

### 1. Fix `generate-invoice-from-quote/index.ts` (line 407)

Change `workflow_status: 'estimated'` to `workflow_status: 'under_review'`. This keeps the quote in review until the estimate is actually emailed. The `sync_invoice_to_quote_workflow` trigger will automatically move it to `'estimated'` when the invoice status becomes `'sent'`.

### 2. Fix `update-quote-workflow/index.ts` (line 63)

Change `workflow_status: 'estimated'` to `workflow_status: 'under_review'` for the `create_estimate` action. Same rationale — creating an estimate draft shouldn't mark it as estimated until it's sent.

### What does NOT change

- The `sync_invoice_to_quote_workflow` DB trigger already handles `sent` → `estimated` correctly
- The EventList display logic, status labels, and colors remain the same
- The email sending flow (useEstimateActions → send-invoice-email) already updates invoice to `'sent'`, which triggers the quote sync
- No schema or UI changes needed

### Why this is safe

- Events that already have `workflow_status = 'estimated'` AND have been emailed remain correct (their invoice is already `'sent'`)
- Events like "Lyonia" that were prematurely set to `'estimated'` without being emailed would need a one-time data fix (manual status correction in admin or a quick SQL update)

