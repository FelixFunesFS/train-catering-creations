

# Fix Mobile Responsiveness and Prevent Horizontal Scrolling

## Problem Summary

The mobile preview at `/admin/event/:quoteId` (MobileEstimateView) may have horizontal scrolling issues due to:

1. **Missing CSS class**: `safe-area-inset-bottom` is used as a class (line 751) but this class is not defined in CSS - it should use the env() function directly via Tailwind's arbitrary value syntax
2. **Potential content overflow**: Some elements may extend beyond the viewport width
3. **Fixed bottom action bar**: May not properly account for safe area insets

## Root Causes Identified

### Issue 1: Non-existent `safe-area-inset-bottom` class
In `MobileEstimateView.tsx` line 751:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 safe-area-inset-bottom">
```

The class `safe-area-inset-bottom` doesn't exist. Other components correctly use:
- `pb-[env(safe-area-inset-bottom)]` or
- `pb-[calc(1rem+env(safe-area-inset-bottom))]`

### Issue 2: Root container missing overflow protection
The main container `div` at line 232 doesn't have `overflow-x-hidden`:
```tsx
<div className="min-h-screen flex flex-col bg-background">
```

### Issue 3: Potential text/badge overflow
Long event names and badge content may not wrap properly, especially in the header where `max-w-[180px]` is applied but parent may not constrain width.

## Technical Implementation

### File: `src/components/admin/mobile/MobileEstimateView.tsx`

#### Change 1: Fix root container (line 232)
Add `overflow-x-hidden` to prevent any child elements from causing horizontal scroll:

```tsx
// BEFORE
<div className="min-h-screen flex flex-col bg-background">

// AFTER
<div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
```

#### Change 2: Fix header container width constraint (lines 234-253)
Ensure header content stays within bounds:

```tsx
// BEFORE
<header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between">

// AFTER  
<header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between w-full max-w-full">
```

And add `min-w-0` to the flex child to allow text truncation:
```tsx
// BEFORE
<div className="flex items-center gap-3">

// AFTER
<div className="flex items-center gap-3 min-w-0 flex-1">
```

#### Change 3: Fix bottom action bar safe area (line 751)
Replace non-existent class with proper Tailwind arbitrary value:

```tsx
// BEFORE
<div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 safe-area-inset-bottom">

// AFTER
<div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
```

#### Change 4: Ensure ScrollArea content doesn't overflow (line 257)
Add `w-full` and `max-w-full` to constrain content:

```tsx
// BEFORE
<div className="p-4 space-y-4 pb-32">

// AFTER
<div className="p-4 space-y-4 pb-32 w-full max-w-full">
```

#### Change 5: Fix Customer Edit Dialog width (line 796)
The dialog uses a calc-based width that could overflow on very small screens:

```tsx
// BEFORE
<DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">

// AFTER
<DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
```

## Changes Summary

| Line | Before | After |
|------|--------|-------|
| 232 | `min-h-screen flex flex-col bg-background` | `min-h-screen flex flex-col bg-background overflow-x-hidden` |
| 234 | `sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between` | `sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between w-full` |
| 235 | `flex items-center gap-3` | `flex items-center gap-3 min-w-0 flex-1` |
| 257 | `p-4 space-y-4 pb-32` | `p-4 space-y-4 pb-32 w-full` |
| 751 | `safe-area-inset-bottom` | `pb-[calc(1rem+env(safe-area-inset-bottom))]` |
| 796 | `w-[calc(100vw-2rem)] max-w-md` | `w-full max-w-[calc(100vw-2rem)] sm:max-w-md` |

## Technical Notes

- The global CSS already has `overflow-x: hidden` on `html, body, #root` (lines 318-322), but adding it to the component root provides defense-in-depth
- The `min-w-0` on flex children is a critical pattern for allowing text truncation to work properly in flex layouts
- Using `pb-[calc(1rem+env(safe-area-inset-bottom))]` ensures the bottom action bar is both padded and respects iOS safe areas (notch/home indicator)
- These changes maintain all existing functionality while preventing horizontal overflow

## Files Modified

1. `src/components/admin/mobile/MobileEstimateView.tsx` - 6 class changes to prevent horizontal scrolling

## Testing Verification

After implementation:
- [ ] View on mobile device (375px width) - no horizontal scrolling
- [ ] View on tablet (768px width) - no horizontal scrolling
- [ ] Long event names truncate properly in header
- [ ] Bottom action bar respects iOS safe area
- [ ] Customer edit dialog doesn't overflow on small screens
- [ ] All interactive elements remain accessible

