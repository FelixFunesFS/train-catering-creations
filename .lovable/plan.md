

## Add Admin Button Automation Reference to UX Architecture

### Overview

The UX Architecture document covers high-level sequence flows but lacks a dedicated reference for every admin action button and the full automation chain each triggers. The `useEstimateActions` hook alone exposes 10 distinct operations, and several are undocumented. This update adds a new Section 4.10 cataloging every admin-triggered automation.

---

### What Gets Added

A new **Section 4.10: Admin Action Automation Map** inserted after Section 4.9 (Payment Processing activity diagram), before Section 5 (Structural Diagrams).

This section contains two parts:

**Part 1 — Button Automation Table**

Every admin button, where it appears, what it calls, and the full chain of side effects:

| Button | Location | Hook/Handler | Edge Function(s) | DB Side Effects | UI Feedback |
|--------|----------|-------------|-------------------|-----------------|-------------|
| Generate Estimate | EstimatePanelContent | `handleGenerateEstimate` | `generate-invoice-from-quote` | Creates invoice (draft), creates invoice_line_items from quote proteins/sides/extras JSONB, upserts customer record | Toast + panel refreshes to show line items |
| Save Changes | EstimatePanelContent | `handleSaveChanges` (useEditableInvoice) | None (direct DB) | Updates line items, triggers `recalculate_invoice_totals` DB trigger, then `force_recalculate_invoice_totals` RPC verification | Toast "Changes saved" |
| Send Estimate | EstimatePanelContent | `handleSendEstimate` | `send-customer-portal-email` | Updates invoice status to `sent`, generates `customer_access_token` if missing, sets token expiry | Toast + status badge updates |
| Resend Email | EstimatePanelContent | `handleSendEstimate` (resend mode) | `send-customer-portal-email` | Logs resend in workflow_state_log | Toast "Email resent" |
| Download PDF | EstimatePanelContent | `handleDownloadPdf` | `generate-invoice-pdf` | None (read-only) | PDF file downloads |
| Apply Discount | DiscountControls | `handleApplyDiscount` | None (direct DB) | Updates invoice discount fields, triggers total recalculation | Live total updates |
| Remove Discount | DiscountControls | `handleRemoveDiscount` | None (direct DB) | Clears discount fields, triggers total recalculation | Live total updates |
| Government Contract Toggle | EstimatePanelContent | `handleToggleGovernment` | `generate-payment-milestones` | Updates quote `is_government`, invoice `payment_schedule_type` to NET30, sets tax exempt, regenerates milestones with 30-day terms | Toast + milestone panel refreshes |
| Regenerate Milestones | PaymentMilestonePanel | `handleRegenerateMilestones` | `generate-payment-milestones` | Deletes existing unpaid milestones, creates new ones based on current total and payment type, preserves paid milestone status from payment_transactions | Toast + milestone list refreshes |
| Regenerate Line Items | EstimatePanelContent | `useRegenerateLineItems` | None (QuoteUpdateService) | Re-reads quote proteins/sides JSONB, rebuilds line items, preserves manually set prices where items match, new items get $0 | Toast "Prices preserved where possible" |
| Mark Event Completed | EventDetailsPanelContent | `handleMarkEventCompleted` | None (direct DB) | Updates quote workflow_status to `completed` | Toast + status badge updates |
| Delete Event | EventDetailsPanelContent | delete handler | None (direct DB) | Cascade deletes: quote_line_items, admin_notes, invoice_line_items, payment_milestones, invoices, quote_requests | Navigate to dashboard |
| Send Thank You | Event actions | `handleSendThankYou` | `send-event-followup` | Logs in workflow_state_log | Toast "Thank you sent" |

**Part 2 — Automation Chain Diagram**

A Mermaid flowchart showing how button actions trigger cascading automations:

```text
Admin clicks button
  |
  v
Edge Function (if any) -- creates/updates records
  |
  v
DB Trigger (recalculate_invoice_totals) -- auto-fires on line_item changes
  |
  v
RPC Verification (force_recalculate_invoice_totals) -- 200ms delay check
  |
  v
React Query invalidation -- refreshes UI caches
  |
  v
Live UI update (useMemo recalculation for totals)
```

This will be rendered as a proper Mermaid sequence diagram showing the Generate Estimate and Government Toggle flows as representative examples of the full automation chain pattern.

---

### Files Changed

| File | Action |
|------|--------|
| `docs/UX_ARCHITECTURE.md` | Insert new Section 4.10 (~120 lines) between current sections 4.9 and 5 |

No code changes. Documentation only.

