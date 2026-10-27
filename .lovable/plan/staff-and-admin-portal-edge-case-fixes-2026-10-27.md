# Staff and Admin Portal Edge Case Fixes

These are the four fixes from the last review. Each one gets checked against the current code first, and anything already fixed gets skipped.

## What changes for you
1. **iPad event details:** On iPad, the menu, equipment and notes sections on an event open fully. They no longer act like the phone layout or get squished.
2. **Month view taps:** Tapping a grey day from the month before or after jumps to that month and shows that day's events. Right now it shows nothing.
3. **Short names on shifts:** Staff can confirm shifts saved under a short form of their name, like "Mike" for Michael or a first name only. It works only when exactly one person on that event matches, so no one can confirm someone else's shift.
4. **Unmatched crew warning:** In the admin crew list, a small "No staff login matches" note appears next to any name that doesn't match a staff account. That way you can fix typos before the event.

## Technical details
- StaffEventDetails: replace `useIsMobile()` layout branching with Tailwind `md:` classes (768px rule), and make the collapsibles default to open on `md+`.
- StaffMonthView: when the tapped cell is outside the current month, switch to that month (updating the `?m=` URL param) and set the active day. Add a test in monthGrid.test.ts.
- Migration: update `confirm_my_staff_assignment` matching to accept the first name or a known nickname (small alias table in the function) only when that is the single matching row on the quote. Keep the admin bypass.
- StaffAssignmentPanel: compare assignment names against the staff email/name list (same normalize helper as myShift.ts) and show a muted warning badge. Add tests in myShift tests for the alias and uniqueness rules.
- Verify: typecheck, bun tests, Playwright at 375/768/1280 on public routes (a staff session can't be created for this project).
