

# Fix Staff/Admin Mobile UI Issues

## Summary

Four targeted fixes: hide the top Sign Out button on mobile (it's in the bottom nav), fix the public site header/hamburger still showing on `/staff`, default staff filter to "all", and remove individual "Add to Calendar" buttons from staff assignment rows.

## Changes

### 1. Hide top Sign Out button on mobile

**File:** `src/components/admin/AdminLayout.tsx`

The header Sign Out button (lines 24-32) is redundant on mobile since `MobileAdminNav` already has a Logout button in the bottom bar. Add a responsive class to hide it on small screens:

Change the Button's className from `"gap-2"` to `"gap-2 hidden lg:flex"` so it only shows on desktop where the bottom nav is less prominent.

### 2. Fix public Header showing on `/staff` route

**File:** `src/components/Header.tsx`

Line 13 only checks `startsWith('/admin')`. The `/staff` route is not caught, so the public site header (with hamburger menu) renders on the staff page. Update to:

```
const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/staff';
```

### 3. Default staff filter to "all"

**File:** `src/pages/StaffSchedule.tsx`

Line 16 sets the default filter to `'week'`. Change to `'all'`:

```
const [filter, setFilter] = useState<StaffEventFilter>('all');
```

### 4. Remove individual "Add to Calendar" button per staff assignment

**File:** `src/components/staff/StaffEventDetails.tsx`

In the `StaffAssignmentCard` component (lines 167-172), remove the `AddToCalendarButton` that appears next to each staff member. The main "Add to Calendar" button at the top of the event details card (line 235) remains -- it downloads the full event. Only the per-assignment individual buttons are removed.

This also means the `AddToCalendarButton` import (line 11) and the `event` prop on `StaffAssignmentCard` can be simplified, but keeping the import since it's still used in the main card header. The `StaffAssignmentCard` component no longer needs the `event` prop.

## Files Summary

| File | Change |
|------|--------|
| `src/components/admin/AdminLayout.tsx` | Hide Sign Out button on mobile (`hidden lg:flex`) |
| `src/components/Header.tsx` | Add `/staff` to admin route check |
| `src/pages/StaffSchedule.tsx` | Default filter from `'week'` to `'all'` |
| `src/components/staff/StaffEventDetails.tsx` | Remove per-assignment AddToCalendarButton; simplify StaffAssignmentCard props |

## What Does NOT Change

- Bottom nav bar (MobileAdminNav) -- unchanged
- Desktop Sign Out button in header -- still visible on large screens
- Main "Add to Calendar" button on event detail card -- stays
- Subscribe calendar button -- stays
- All route protection and permissions -- unchanged
