

# Paginate Staff Event List Panel

## Approach
Client-side pagination on the already-fetched events array. The hook `useStaffEvents` fetches all matching events in one query (with joined assignments, line items, notes). Since this is a staff-facing operational view with a modest event count, client-side pagination is the right call — no need to refactor the data layer or break the parallel fetching of related data.

## Changes

### `src/pages/StaffSchedule.tsx`
1. Import `usePagination` and `PaginationControls`
2. Call `usePagination(events.length, 10, [filter])` — resets to page 1 when the filter tab changes
3. Slice `events` to `paginatedEvents = events.slice(startIndex, endIndex)`
4. Render `paginatedEvents` instead of `events` in both the **desktop left panel** and **mobile list view**
5. Add `<PaginationControls>` below the event cards in both views (inside the scroll area on desktop, below the card list on mobile)

The detail panel (`selectedEventId`, `useStaffEvent`) is completely independent — it fetches by ID, so pagination of the list has zero effect on detail viewing. Selecting an event that's on a different page still works because the detail query is separate.

### No other files changed
`usePagination` and `PaginationControls` already exist and handle edge cases (page clamping, filter reset).

