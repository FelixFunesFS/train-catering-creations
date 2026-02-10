

## Create Comprehensive UX Architecture Document

### Overview

Create `docs/UX_ARCHITECTURE.md` -- the authoritative reference for all user journeys, actor interactions, system behaviors, and error flows. This document uses text-based Mermaid notation throughout so diagrams can be rendered in any Markdown viewer.

It builds on (but does not replace) the existing `WORKFLOW_DIAGRAMS.md` and `STATUS_TRANSITION_MATRIX.md`, which remain as focused technical references.

---

### Document Structure (~900 lines)

**Section 1: System Overview & Actors**
- Define 4 actors: Customer (unauthenticated, token-based), Admin (role-gated via `has_role()`), Staff (role-gated, read-only), System (cron, webhooks, triggers)
- Route map showing all 25+ routes from `App.tsx` grouped by actor
- Technology stack summary (React/Vite/Tailwind/Supabase/Stripe)

**Section 2: Layer 1 -- User Journey Maps (Emotional Arcs)**

Three full journey maps with emotional states at each phase:

- **Customer Journey** (10 phases): Discovery (Homepage) -> Intent (Quote selector) -> Submission (6-step wizard) -> Confirmation (Thank You) -> Waiting (anxiety) -> Review (Portal via token) -> Decision (Approve/Change) -> Payment (Stripe) -> Confirmation (Success page) -> Event Day
- **Admin Journey** (10 phases): Auth -> Dashboard -> New Submissions -> Event Deep Dive -> Estimate Creation -> Send to Customer -> Change Requests -> Payment Tracking -> Event Completion -> Settings
- **Staff Journey** (4 phases): Auth -> Event List -> Event Details -> Calendar Subscribe

Each journey includes: touchpoints, UI components involved, edge functions triggered, and emotional state (confident/anxious/delighted).

**Section 3: Layer 2 -- Use Case Diagrams**

All use cases per actor with preconditions and postconditions:
- Customer: 9 use cases (UC-C1 through UC-C9)
- Admin: 15 use cases (UC-A1 through UC-A15)
- Staff: 3 use cases (UC-S1 through UC-S3)
- System: 8 automated use cases (UC-SYS1 through UC-SYS8)

**Section 4: Layer 3 -- Interaction & Sequence Diagrams**

Mermaid sequence diagrams for 6 critical flows:

1. **Quote Submission**: Customer -> SinglePageQuoteForm -> `submit-quote-request` -> DB -> `send-quote-confirmation` + `send-admin-notification`
2. **Estimate Generation & Delivery**: Admin -> `generate-invoice-from-quote` -> line items -> `send-customer-portal-email` -> Customer receives token link
3. **Customer Approval**: Customer -> `approve-estimate` edge function -> invoice status update -> milestone generation -> confirmation email
4. **Change Request Cycle**: Customer -> ChangeRequestModal -> DB -> Admin reviews -> `process-change-request` -> `send-change-request-notification` -> new estimate version
5. **Payment Flow (3-layer)**: Customer -> PaymentCard -> `create-checkout-session` -> Stripe -> `stripe-webhook` (primary) -> `verify-payment` (fallback) -> PaymentSuccess (display)
6. **Authentication & Role Routing**: User -> AdminAuth -> Supabase Auth -> `onAuthStateChange` -> `has_any_role()` RPC -> ProtectedRoute/StaffRoute redirect

Activity diagrams for 3 decision flows:
1. Quote form wizard (6 steps with validation gates, conditional wedding fields)
2. Admin estimate editing (generate -> edit -> discount -> preview -> send)
3. Payment processing (milestone selection -> checkout -> webhook -> waterfall -> status sync)

**Section 5: Layer 4 -- Structural Diagrams**

- **Component Hierarchy**: Full tree from App -> AuthProvider -> Routes, showing admin, customer, and public branches with actual component names
- **State Machines**: Mermaid `stateDiagram-v2` for Quote (5 states), Invoice (7 states), Payment Milestone (2 states), Change Request (4 states)
- **Entity Relationship Diagram**: Mermaid `erDiagram` covering `quote_requests`, `invoices`, `invoice_line_items`, `payment_milestones`, `payment_transactions`, `change_requests`, `estimate_versions`, `customers`, `user_roles`, `business_config`
- **Service Layer Map**: All 13 services in `src/services/` with their responsibilities
- **Edge Function Inventory**: All 46 functions grouped by category (Email, Payment, Workflow, Infrastructure, Data)

**Section 6: Error & Exception Flows**

Documented recovery paths for each failure scenario:

| Failure | Detection | User Experience | Recovery |
|---------|-----------|-----------------|----------|
| Expired/invalid token | `useEstimateAccess` returns error | Error message with phone CTA | Customer calls to get new link |
| Payment failure at Stripe | Stripe redirects to cancel URL | `/payment-canceled` page with retry + contact | Retry or call office |
| Webhook signature failure | `stripe-webhook` logs error | No immediate user impact | `verify-payment` fallback on success page |
| Partial payment verification | `verify-payment` edge function | PaymentSuccess shows partial info | Webhook catches up asynchronously |
| Auth timeout | ProtectedRoute 4-second timeout | Redirect to `/admin/auth` | Re-login |
| Rate limiting | `rate-limit-check` returns blocked | Toast + disabled submit button | Wait 60 minutes |
| Email bounce/failure | `send-smtp-email` error response | Admin sees in Email Delivery panel | Admin resends manually |
| Network failure | React Query retry exhausted | Toast notification | Manual page refresh |
| Edge function crash | HTTP 500 response | Toast with error message | Retry action or contact support |

**Section 7: Deployment & Infrastructure**

- Cron schedule: `auto-workflow-manager` (15 min), `unified-reminder-system` (daily), `token-renewal-manager` (daily)
- Stripe webhook endpoint configuration
- Environment variables required (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GMAIL credentials, SITE_URL)

---

### What This Does NOT Change

- No application code
- No edge functions
- No database changes
- Existing `WORKFLOW_DIAGRAMS.md` and `STATUS_TRANSITION_MATRIX.md` remain as-is (cross-referenced)

### File Created

| File | Lines | Purpose |
|------|-------|---------|
| `docs/UX_ARCHITECTURE.md` | ~900 | Authoritative 4-layer UX architecture reference |

