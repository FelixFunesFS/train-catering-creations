

# Fix Date Parsing Inconsistencies Across All Views

## Problem

The project has a well-documented `dateHelpers.ts` utility that prevents timezone-related off-by-one day bugs. However, **11 files** still use unsafe date parsing (`parseISO()` or `new Date(dateString)`), which can shift dates by one day depending on the user's timezone.

## Affected Files (Grouped by Risk)

### High Priority -- User-Facing Display Bugs
These show wrong dates to users on mobile and desktop:

| File | Current (Buggy) | Fix |
|------|-----------------|-----|
| `src/hooks/useStaffEvents.ts` | `parseISO(row.event_date)` | `parseDateFromLocalString(row.event_date)` |
| `src/components/staff/StaffEventCard.tsx` | `parseISO(event.event_date)` (2 places) | `parseDateFromLocalString()` + `format()` |
| `src/components/staff/StaffEventDetails.tsx` | `parseISO(event.event_date)` (2 places) | `parseDateFromLocalString()` + `format()` |
| `src/components/admin/events/EventWeekView.tsx` | `parseISO(event.event_date)` | `parseDateFromLocalString()` |
| `src/components/admin/events/EventMonthView.tsx` | `parseISO(event.event_date)` | `parseDateFromLocalString()` |
| `src/components/admin/events/EventSummaryPanel.tsx` | `parseISO(event.event_date)` | `parseDateFromLocalString()` |
| `src/components/admin/events/EventList.tsx` | `parseISO(...)` | `parseDateFromLocalString()` |

### Medium Priority -- Logic Bugs (wrong overdue/comparison calculations)
| File | Current (Buggy) | Fix |
|------|-----------------|-----|
| `src/components/admin/billing/PaymentList.tsx` | `parseISO(dueDate)` for overdue checks (lines 88, 103) | `parseDateFromLocalString(dueDate)` |
| `src/components/admin/mobile/MobileEstimateView.tsx` | `new Date(quote.event_date)` (2 places) | `parseDateFromLocalString()` |
| `src/services/EventDataService.ts` | `new Date(e.event_date)` for "events this week" KPI | `parseDateFromLocalString()` |
| `src/services/PaymentMilestoneService.ts` | `new Date(quote.event_date)` for schedule building | `parseDateFromLocalString()` |

### Low Priority -- Edge Functions (run in UTC, less affected)
These edge functions use `new Date(event_date)` but run server-side in UTC. They have a shared `dateHelpers.ts` already available but don't use it consistently. These will NOT be changed in this plan to avoid risk -- they can be addressed in a separate pass.

## Technical Approach

For each file:
1. Replace `parseISO` import from `date-fns` with `parseDateFromLocalString` from `@/utils/dateHelpers`
2. Replace `new Date(dateString)` calls with `parseDateFromLocalString(dateString)`
3. Keep `format()` from `date-fns` for display formatting (it works fine with correct Date objects)
4. Remove unused `parseISO` imports to keep code clean

## What Does NOT Change
- No database schema changes
- No API or edge function changes (deferred to separate pass)
- No RLS or security changes
- `date-fns` `format()` is still used for display formatting -- only the parsing step changes
- All existing `parseDateFromLocalString` usages remain untouched
- Time strings ("HH:MM") are exempt -- they don't go through Date objects

## Why This Is Safe
- `parseDateFromLocalString` is already battle-tested in 10+ files across the project
- It produces the exact same Date object as `parseISO` would in UTC+0, but correct in all timezones
- `format()` from `date-fns` accepts any valid Date, so display formatting is unaffected
- `isSameDay()`, `isAfter()`, `isEqual()`, `differenceInDays()` all work identically with either parsing method

