

# Fix Events Table: Full Columns on Desktop, No Scroll

## Problem
- The sticky action column creates a visible white bar artifact
- Several columns (Guests, Payment, Invoice #, Total, Last Edited, Submitted) are hidden until `xl` (1280px), meaning at standard desktop widths (1024–1279px) users see an incomplete table
- The action column has no header label

## Solution

All 11 columns should be visible at `lg` (1024px+) — the standard desktop breakpoint. To fit without horizontal scroll, we reduce padding and use smaller text at `lg`, and remove the broken sticky positioning.

### Changes to `EventList.tsx`

**1. Remove sticky from action column**
- Line 636: `<TableHead className="w-10 sticky right-0 bg-card z-10" />` → `<TableHead className="w-10" />`
- Line 720: `<TableCell className="text-right sticky right-0 bg-card z-10">` → `<TableCell className="text-right">`

**2. Show all columns at `lg` instead of `xl`**
Update breakpoints so every column is visible on desktop (≥1024px):

| Column | Current | New |
|--------|---------|-----|
| Submitted | `hidden xl:table-cell` | `hidden lg:table-cell` |
| Guests | `hidden lg:table-cell` | `hidden lg:table-cell` (no change) |
| Payment | `hidden xl:table-cell` | `hidden lg:table-cell` |
| Invoice # | `hidden xl:table-cell` | `hidden lg:table-cell` |
| Total | `hidden xl:table-cell` | `hidden lg:table-cell` |
| Last Edited | `hidden xl:table-cell` | `hidden lg:table-cell` |

This applies to both header (`SortableTableHead`) and body (`TableCell`) — 8 lines changing `xl` → `lg`.

**3. Compact table styling for fit**
Add `text-xs` to the `<Table>` wrapper and reduce cell padding via a class on the table so all 11 columns fit at 1024px without overflow. Specifically, override table cell padding to `px-2 py-2` at the `lg` breakpoint using a wrapper class.

### Files Changed
- `src/components/admin/events/EventList.tsx` only

### No Workflow Impact
- All click handlers, sorting, conditional rendering, and navigation logic remain untouched
- Mobile card view is a separate code path — unaffected
- Only CSS class changes (breakpoints, padding, sticky removal)

