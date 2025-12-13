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

| Hook | Purpose | Refactored Components |
|------|---------|----------------------|
| `useInvoices(filters?)` | Fetch invoices with caching | `PaymentProcessingDashboard` |
| `useInvoice(invoiceId)` | Single invoice | - |
| `useOverdueInvoices()` | Overdue invoices | - |
| `usePaymentStats()` | Payment statistics | `PaymentProcessingDashboard`, `ReportingDashboard` |
| `useRevenue(start, end)` | Revenue data | `ReportingDashboard` |
| `usePaymentTransactions(invoiceId?)` | Payment transaction history | `UnifiedPaymentHistory` |
| `useRecordPayment()` | Mutation for recording payments | - |

### useARDashboard.ts
**Location**: `src/hooks/useARDashboard.ts`

| Hook | Purpose | Refactored Components |
|------|---------|----------------------|
| `useARAgingBuckets()` | AR aging data | `ReportingDashboard` |
| `useARDashboard()` | Combined AR dashboard data | -

### useLineItems.ts
**Location**: `src/hooks/useLineItems.ts`

| Hook | Purpose |
|------|---------|
| `useLineItems(invoiceId)` | Fetch line items for an invoice |
| `useCreateLineItems()` | Mutation for creating line items |
| `useUpdateLineItem()` | Mutation for updating a line item |
| `useDeleteLineItem()` | Mutation for deleting a line item |
| `useReplaceLineItems()` | Mutation for replacing all line items |

---

## 🧩 Core Components

### Admin Dashboard
| Component | Location | Purpose |
|-----------|----------|---------|
| `UnifiedAdminDashboard` | `src/components/admin/UnifiedAdminDashboard.tsx` | Main admin entry point |
| `DashboardHome` | `src/components/admin/dashboard/DashboardHome.tsx` | KPIs, at-risk, upcoming |
| `UnifiedEventManager` | `src/components/admin/UnifiedEventManager.tsx` | Event list/pipeline/calendar |
| `FinancialHub` | `src/components/admin/FinancialHub.tsx` | Billing & payments |
| `SettingsHub` | `src/components/admin/SettingsHub.tsx` | Settings & testing |

### Workflow Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `UnifiedWorkflowManager` | `src/components/admin/UnifiedWorkflowManager.tsx` | Event workflow steps |
| `WorkflowSteps` | `src/components/admin/workflow/WorkflowSteps.tsx` | Step indicator |
| `PricingPanel` | `src/components/admin/workflow/PricingPanel.tsx` | Line items editor |
| `PaymentPanel` | `src/components/admin/workflow/PaymentPanel.tsx` | Payment management |

### Customer Portal
| Component | Location | Purpose |
|-----------|----------|---------|
| `TokenBasedCustomerPortal` | `src/components/customer/TokenBasedCustomerPortal.tsx` | Customer estimate view |
| `EstimateApprovalWorkflow` | `src/components/customer/EstimateApprovalWorkflow.tsx` | Approval flow |

### Quote Form
| Component | Location | Purpose |
|-----------|----------|---------|
| `QuoteRequestForm` | `src/components/QuoteRequestForm.tsx` | Main quote form |
| `EventContactStep` | `src/components/quote/steps/EventContactStep.tsx` | Contact & event info |
| `ServiceSelectionStep` | `src/components/quote/steps/ServiceSelectionStep.tsx` | Service type selection |
| `MenuSelectionStep` | `src/components/quote/steps/MenuSelectionStep.tsx` | Menu items |
| `FinalStep` | `src/components/quote/steps/FinalStep.tsx` | Supplies & requests |

---

## 📧 Email System

### Edge Functions
| Function | Location | Purpose |
|----------|----------|---------|
| `send-gmail-email` | `supabase/functions/send-gmail-email/` | Primary email sender (Gmail API) |
| `send-customer-portal-email` | `supabase/functions/send-customer-portal-email/` | Estimate ready emails |
| `send-invoice-email` | `supabase/functions/send-invoice-email/` | Invoice emails |
| `send-payment-reminder` | `supabase/functions/send-payment-reminder/` | Payment reminders |
| `send-approval-workflow` | `supabase/functions/send-approval-workflow/` | Workflow notifications |

### Shared Templates
| File | Location | Purpose |
|------|----------|---------|
| `emailTemplates.ts` | `supabase/functions/_shared/emailTemplates.ts` | Unified email templates |

---

## 💰 Payment System

### Services
| Service | Location | Purpose |
|---------|----------|---------|
| `TaxCalculationService` | `src/services/TaxCalculationService.ts` | Tax calculations (2% + 7%) |
| `PaymentScheduleService` | `src/services/PaymentScheduleService.ts` | Payment schedule generation |
| `InvoiceTotalsRecalculator` | `src/services/InvoiceTotalsRecalculator.ts` | Invoice total calculations |
| `LineItemsService` | `src/services/LineItemsService.ts` | Line item CRUD operations |

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
6. **Payment schedules** must use `PaymentScheduleService`

---

*Last updated: December 2024*
