# Admin–Staff Portal Sync Fix Pass

Goal: staff see the same approved event details admins see, calendars match the portal, confirmations show up instantly for admins, private notes stay private, and tablets get a proper layout.

## 1. Staff see the admin-approved menu
- Step one: sign in as staff and check whether the approved estimate shows up (we haven't confirmed yet that staff are blocked from reading it).
- If they are blocked: give staff read-only access to just the estimate ID and event link. Prices and totals stay hidden.
- Staff then see the final menu and equipment list instead of the original request.

## 2. Phone calendar matches the portal
- Add "awaiting payment" and "paid" events to the calendar subscription feed so it shows the same events as the staff portal.

## 3. Admins see shift confirmations right away
- When a staff member confirms a shift, the admin's crew panel refreshes and shows the green check with no reload.

## 4. Keep internal notes private
- The staff portal only shows notes that aren't marked internal. Billing and customer-communication notes are hidden from field staff.

## 5. Shift matching that holds up
- Matching now ignores case, spacing and punctuation, and also matches on the first-name part of an email.
- If a shift can't be matched, the admin's crew panel shows a "no portal account matched" hint so the admin can fix the name.

## 6. Past events that were never closed out
- Events whose date has passed but are still marked as upcoming appear in History with a "Pending close-out" label instead of "Completed".

## 7. Tablet layout (768–1023px)
- Phones (under 768px): single column. Tablets and up: list beside details. Screen size is handled by the page layout itself instead of the current 1024px code check, following the project rule.

## 8. Verify
- Run the existing tests, plus new tests for shift name matching and the status list shared by the calendar and portal.
- Take screenshots at 375, 768 and 1280px. A live staff sign-in may not be available here, so anything I can't check gets reported.

## Technical details
- Migration (only if the step 1 check confirms the block): add a staff SELECT policy on `invoices` using `has_role(auth.uid(),'staff')`, and limit the staff query to `id, quote_request_id`.
- `supabase/functions/staff-calendar-feed/index.ts`: import the shared status list (`STAFF_VISIBLE_STATUSES` + `cancelled`) so the feed and portal can't drift apart.
- `MyShiftBanner.tsx`: also invalidate `['staff-assignments']`.
- `useStaffEvents.ts`: add `.eq('is_internal', false)` to the admin_notes query.
- `myShift.ts`: tighter name normalization; unmatched hint in `StaffAssignmentPanel.tsx`.
- `StaffSchedule.tsx` / `StaffEventDetails.tsx`: replace `useIsMobile` branches with `md:` Tailwind layouts.
