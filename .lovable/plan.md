

# Mobile UX Improvements for Admin Events View

After reviewing the codebase, here are the issues identified and the proposed fixes:

## Issues Found

1. **Filter buttons overflow on mobile** — The 5 status pills (All, Pending, Confirmed, Completed, Cancelled) plus the "All Services" dropdown take too much horizontal space on small screens.

2. **ViewHelpCard expanded by default** — Takes up valuable screen real estate on mobile before users can see actual content.

3. **Icon-only action buttons have no labels on mobile** — The Eye, Mail/MailOpen, Globe, Phone, and DollarSign icons on mobile cards rely on Tooltip (hover-only, useless on touch devices). Users have no way to know what they mean.

4. **Redundant/mismatched badges on mobile** — Mobile cards show both an event status badge (e.g., "Confirmed") AND an estimate status badge ("Est: Sent" or "Est: Approved") which can be confusing. Desktop shows these in separate columns with headers, but mobile stacks them without context.

## Plan

### 1. Compact Mobile Filters — Dropdown for Status + Service Type

Replace the 5 status pill buttons with a single Select dropdown on mobile only. Keep pills on desktop where space allows.

**File:** `src/components/admin/events/EventFilters.tsx`
- Wrap status pills in a `hidden sm:flex` container
- Add a `sm:hidden` Select dropdown for status filter on mobile
- Result: two compact dropdowns side-by-side on mobile (Status + Service Type)

### 2. Collapse Tips by Default + Add Icon Legend

**File:** `src/components/admin/help/ViewHelpCard.tsx`
- Change default `isCollapsed` to `true` (show collapsed by default; users who haven't dismissed it yet still see the "Show tips" link)

**File:** `src/components/admin/help/helpContent.ts`
- Add icon legend tips to the events help content explaining what the action icons mean:
  - Eye = View Event/Estimate
  - Mail/MailOpen = Email sent/opened
  - Globe = Customer viewed portal
  - Phone = Call customer
  - DollarSign = Send payment reminder

### 3. Add Visible Icon Labels on Mobile Cards

**File:** `src/components/admin/events/EventList.tsx` (mobile card section, ~lines 458-548)
- Replace tooltip-wrapped icon buttons with small labeled indicators on mobile. Instead of bare icons, show tiny text labels next to them (e.g., `📧 Sent`, `👁 Viewed`, `📞 Call`). This makes the mobile cards self-documenting.
- Use a compact row of labeled chips/tags instead of icon-only buttons.

### 4. Simplify Mobile Badge Display

**File:** `src/components/admin/events/EventList.tsx` (mobile card section, ~lines 428-456)
- On mobile, show only ONE combined status indicator instead of separate event status + estimate status badges:
  - If invoice exists: show estimate workflow status as the primary badge (it's more granular and actionable)
  - Remove the top-right event status badge when the estimate badge is present (they're redundant — "Confirmed" event status alongside "Est: Approved" is confusing)
  - Keep payment status badge (it's distinct information)
- Desktop table remains unchanged (separate columns provide clear context)

## Files Modified

| File | Change |
|------|--------|
| `EventFilters.tsx` | Status pills → dropdown on mobile |
| `ViewHelpCard.tsx` | Default to collapsed |
| `helpContent.ts` | Add icon legend to events tips |
| `EventList.tsx` | Labeled mobile icons + simplified badges |

## Design Principles

- All changes are mobile-only or additive — desktop layout untouched
- No data flow or workflow changes
- Tooltips kept for desktop; labels added for mobile touch users
- Progressive disclosure maintained (tips collapsed, expandable on demand)

