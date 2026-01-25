
# Remove About Hero Background Image

## Overview

Remove the background image from the About page hero section, simplifying it to use just the standard gradient background (`bg-gradient-hero`) inherited from the page container.

## Current State (Lines 78-111)

The hero section currently has:
- Background image (`teamWesternGroup`)
- 85% opacity overlay (`bg-background/85`)
- Top gradient fade
- Bottom gradient fade
- PageHeader content with `z-20`

## Changes

### File: `src/pages/About.tsx`

**Remove these elements from the hero section:**
1. Background image div (lines 80-85)
2. Overlay div (lines 87-88)
3. Top gradient fade div (lines 90-91)
4. Bottom gradient fade div (lines 93-94)
5. Remove `relative` and `overflow-hidden` from section (no longer needed)
6. Remove `z-20` from content wrapper (no longer needed)

**Also:**
- Remove unused `teamWesternGroup` import (line 15)

## Before vs After

**Before:**
```tsx
<section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
  {/* Background image */}
  <div style={{ backgroundImage: `url(${teamWesternGroup})` }} />
  {/* Overlay */}
  <div className="bg-background/85" />
  {/* Top/bottom gradient fades */}
  <div className="relative z-20">
    <PageHeader ... />
  </div>
</section>
```

**After:**
```tsx
<section className="py-8 sm:py-10 lg:py-12">
  <PageHeader ... />
</section>
```

## Technical Notes

- The page already has `bg-gradient-hero` on the root container, so the hero will inherit that subtle gradient
- This matches the simpler hero styling used on other pages like FAQ and Reviews
- The `teamWesternGroup` import can be removed since it won't be used anywhere else on this page

## File to Modify

| File | Changes |
|------|---------|
| `src/pages/About.tsx` | Remove background image, overlay, gradients from hero; remove unused import |
