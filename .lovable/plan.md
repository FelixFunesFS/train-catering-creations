# Staff Portal Premium Finish Pass

Close the gaps found in the last review so the staff schedule looks premium and works on phone, tablet and desktop.

## 1. Redesign the event card
- Clean hairline-bordered card, no thick red stripe, no pink countdown pill, no red underlined venue.
- Layout: date block on the left (weekday / day number), then event name, serve time (12-hour), guests, and location in one muted dot-separated line.
- One small status dot + label (Confirmed / Tentative / Completed) instead of multiple colored badges.
- Remove tags that repeat the title (e.g. "Wedding" when the name already says it).
- Subtle crew indicator (avatars or "4 crew") at the bottom right.
- Past events: muted look, "Completed" label, no countdown, no confirm-shift button.

## 2. Replace the bulky stat cards
- Single-line summary under the header: "3 events · 3,740 guests · 4 crew".
- Hidden when the current view has no events (no more sliced zero cards).

## 3. Header, search and layout fixes
- One sticky bar that respects the phone notch area so nothing slides under it and gets clipped.
- Search built into the sticky bar with a clear (x) button.
- Phone vs tablet/desktop switching done with screen-size styling (768px breakpoint), not script-based detection.
- Polished empty states: small icon, short title, one helpful line.

## 4. Month and History edge cases
- Hide shift confirmation and countdowns on past events everywhere (cards, detail panel).
- All date handling through the shared local-date parser (no timezone shifts).
- Swipe on month view only triggers on clear horizontal swipes, not while scrolling vertically.
- Desktop detail panel clears when search or filter yields no matches.

## 5. Verify and iterate
- Sign in as a staff/admin test user in a headless browser and screenshot Today, Week, Upcoming, Month and History at 375, 768 and 1280 widths.
- Fix any overlap, clipping or spacing issues found and re-screenshot until clean.
- Run the existing staff tests plus month-grid tests.

## Technical details
- Files: `StaffEventCard.tsx` (rewrite), `StaffSchedule.tsx` (header/summary/search/breakpoints), `StaffMonthView.tsx` (swipe threshold, parse helper), `StaffHistoryList.tsx`, staff detail component (hide confirm on past).
- Theme tokens only; no hardcoded colors. No database or business-rule changes; staff still see zero financial data.
