

## Staff BEO: Single Source of Truth (Revised)

### Problem Summary

When an admin modifies the estimate (adds/removes items, changes services), those changes update `invoice_line_items` but NOT the raw boolean/array fields on `quote_requests`. The staff view currently reads equipment and service details from those stale raw fields, creating a data mismatch.

Conversely, if an admin edits quote-level fields (location, guest count, contact info, event date), those update immediately since the hook reads directly from `quote_requests`.

### Data Flow After Fix

```text
Admin changes estimate line items
       |
       v
invoice_line_items updated (DB trigger recalculates totals)
       |
       v
Staff view reads line_items --> renders ALL operational sections from them
       |
       v
Raw quote_requests fields used ONLY as fallback (pre-estimate events)
       + ALWAYS used for: location, date, guest count, contact info,
         theme colors, military org, dietary_restrictions array,
         special_requests, ceremony_included, custom_menu_requests
```

### What Changes

#### 1. Data Layer: `src/hooks/useStaffEvents.ts`

- Add 4 missing fields to `QUOTE_FIELDS`: `custom_menu_requests`, `utensils`, `extras`, `ceremony_included`
- Add matching properties to `StaffEvent` interface
- Update `transformToStaffEvent` to parse them (JSON arrays + boolean)
- Add computed flag `has_approved_line_items: boolean` (true when `line_items.length > 0`)
- Reduce `staleTime` from 5 minutes to 2 minutes for fresher data

#### 2. Display Logic: `src/components/staff/StaffEventDetails.tsx`

**Line-item-first rendering (when `has_approved_line_items` is true):**

- "Event Requirements" section: Already renders from `LineItemsByCategory` -- no change needed
- "Equipment/Supplies" section: Derive from line items with category `supplies` instead of raw boolean flags (`chafers_requested`, `plates_requested`, etc.)
- "Service Details" section: Derive from line items with category `service` or `service_addon` instead of raw boolean flags (`wait_staff_requested`, `bussing_tables_needed`, etc.)
- This ensures that if the admin removed "Wait Staff" from the estimate, it disappears from the staff BEO

**Fallback rendering (when no line items exist):**

- Keep current behavior reading from raw quote fields -- these are pre-estimate events where the original submission is the only data available

**Always shown regardless of line item status (event-level fields that admins edit on `quote_requests` directly):**

- Location, date, time, guest count, contact info -- already correct
- `special_requests` -- operational context
- `dietary_restrictions` array + `guest_count_with_restrictions` -- safety-critical
- `theme_colors`, `military_organization` -- event context
- `ceremony_included` -- new, shown as badge for wedding events

**New "Customer Notes" section:**

- `custom_menu_requests` -- free-text food notes from the customer
- `extras` -- additional items requested (JSON array, rendered as bullet list)
- `utensils` -- utensil preferences (JSON array)
- Only shown when at least one of these has content
- Rendered with a distinct visual style (info callout) so staff knows these are original customer notes vs. approved scope

**Data provenance indicator:**

- Small text label: "Based on approved estimate" or "Based on quote submission" so staff knows the data source

**Refresh button:**

- Manual refresh icon button in the detail header to force re-fetch

#### 3. Desktop Empty States: `src/pages/StaffSchedule.tsx`

- Update desktop empty state to match mobile's filter-aware messages:
  - "today" filter: "No events scheduled for today"
  - "week" filter: "No events scheduled this week"
  - "all" filter: "No upcoming events found"

### Why This Is Safe

- **Admin edits to quote-level fields** (location, date, guest count, contact): The hook reads these directly from `quote_requests` on every fetch -- changes appear immediately on next query refresh
- **Admin edits to line items** (add/remove food, services, equipment): The hook reads these from `invoice_line_items` on every fetch -- changes appear immediately on next query refresh
- **Admin edits to admin notes**: Fetched directly from `admin_notes` table -- changes appear immediately
- **Admin edits to staff assignments**: Fetched directly from `staff_assignments` table -- changes appear immediately
- **No caching staleness beyond 2 minutes** with the reduced staleTime, plus manual refresh option

### Files Modified

1. `src/hooks/useStaffEvents.ts` -- Add 4 fields, computed flag, reduce staleTime
2. `src/components/staff/StaffEventDetails.tsx` -- Line-item-first rendering for equipment/service sections, add customer notes section, ceremony badge, provenance indicator, refresh button
3. `src/pages/StaffSchedule.tsx` -- Align desktop empty states with mobile

### No Database Changes Required

All data already exists. This is purely a frontend rendering logic change to ensure the staff BEO always reflects the admin's latest approved scope.

