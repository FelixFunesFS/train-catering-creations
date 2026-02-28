

## Reports View Implementation Plan

### Scope
Add a 4th admin view (`reports`) to the existing 3-view system. This is purely additive — no existing components, routes, workflows, or database tables are modified.

### What Changes

**1. Update `MobileAdminNav.tsx`** — Add a "Reports" nav item with `BarChart3` icon, pointing to `/admin?view=reports`. Insert it between Billing and Staff in the `adminNavItems` array.

**2. Update `UnifiedAdminDashboard.tsx`** — Expand `AdminView` type to include `'reports'`. Add `{currentView === 'reports' && <ReportsView />}` conditional render. Import `ReportsView`.

**3. Create `src/components/admin/reports/` directory** with these files:

- **`ReportsView.tsx`** — Main container with shared filter state (date range, event type, service type) and 4 tabs: Revenue, Events, Items, Payments. Uses scrollable `TabsList` pattern matching Settings view.

- **`ReportsFilterBar.tsx`** — Date range presets (This Month, Last 30 Days, This Quarter, YTD, Custom) with DatePicker for custom. Event type multi-select checkboxes. Service type dropdown. Stacks vertically on mobile, horizontal on desktop.

- **`RevenueOverview.tsx`** — 4 KPI cards (Total Revenue, Outstanding, Avg Invoice, Total Events) in `grid-cols-2 sm:grid-cols-4`. Revenue over time `AreaChart` from Recharts with `ResponsiveContainer`.

- **`EventAnalytics.tsx`** — Events by type `PieChart`, events by service type `PieChart`, events by status `BarChart`. Grid `grid-cols-1 lg:grid-cols-2`.

- **`ItemsAnalysis.tsx`** — Top items by revenue table with visual bar indicators. Bottom performers. Data from `invoice_line_items` grouped by title/category.

- **`PaymentAnalysis.tsx`** — Payment method distribution `PieChart`. AR aging buckets `BarChart` (reuses `PaymentDataService.getARAgingBuckets()`). Collection rate card.

- **`useReportsData.ts`** — TanStack Query hook wrapping queries to `invoice_payment_summary`, `quote_requests`, `invoice_line_items`, `payment_transactions`. Accepts filter params. Client-side aggregation.

- **`index.ts`** — Barrel export for `ReportsView`.

### What Does NOT Change
- No database migrations or new tables
- No changes to existing components (Events, Billing, Settings)
- No changes to existing services (`PaymentDataService`, `EventDataService`)
- No changes to RLS policies or database functions
- No changes to customer-facing routes
- No changes to existing hooks or workflows
- All existing nav items remain in same positions

### Technical Details

**Data queries** use existing Supabase tables with admin RLS (`is_admin()`):
- `invoice_payment_summary` view — revenue, balances, aging (already used by PaymentDataService)
- `quote_requests` — event type/service type distribution, guest counts
- `invoice_line_items` — item-level revenue analysis
- `payment_transactions` — payment method breakdown

**Charts** use Recharts (already installed), exported via `src/components/ui/chart.tsx`. Uses `ResponsiveContainer` for responsive sizing.

**Responsiveness**:
- KPI cards: `grid-cols-2 sm:grid-cols-4`
- Charts: `grid-cols-1 lg:grid-cols-2`
- Filter bar: stacked on mobile, row on desktop
- Tabs: horizontally scrollable (same pattern as Settings)
- Tables: `overflow-x-auto` on mobile

