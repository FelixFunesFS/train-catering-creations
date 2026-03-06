

# Review: Events Table Responsiveness Fix

## Plan Validation

The previous plan is **safe to implement with two corrections**:

### Issue 1: `<TableCell>` in `<TableHeader>` (line 636)
The plan correctly identifies this bug. Line 636 uses `<TableCell className="w-10" />` inside `<TableHeader>`, which is semantically wrong — it renders a `<td>` inside `<thead>`. Fix: replace with `<TableHead className="w-10" />`.

### Issue 2: Sticky action column — needs care
Making the action column `sticky right-0` is safe **only if** we also add a background color to prevent content bleeding through. The action cell (line 720) conditionally renders the DollarSign button based on `paymentReminderStatuses.includes(invoice.workflow_status)`. This logic is untouched — no workflow risk. Both the `<TableHead>` (header) and `<TableCell>` (body, line 720) need the sticky + background treatment.

### Issue 3: Previous plan's breakpoint changes — one conflict
The plan proposed moving "Event Name" from `hidden sm:table-cell` to `hidden lg:table-cell`. This is aggressive — Event Name is valuable context. A safer approach:

| Column | Current Breakpoint | Safe Change |
|--------|-------------------|-------------|
| Event Name | `hidden sm:table-cell` | Keep as-is |
| Guests | `hidden md:table-cell` | `hidden lg:table-cell` |
| Payment | `hidden lg:table-cell` | `hidden xl:table-cell` |
| Invoice # | `hidden lg:table-cell` | `hidden xl:table-cell` |

This frees up ~200px at the `lg` breakpoint (1024px) by deferring Payment and Invoice # to `xl`, which is enough to eliminate horizontal scroll without hiding important columns.

### No workflow/functionality risks
- The `onClick` handler on `<TableRow>` (line 648-654) is unaffected — navigation to event detail and mobile sheet selection remain intact.
- The payment reminder button's `e.stopPropagation()` (line 729) and conditional rendering based on `paymentReminderStatuses` are untouched.
- Sorting via `SortableTableHead` components — no changes to sort keys or `handleSort`.
- `PaginationControls` — unaffected.
- Mobile card view (`viewMode !== 'list'`) — completely separate code path, unaffected.

## Implementation (3 targeted edits in EventList.tsx)

1. **Line 636**: Replace `<TableCell className="w-10" />` with `<TableHead className="w-10 sticky right-0 bg-card z-10" />`
2. **Lines 589-618**: Change Guests from `hidden md:table-cell` → `hidden lg:table-cell`; Payment and Invoice # from `hidden lg:table-cell` → `hidden xl:table-cell`
3. **Lines 677-679, 688-709, 720**: Match body cells to new breakpoints; add `sticky right-0 bg-card` to action cell

