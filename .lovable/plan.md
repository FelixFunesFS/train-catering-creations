# Staff Portal Premium Redesign + History & Monthly View

## Goals
- Fix the overlapping, oversized sticky header on mobile.
- A cleaner, high-end layout on phones, tablets, and desktop (iOS Safari, Android Chrome, Edge, desktop browsers).
- Add **Past events (history)** and a **Monthly calendar view**.

## 1. New header (mobile first)
- One compact sticky bar (about 56px) under the top nav, with safe-area offset: page title, view switcher, search icon.
- Search opens inline when tapped, so it doesn't sit there taking space.
- The KPI strip scrolls away with the content instead of staying pinned.

## 2. View switcher (segmented control)
`Today · Week · Upcoming · Month · History`
- Phones: segments scroll horizontally if needed, 44px tap targets.
- Desktop: a full segmented control in the left list header.

## 3. Monthly view
- Month grid with prev/next arrows and a "Today" button; swipe left/right on phones.
- Phones: a small 7-column grid with dots for days that have events. Tap a day to show that day's event cards below the grid (agenda style).
- Tablet/desktop: a larger grid with event chips (time + name) in each day. Busy days show "+N more". Clicking an event opens it in the detail panel.
- Cancelled events never appear. Only confirmed/approved events show, same as today.

## 4. History (past events)
- Past events listed newest first, grouped by month ("October 2026"), and loaded in batches of 30 with a "Load more" button.
- Search filters by name, contact, location, or type. A month/year jump selector is included.
- Past cards are muted and show a "Completed" badge. Opening one shows the same read-only BEO (menu, crew, notes). Confirm-shift and countdown are hidden for past events.

## 5. Visual polish
- Event cards: a clear hierarchy (date block on the left, then name, time, guests, location), one status accent, consistent spacing, and no duplicate tags.
- Polished empty states for each view.
- Only theme colors are used, so contrast stays right in light and dark mode.

## Technical details
- `useStaffEvents.ts`: add filters `month` (start/end of month range from YYYY-MM-DD strings) and `history` (`event_date < today`, descending, paginated with `range()` via `useInfiniteQuery`). Reuse the existing row mapping and `parseDateFromLocalString`. No timezone math, and times stay as HH:MM.
- New `src/components/staff/StaffMonthView.tsx` and `StaffHistoryList.tsx`. Add a pure helper `monthGrid.ts` (builds 6x7 day cells and groups events by date) with Bun tests for month boundaries, leap years, and Sunday start.
- `StaffSchedule.tsx`: replace both sticky blocks with a single `sticky top-[calc(env(safe-area-inset-top)+3.5rem)]` bar. Store the view in the URL (`?view=month&m=2026-10`) so refresh and back keep it.
- Existing visibility rules (staff role, zero financial data) are unchanged. No database changes.
- Verify with Playwright at 375, 768, and 1280 widths.
