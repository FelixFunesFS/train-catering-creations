

## Fix Staff View: Show the Right Events with Clear Status

### Problem

The staff schedule shows the wrong events. Events with payments (`awaiting_payment`, `paid`) are excluded, while unconfirmed estimates are included with no visual distinction. Staff cannot tell which events are definitely happening versus which are just proposals.

### Current Database Reality

| Event | Status | In Staff View? | Should Be? |
|-------|--------|---------------|------------|
| Teacher/staff Lunch | estimated | Yes | Yes (but marked as tentative) |
| Spring Graduation Brunch | awaiting_payment | **No** | **Yes -- has deposit** |
| Military Bal | estimated | Yes | Yes (but marked as tentative) |
| USCG Chiefs Dinner | approved | Yes | Yes |
| Super Bowl Test | awaiting_payment | **No** | **Yes -- has payments** |
| The Young Wedding | estimated | Yes | Yes (but marked as tentative) |

### Changes

**1. Fix the status filter in `useStaffEvents.ts` (line 300)**

Update the `.in()` filter to include payment-active statuses:

```text
Before: ['confirmed', 'approved', 'quoted', 'estimated']
After:  ['confirmed', 'approved', 'quoted', 'estimated', 'awaiting_payment', 'paid']
```

This ensures events with deposits or full payment appear in the staff schedule.

**2. Add a confirmation status badge to `StaffEventCard.tsx`**

Add a visual indicator next to the countdown badge showing the event's confirmation state:

- "Confirmed" (green) -- for `confirmed`, `awaiting_payment`, `paid` statuses (these events are definitely happening)
- "Tentative" (amber/outline) -- for `estimated`, `quoted`, `approved` statuses (these are not yet committed)

This gives staff instant clarity on which events to prioritize prep for.

The `workflow_status` field is already available on the `StaffEvent` interface but is never rendered. This change surfaces it.

**3. Add the same status indicator to `StaffEventDetails.tsx` header**

Show the confirmation badge in the detail view header card, next to the countdown badge, so staff see the status in both the list and detail views.

### Technical Details

**File: `src/hooks/useStaffEvents.ts`**
- Line 300: Add `'awaiting_payment'` and `'paid'` to the `.in()` array

**File: `src/components/staff/StaffEventCard.tsx`**
- Add a helper function `getConfirmationBadge(status)` that returns label and color
- Render the badge in the header row alongside the countdown badge
- Statuses mapped:
  - `confirmed`, `awaiting_payment`, `paid` -> "Confirmed" with green styling
  - `approved` -> "Approved" with blue styling  
  - `estimated`, `quoted` -> "Tentative" with amber/outline styling

**File: `src/components/staff/StaffEventDetails.tsx`**
- Import/add the same `getConfirmationBadge` helper
- Render in the header card next to the countdown badge (line 280 area)

### What Does NOT Change

- No financial data is exposed (the staff view correctly excludes pricing)
- No database or RLS changes needed (staff already have SELECT on quote_requests)
- The filter tabs (Today/This Week/All) continue to work as before
- The detail view sections (menu, equipment, staff assignments) are unchanged
- The responsive layout (mobile list/detail, desktop split panel) is unchanged
- The calendar subscription feed is unchanged

### Risk Assessment

| Change | Risk | Reason |
|--------|------|--------|
| Add statuses to filter | None | RLS already grants staff SELECT on quote_requests |
| Add confirmation badge to card | None | Pure display, uses existing `workflow_status` field |
| Add confirmation badge to details | None | Same field, same component pattern |
