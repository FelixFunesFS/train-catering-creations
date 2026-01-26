
# Fix: Mobile Submissions Not Opening

## Problem Identified

When tapping on a new submission card on mobile devices, nothing happens. The submission should open the event detail view, but the click is silently ignored.

## Root Cause

In `SubmissionsCard.tsx`, the `handleClick` function has a conditional navigation bug:

```typescript
const handleClick = (event: QuoteRequest) => {
  if (onEventClick) {
    onEventClick(event);
  } else if (isDesktop) {  // BUG: Blocks mobile navigation
    navigate(`/admin/event/${event.id}`);
  }
  // On mobile: falls through and does NOTHING
};
```

The `else if (isDesktop)` condition means:
- Desktop: navigates to `/admin/event/{id}` - works correctly
- Mobile: no `onEventClick` prop exists, and `isDesktop` is false, so nothing happens

Meanwhile, the `EventList` component correctly handles this:
```typescript
const handleEventClick = (event: QuoteRequest) => {
  // Always navigate - route handles responsive rendering
  navigate(`/admin/event/${event.id}`);
};
```

## Solution

Remove the `isDesktop` condition so mobile clicks navigate to the event view. The route (`/admin/event/:quoteId`) already handles responsive rendering for both mobile and desktop.

## Implementation

### File: `src/components/admin/events/SubmissionsCard.tsx`

**Change (lines 43-49):**
```typescript
// BEFORE - Broken on mobile
const handleClick = (event: QuoteRequest) => {
  if (onEventClick) {
    onEventClick(event);
  } else if (isDesktop) {
    navigate(`/admin/event/${event.id}`);
  }
};

// AFTER - Works on all devices
const handleClick = (event: QuoteRequest) => {
  if (onEventClick) {
    onEventClick(event);
  } else {
    navigate(`/admin/event/${event.id}`);
  }
};
```

This is a one-line change: remove `if (isDesktop)` so navigation always occurs when no custom handler is provided.

### Optional Cleanup

Since `isDesktop` is no longer used in the component, we can also remove the unused import:

```typescript
// Remove this line (line 30):
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

## Technical Notes

- The `/admin/event/:quoteId` route renders `EventEstimateFullViewPage`, which already has responsive layouts for mobile and desktop
- This matches the existing behavior in `EventList.tsx` which always navigates regardless of device
- No database or API changes required
- Change is backward compatible with the optional `onEventClick` prop pattern

## Testing Checklist

- [ ] Tap submission card on mobile - should navigate to event view
- [ ] Click submission card on tablet - should navigate to event view  
- [ ] Click submission card on desktop - should navigate to event view
- [ ] Click "Review" button on desktop table row - should still work
- [ ] Verify EventList submissions still work on mobile (control test)
