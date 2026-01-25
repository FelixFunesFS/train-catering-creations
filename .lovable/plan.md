

# Fix Mobile Hero Text Contrast & Tablet Responsiveness

## Problem Summary

1. **White-on-white text**: The secondary "Call Now" button has `text-primary` class on the inner `<a>` tag that overrides the intended `text-white` styling
2. **Tablet layout**: Tablets (768px+) currently receive the desktop split layout, which may not be optimal for smaller tablets

---

## Root Cause Analysis

### Button Contrast Issue

**Location**: `src/components/home/SplitHero.tsx`, lines 259-264

```tsx
// Current code - PROBLEM
<Button variant="outline" size="lg" 
  className="w-full sm:flex-1 border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 min-h-[48px] shadow-lg" 
  asChild>
  <a href="tel:8439700265" className="flex items-center justify-center gap-2 text-primary">
    <Phone className="h-4 w-4" />
    <span>Call Now</span>
  </a>
</Button>
```

**Issue**: The `text-primary` class on the `<a>` element overrides the `text-white` class on the parent Button, causing red/ruby text on a semi-transparent white background instead of white text.

### Tablet Breakpoint

**Current behavior**:
- `useIsMobile()` returns `true` only for screens < 768px
- Tablets (768px-1024px) get the desktop 60/40 split layout

---

## Technical Solution

### File: `src/components/home/SplitHero.tsx`

#### Fix 1: Remove Conflicting `text-primary` Class (line 260)

```tsx
// Before
<a href="tel:8439700265" className="flex items-center justify-center gap-2 text-primary">

// After - Remove text-primary, let parent text-white apply
<a href="tel:8439700265" className="flex items-center justify-center gap-2">
```

This allows the Button's `text-white` class to properly cascade to the child elements.

#### Fix 2: Improve Tablet Detection (optional enhancement)

Extend mobile layout to include tablets (up to 1024px) for better portrait tablet experience:

**Option A**: Update `useIsMobile` hook breakpoint from 768 to 1024
**Option B**: Keep current breakpoint but ensure the 60/40 split works well on tablets

For this fix, we'll use **Option A** as the mobile overlay layout is better suited for portrait tablets.

### File: `src/hooks/use-mobile.tsx`

```tsx
// Current
const MOBILE_BREAKPOINT = 768

// Updated - Include tablets in mobile layout
const MOBILE_BREAKPOINT = 1024
```

---

## Implementation Steps

| Step | File | Change |
|------|------|--------|
| 1 | `src/components/home/SplitHero.tsx` | Remove `text-primary` from secondary button's `<a>` tag |
| 2 | `src/hooks/use-mobile.tsx` | Update breakpoint from 768 to 1024 |

---

## Visual Result

### Button Contrast Fix

| Element | Before | After |
|---------|--------|-------|
| Secondary button text | Ruby/red (`text-primary`) | White (`text-white` inherited) |
| Secondary button icon | Ruby/red | White |
| Contrast ratio | Low (red on semi-transparent) | High (white on semi-transparent dark) |

### Tablet Layout

| Screen Width | Before | After |
|--------------|--------|-------|
| < 768px | Mobile overlay | Mobile overlay |
| 768px - 1023px | Desktop split | Mobile overlay |
| ≥ 1024px | Desktop split | Desktop split |

---

## Alternative Consideration

If changing the global mobile breakpoint affects other components negatively, we could instead:

1. Create a dedicated `useIsTablet` hook
2. Update SplitHero to use `isMobile || isTablet` for the overlay layout
3. Keep other components using the original 768px breakpoint

However, the 1024px breakpoint is generally a better standard for distinguishing between tablet/mobile and desktop experiences.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/SplitHero.tsx` | Remove `text-primary` class from line 260 |
| `src/hooks/use-mobile.tsx` | Update `MOBILE_BREAKPOINT` from 768 to 1024 |

