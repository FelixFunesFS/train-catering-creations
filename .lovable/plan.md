

## Add Client-Side Pagination to Admin Views

### Approach

Add simple client-side pagination to three admin views. All data is already fetched and filtered in memory, so we just slice the results into pages. No database query or hook changes needed.

A shared pagination component will be reused across all three views, using the existing `src/components/ui/pagination.tsx` primitives.

### 1. Create a reusable pagination hook

**New file:** `src/hooks/usePagination.ts`

A small hook that accepts a total item count and page size, and returns:
- `currentPage`, `setCurrentPage`
- `totalPages`
- `startIndex`, `endIndex` (for slicing arrays)
- Auto-resets to page 1 when filters change (via a dependency array)

### 2. Create a reusable PaginationControls component

**New file:** `src/components/admin/PaginationControls.tsx`

A compact, mobile-friendly component built on the existing `pagination.tsx` primitives. Shows:
- Previous / Next buttons
- Current page indicator ("Page 1 of 5")
- Item count summary ("Showing 1-10 of 47")

### 3. Add pagination to EventList

**File:** `src/components/admin/events/EventList.tsx`

- Import the hook and component
- Add `usePagination(eventsWithInvoices.length, 15)` with filter dependencies so page resets on filter/sort/search change
- Slice `eventsWithInvoices` using `startIndex` and `endIndex` before rendering the table/cards
- Render `PaginationControls` below the table (list view only -- week/month views show all events on the calendar)
- Page size: 15 events per page

### 4. Add pagination to PaymentList

**File:** `src/components/admin/billing/PaymentList.tsx`

- Same pattern: `usePagination(filteredInvoices.length, 10)`
- Slice `filteredInvoices` before the `.map()` render
- Render `PaginationControls` below the invoice cards
- Page size: 10 invoices per page

### 5. Add pagination to EmailDeliveryPanel

**File:** `src/components/admin/settings/EmailDeliveryPanel.tsx`

- Same pattern: `usePagination(filtered.length, 25)`
- Slice `filtered` before the `.map()` render
- Render `PaginationControls` below the scroll area
- Page size: 25 emails per page (higher because rows are compact)

### What stays the same

- **SubmissionsCard**: No pagination -- these are active action items (typically under 5), not an archive
- **All data hooks** (`useQuotes`, `useInvoices`): No changes -- data fetching stays as-is
- **Filters, sorting, search**: All continue to work -- pagination just slices the final result
- **Week/month calendar views**: No pagination -- calendars show all events visually

### Technical details

The `usePagination` hook signature:

```text
usePagination(totalItems: number, pageSize: number, deps?: any[])
  --> { currentPage, setCurrentPage, totalPages, startIndex, endIndex }
```

The `deps` array triggers a reset to page 1 whenever filters, search, or sort change, preventing the user from landing on an empty page after changing a filter.

### Files changed

| File | Change |
|------|--------|
| `src/hooks/usePagination.ts` | New -- reusable pagination state hook |
| `src/components/admin/PaginationControls.tsx` | New -- shared pagination UI component |
| `src/components/admin/events/EventList.tsx` | Add pagination (15 per page, list view only) |
| `src/components/admin/billing/PaymentList.tsx` | Add pagination (10 per page) |
| `src/components/admin/settings/EmailDeliveryPanel.tsx` | Add pagination (25 per page) |

