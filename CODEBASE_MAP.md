# Soul Train's Eatery - Codebase Map

> **Purpose**: This document identifies canonical files for each feature to prevent code duplication and ensure maintainability.

---

## 🗄️ Database Layer

### Views (Single Source of Truth)
| View | Purpose | Used By |
|------|---------|---------|
| `event_summary` | Combined quote + invoice data with calculated fields | Dashboard, Pipeline, Calendar |
| `invoice_payment_summary` | Invoice payment data with milestones | AR Dashboard, Billing Hub |

### Core Tables
| Table | Purpose | Notes |
|-------|---------|-------|
| `quote_requests` | Customer quote submissions | Primary event data |
| `invoices` | Estimates and invoices | Links to quote_requests |
| `invoice_line_items` | Pricing line items | Links to invoices |
| `payment_milestones` | Payment schedule | Links to invoices |
| `payment_transactions` | Payment records | Links to invoices + milestones |
| `workflow_state_log` | Status change history | Audit trail |

### Archived/Deprecated Tables
| Table | Status | Replacement |
|-------|--------|-------------|
| `payment_history` | Deprecated | Use `payment_transactions` |
| `quote_line_items` | Deprecated | Use `invoice_line_items` |
| `calendar_events` | Archived | Feature not active |
| `estimate_versions` | Archived | Feature not active |
| `message_threads` | Archived | Feature not active |
| `messages` | Archived | Feature not active |

---

## 📊 Data Services (Canonical Query Layer)

### EventDataService.ts
**Location**: `src/services/EventDataService.ts`

| Method | Purpose |
|--------|---------|
| `getEvents(filters?)` | Fetch all events with optional filters |
| `getEventById(quoteId)` | Fetch single event |
| `getAtRiskEvents()` | Events with high/medium risk |
| `getUpcomingEvents(days)` | Events within N days |
| `getEventsForMonth(year, month)` | Calendar view data |
| `getDashboardKPIs()` | Dashboard statistics |

### PaymentDataService.ts
**Location**: `src/services/PaymentDataService.ts`

| Method | Purpose |
|--------|---------|
| `getInvoices(filters?)` | Fetch all invoices with payment data |
| `getInvoiceById(invoiceId)` | Fetch single invoice |
| `getOverdueInvoices()` | Invoices past due date |
| `getARAgingBuckets()` | AR aging breakdown |
| `getPaymentStats()` | Payment statistics |
| `getRevenueByDateRange(start, end)` | Revenue reporting |
| `getPaymentTransactions(invoiceId?)` | Payment transaction history |
| `recordManualPayment(...)` | Record offline payments |

---

## 🎣 TanStack Query Hooks (Canonical Data Access)

> **Refactoring Status**: All admin dashboard components have been refactored to use centralized hooks instead of direct Supabase queries.

### useEvents.ts
**Location**: `src/hooks/useEvents.ts`

| Hook | Purpose | Refactored Components |
|------|---------|----------------------|
| `useEvents(filters?)` | Fetch events with caching | `ReportingDashboard` |
| `useEvent(quoteId)` | Single event | - |
| `useAtRiskEvents()` | At-risk events | `DashboardHome` |
| `useUpcomingEvents(days)` | Upcoming events | `DashboardHome` |
| `useEventsForMonth(year, month)` | Calendar data | - |
| `useDashboardKPIs()` | Dashboard KPIs | `DashboardHome` |

### useInvoices.ts
**Location**: `src/hooks/useInvoices.ts`

| Hook | Purpose | Query Key |
|------|---------|-----------|
| `useInvoices(filters?)` | Fetch invoices with caching | `invoiceKeys.list(filters)` |
| `useInvoice(invoiceId)` | Single invoice by ID | `invoiceKeys.detail(id)` |
| `useInvoiceByQuote(quoteId)` | Invoice by quote ID | `invoiceKeys.byQuote(id)` |
| `useInvoiceWithLineItems(invoiceId)` | Invoice with line items | `invoiceKeys.detail(id)` |
| `useInvoiceWithMilestones(invoiceId)` | Invoice with payment milestones | `invoiceKeys.detail(id)` |
| `useInvoicesByStatus(status)` | Invoices by workflow status | `invoiceKeys.byStatus(status)` |
| `useOverdueInvoices()` | Overdue invoices | `invoiceKeys.overdue()` |
| `usePaymentStats()` | Payment statistics | `['payments', 'stats']` |
| `useRevenue(start, end)` | Revenue data by date range | `['revenue', ...]` |
| `usePaymentTransactions(invoiceId?)` | Payment transaction history | `['payment-transactions', ...]` |
| `useUpdateInvoice()` | Update invoice fields | Mutation |
| `useUpdateInvoiceStatus()` | Update workflow status with audit | Mutation |
| `useRecordPayment()` | Record manual payment | Mutation |
| `useSendInvoiceEmail()` | Mark invoice as sent | Mutation |
| `useDeleteInvoice()` | Delete invoice and related records | Mutation |

### useARDashboard.ts
**Location**: `src/hooks/useARDashboard.ts`

| Hook | Purpose | Refactored Components |
|------|---------|----------------------|
| `useARAgingBuckets()` | AR aging data | `ReportingDashboard` |
| `useARDashboard()` | Combined AR dashboard data | -

### useLineItems.ts
**Location**: `src/hooks/useLineItems.ts`

| Hook | Purpose | Used By |
|------|---------|---------|
| `useLineItems(invoiceId)` | Fetch line items for an invoice | `useLineItemManagement` |
| `useCreateLineItems()` | Mutation for creating line items | `QuickEstimateCreator` |
| `useUpdateLineItem()` | Mutation for updating a line item | `useLineItemManagement` |
| `useDeleteLineItem()` | Mutation for deleting a line item | `useLineItemManagement` |
| `useReplaceLineItems()` | Mutation for replacing all line items | `useLineItemManagement` |

### useLineItemManagement.tsx
**Location**: `src/hooks/useLineItemManagement.tsx`

| Hook | Purpose | Uses |
|------|---------|------|
| `useLineItemManagement(invoiceId)` | Line item management with optimistic updates | `LineItemsService`, `useLineItems` hooks |

### useChangeRequests.ts
**Location**: `src/hooks/useChangeRequests.ts`

| Hook | Purpose | Used By |
|------|---------|---------|
| `useChangeRequests(status?)` | Fetch all change requests | Admin components |
| `useChangeRequestsByInvoice(invoiceId)` | Fetch change requests for invoice | `IntegratedChangeRequestPanel` |
| `usePendingChangeRequestsCount()` | Pending count for badges | Admin dashboard |
| `useSubmitChangeRequest()` | Mutation for submitting requests | Customer portal |
| `useUpdateChangeRequest()` | Mutation for admin updates | Admin components |
| `useProcessChangeRequest()` | Full approve/reject workflow | `ChangeRequestProcessor`, `QuickDecisionPanel`, `IntegratedChangeRequestPanel` |

### useQuotes.ts
**Location**: `src/hooks/useQuotes.ts`

| Hook | Purpose | Query Key |
|------|---------|-----------|
| `useQuotes(filters?)` | Fetch quotes with optional status/search/limit | `quoteKeys.list(filters)` |
| `useQuote(quoteId)` | Fetch single quote by ID | `quoteKeys.detail(id)` |
| `useQuotesByStatus(status)` | Fetch quotes by workflow status | `quoteKeys.byStatus(status)` |
| `usePendingQuotesCount()` | Count of pending quotes | `quoteKeys.pending()` |
| `useQuoteWithInvoice(quoteId)` | Quote with related invoice & line items | `quoteKeys.detail(id)` |
| `useUpdateQuote()` | Update quote fields | Mutation |
| `useUpdateQuoteStatus()` | Update workflow status with audit log | Mutation |
| `useDeleteQuote()` | Delete quote and related records | Mutation |
| `useCreateQuote()` | Create new quote | Mutation |
| `useBulkUpdateQuotes()` | Bulk update multiple quotes | Mutation |

---

## 🧩 Core Components

### Admin Dashboard
| Component | Location | Purpose |
|-----------|----------|---------|
| `UnifiedAdminDashboard` | `src/pages/UnifiedAdminDashboard.tsx` | Main admin entry point (3 views: Events, Billing, Settings) |
| `AdminLayout` | `src/components/admin/AdminLayout.tsx` | Shared layout with header and navigation |
| `MobileAdminNav` | `src/components/admin/mobile/MobileAdminNav.tsx` | Bottom nav (mobile) / inline nav (desktop) |
| `EventsView` | `src/components/admin/events/EventsView.tsx` | SubmissionsCard + EventList |
| `PaymentList` | `src/components/admin/billing/PaymentList.tsx` | Invoices and payment tracking |
| `NotificationPreferencesPanel` | `src/components/admin/settings/NotificationPreferencesPanel.tsx` | Alert preferences |
| `EmailTemplatePreview` | `src/components/admin/settings/EmailTemplatePreview.tsx` | Email template previews |
| `EmailDeliveryPanel` | `src/components/admin/settings/EmailDeliveryPanel.tsx` | Email delivery monitoring |

### Event Detail Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `EventDetailsPanelContent` | `src/components/admin/events/EventDetailsPanelContent.tsx` | Customer info, menu, notes |
| `EstimatePanelContent` | `src/components/admin/events/EstimatePanelContent.tsx` | Line items, pricing, send estimate |
| `EventChecklistPanel` | `src/components/admin/events/EventChecklistPanel.tsx` | Event task checklist |
| `StaffAssignmentPanel` | `src/components/admin/events/StaffAssignmentPanel.tsx` | Staff assignments |
| `ShoppingListPanel` | `src/components/admin/events/ShoppingListPanel.tsx` | Shopping list management |

### Customer Portal
| Component | Location | Purpose |
|-----------|----------|---------|
| `CustomerEstimateView` | `src/components/customer/CustomerEstimateView.tsx` | Customer estimate portal |
| `CustomerActions` | `src/components/customer/CustomerActions.tsx` | Approve/reject/change request actions |

### Quote Form
| Component | Location | Purpose |
|-----------|----------|---------|
| `SinglePageQuoteForm` | `src/components/quote/SinglePageQuoteForm.tsx` | Main quote request form |
| `EventContactStep` | `src/components/quote/steps/EventContactStep.tsx` | Contact & event info |
| `ServiceSelectionStep` | `src/components/quote/steps/ServiceSelectionStep.tsx` | Service type selection |
| `MenuSelectionStep` | `src/components/quote/steps/MenuSelectionStep.tsx` | Menu items |
| `FinalStep` | `src/components/quote/steps/FinalStep.tsx` | Supplies & requests |

---

## 📧 Email System

### Edge Functions (46 total, grouped by category)

**Email (11):** `send-smtp-email` (core SMTP), `send-customer-portal-email`, `send-quote-notification`, `send-quote-confirmation`, `send-payment-reminder`, `send-admin-notification`, `send-change-request-notification`, `send-event-followup`, `send-event-reminders`, `send-status-notification`, `send-manual-email`

**Email Utilities (4):** `preview-email`, `send-batch-test-emails`, `send-test-email`, `track-email-open`

**Payments (5):** `create-checkout-session`, `create-payment-intent`, `create-payment-link`, `stripe-webhook`, `verify-payment`

**Workflow & Automation (6):** `automated-customer-workflow`, `workflow-orchestrator`, `update-quote-workflow`, `fix-workflow-status`, `process-change-request`, `confirm-event`

**Invoice & Estimates (5):** `generate-invoice-from-quote`, `generate-invoice-pdf`, `generate-payment-milestones`, `approve-estimate`, `validate-invoice-totals`

**Customer & Quotes (3):** `submit-quote-request`, `sync-invoice-with-quote`, `token-renewal-manager`

**Other (6):** `create-stripe-customer`, `apply-payment-waterfall`, `generate-payment-receipt`, `staff-calendar-feed`, `event-timeline-generator`, `generate-test-data`

**Infrastructure (5):** `unified-reminder-system`, `rate-limit-check`, `send-push-notification`, `track-visitor`, `email-qa-report`

### Shared Templates
| File | Location | Purpose |
|------|----------|---------|
| `emailTemplates.ts` | `supabase/functions/_shared/emailTemplates.ts` | Unified email templates |

---

## 💰 Payment System

### Services
| Service | Location | Purpose |
|---------|----------|---------|
| `EventDataService` | `src/services/EventDataService.ts` | Event queries and dashboard KPIs |
| `PaymentDataService` | `src/services/PaymentDataService.ts` | Invoice and payment queries |
| `TaxCalculationService` | `src/services/TaxCalculationService.ts` | Tax calculations (2% + 7%) |
| `InvoiceTotalsRecalculator` | `src/services/InvoiceTotalsRecalculator.ts` | Invoice total recalculations |
| `LineItemsService` | `src/services/LineItemsService.ts` | Line item CRUD operations |
| `ChangeRequestService` | `src/services/ChangeRequestService.ts` | Change request CRUD |
| `ChangeRequestProcessor` | `src/services/ChangeRequestProcessor.ts` | Approve/reject workflow |
| `EmailNotificationService` | `src/services/EmailNotificationService.ts` | Email sending orchestration |
| `EstimateVersionService` | `src/services/EstimateVersionService.ts` | Estimate version management |
| `HistoryLogger` | `src/services/HistoryLogger.ts` | Audit trail logging |
| `MenuItemService` | `src/services/MenuItemService.ts` | Menu item operations |
| `PaymentMilestoneService` | `src/services/PaymentMilestoneService.ts` | Payment milestone management |
| `QuoteUpdateService` | `src/services/QuoteUpdateService.ts` | Quote field updates |

### Edge Functions
| Function | Location | Purpose |
|----------|----------|---------|
| `create-payment-link` | `supabase/functions/create-payment-link/` | Stripe checkout links |
| `stripe-webhook` | `supabase/functions/stripe-webhook/` | Payment confirmations |
| `generate-payment-receipt` | `supabase/functions/generate-payment-receipt/` | Receipt generation |

---

## 🔐 Authentication & Authorization

### Hooks
| Hook | Location | Purpose |
|------|----------|---------|
| `useAuth` | `src/hooks/useAuth.tsx` | Authentication state |
| `usePermissions` | `src/hooks/usePermissions.ts` | RBAC permissions |

### Database Functions
| Function | Purpose |
|----------|---------|
| `is_admin()` | Check admin role |
| `has_role(user_id, role)` | Check specific role |
| `is_valid_access_token(token, invoice_id)` | Customer portal access |

---

## 🚫 Removed Features (Do Not Recreate)

| Feature | Reason |
|---------|--------|
| Contracts/Terms signing | Merged into estimate approval |
| Calendar sync | Feature not active |
| Messaging system | Feature not active |
| Analytics tracking | Feature not active |
| Estimate versioning | Feature not active |
| Auto-approval engine | Not needed |

---

## 📋 Workflow States

### Quote Workflow (`quote_workflow_status`)
```
pending → under_review → estimated → quoted → approved → 
awaiting_payment → paid → confirmed → in_progress → completed
                                                  ↓
                                             cancelled
```

### Invoice Workflow (`invoice_workflow_status`)
```
draft → pending_review → sent → viewed → approved → 
payment_pending → partially_paid → paid
                               ↓
                          overdue → cancelled
```

---

## 🔧 Key Configuration

| Config | Location | Purpose |
|--------|----------|---------|
| Supabase Client | `src/integrations/supabase/client.ts` | Database connection |
| Supabase Types | `src/integrations/supabase/types.ts` | Auto-generated types |
| Tailwind Config | `tailwind.config.ts` | Design tokens |
| Theme Variables | `src/index.css` | CSS variables |

---

## ⚠️ Important Guidelines

1. **Always use data services** instead of direct Supabase queries in components
2. **Always use TanStack hooks** for data fetching with caching
3. **Never duplicate query logic** - extend existing services/hooks
4. **Email templates** must use shared functions from `emailTemplates.ts`
5. **Tax calculations** must use `TaxCalculationService`
6. **Payment milestones** must use `PaymentMilestoneService`
7. **Customer-facing changes** must follow `CUSTOMER_DISPLAY_CHECKLIST.md`

---

## 🔄 Customer Display Sync

> **Important**: All customer-facing display changes must be applied to ALL applicable touchpoints.

### Touchpoint Files
| File | Type | Content |
|------|------|---------|
| `src/components/customer/CustomerEstimateView.tsx` | React | Customer portal view |
| `supabase/functions/send-customer-portal-email/index.ts` | Edge | Estimate & approval emails |
| `supabase/functions/send-quote-confirmation/index.ts` | Edge | Quote confirmation email |
| `supabase/functions/generate-invoice-pdf/index.ts` | Edge | PDF generation |
| `supabase/functions/_shared/emailTemplates.ts` | Shared | Reusable email templates |

### Sync Rules
1. Changes to event details display → Update all 5 files
2. Changes to line items display → Update portal, estimate email, PDF
3. Changes to payment schedule → Update portal, approval email, PDF
4. Changes to terms display → Update portal and PDF only

See `CUSTOMER_DISPLAY_CHECKLIST.md` for detailed matrix.

---

*Last updated: February 2026*
