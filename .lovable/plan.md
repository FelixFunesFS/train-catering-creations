

## Updated Plan: Admin Guide Rewrite + CODEBASE_MAP Fix

### Overview

The approved plan correctly identified the Admin Guide needs a rewrite, but missed that `CODEBASE_MAP.md` is also significantly outdated. Both files reference components, services, and structures that no longer exist in the codebase. All other `.md` files are accurate.

---

### File 1: `docs/ADMIN_GUIDE.md` — Complete Rewrite

As already planned: rewrite to reflect the actual 3-view dashboard (Events, Billing, Settings) plus Staff route. Remove all references to the old 10-tab layout (Workflow, Pipeline, At-Risk, Today, Status, Timeline, Changes, Docs, Testing tabs).

Key sections to rewrite:
- Dashboard Overview: 3 views, not 10 tabs
- Daily Workflow: Use SubmissionsCard + EventList, not "Today" or "At-Risk" tabs
- Common Tasks: Navigate via Events view, click into event details
- Mobile Access: Bottom nav bar (Events, Billing, Staff, Settings, Logout)
- Troubleshooting: Remove "Testing tab" references, point to Settings > Email Delivery
- Tips: Remove "At-Risk panel" and "Pipeline tab" references
- Version bump to v3.0

---

### File 2: `CODEBASE_MAP.md` — Significant Updates Required

This file has multiple inaccuracies that could mislead future development:

**Admin Dashboard section (lines 162-177) — references 5 non-existent components:**
- `DashboardHome` — does not exist
- `UnifiedEventManager` — does not exist
- `FinancialHub` — does not exist
- `SettingsHub` — does not exist

Replace with actual components: `EventsView`, `PaymentList`, `NotificationPreferencesPanel`, `EmailTemplatePreview`, `EmailDeliveryPanel`

**Workflow Components section (lines 171-177) — entirely stale:**
- `UnifiedWorkflowManager` — does not exist
- `WorkflowSteps` — does not exist
- `PricingPanel` — does not exist
- `PaymentPanel` — does not exist

Replace with actual components: `EventDetailsPanelContent`, `EstimatePanelContent`, `EventChecklistPanel`, `StaffAssignmentPanel`, `ShoppingListPanel`

**Customer Portal section (lines 179-183) — wrong component names:**
- `TokenBasedCustomerPortal` — does not exist (actual: `CustomerEstimateView`)
- `EstimateApprovalWorkflow` — does not exist (actual: `CustomerActions`)

**Quote Form section (lines 185-193) — wrong component name:**
- `QuoteRequestForm` — does not exist (actual: `SinglePageQuoteForm`)

**Services section (lines 218-226) — references 2 non-existent services:**
- `PaymentScheduleService` — does not exist
- `WorkflowService` — does not exist

Remove these entries. Actual services: `EventDataService`, `PaymentDataService`, `TaxCalculationService`, `InvoiceTotalsRecalculator`, `LineItemsService`, `ChangeRequestService`, `ChangeRequestProcessor`, `EmailNotificationService`, `EstimateVersionService`, `HistoryLogger`, `MenuItemService`, `PaymentMilestoneService`, `QuoteUpdateService`

**Edge Functions section (lines 198-206) — incomplete:**
- Lists only 5 email functions; actual count is 46 edge functions

Update to show the major functional groups rather than trying to list all 46.

**"Last updated" date (line 332):** Change from December 2024 to current.

---

### All Other `.md` Files — No Changes Needed

| File | Status |
|------|--------|
| `README.md` | Already updated correctly in previous step |
| `CUSTOMER_DISPLAY_CHECKLIST.md` | Accurate, references correct files |
| `EDGE_FUNCTION_CRON_SETUP.sql` | Operational script, still valid |
| `docs/DEPLOYMENT_CHECKLIST.md` | Short, valid |
| `docs/EDGE_FUNCTION_MONITORING.md` | Already updated in previous step |
| `docs/FLOATING_CARDS.md` | Accurate component documentation |
| `docs/PAYMENT_TESTING_GUIDE.md` | Comprehensive, still valid |
| `docs/STATUS_TRANSITION_MATRIX.md` | Accurate status flows |
| `docs/WORKFLOW_DIAGRAMS.md` | Valid mermaid diagrams |

---

### Summary of Changes

| File | Action |
|------|--------|
| `docs/ADMIN_GUIDE.md` | Complete rewrite (as previously planned) |
| `CODEBASE_MAP.md` | Update stale component/service references to match actual codebase |

No code changes, no functionality impact — documentation only.

