

# Hero Section Mobile & Tablet UX Fixes

## Overview

Address three issues with the home page hero section:
1. Remove the bouncing scroll arrow from mobile view
2. Remove the play/pause button from mobile view
3. Ensure tablet view (768px-1024px) has no horizontal scrolling or overlapping elements

---

## Issue 1: Remove Bouncing Arrow on Mobile

**File: `src/components/home/SplitHero.tsx`**

The mobile content area still has a bouncing scroll indicator that should be removed for a cleaner UX.

### Current Code (Lines 271-276):
```tsx
{/* Scroll Indicator - Integrated into content */}
<div className="pt-8 flex justify-center">
  <Button variant="ghost" size="icon" onClick={handleScrollToDiscover} className="bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground animate-bounce min-w-[44px] min-h-[44px]" aria-label="Scroll to next section">
    <ChevronDown className="h-4 w-4" />
  </Button>
</div>
```

### Solution:
Delete this entire block (lines 271-276).

---

## Issue 2: Remove Play/Pause Button on Mobile

**File: `src/components/home/SplitHero.tsx`**

The play/pause control should be hidden on mobile for a cleaner interface. Users can still swipe or use the navigation arrows to browse images.

### Current Code (Lines 209-214):
```tsx
{/* Controls */}
<div className="absolute top-4 right-4 z-20 flex space-x-2">
  <Button variant="ghost" size="icon" onClick={togglePlayPause} className="bg-black/60 backdrop-blur-sm hover:bg-black/70 min-w-[44px] min-h-[44px] shadow-lg border border-white/20 text-primary" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
  </Button>
</div>
```

### Solution:
Delete this entire block (lines 209-214). The auto-play will continue seamlessly, and users can navigate via swipe gestures or the navigation arrows.

---

## Issue 3: Tablet View Responsiveness (768px-1024px)

**Analysis:**

The current `useIsMobile` hook uses `768px` as the breakpoint, meaning:
- **Below 768px**: Mobile layout (stacked)
- **768px and above**: Desktop layout (60/40 split)

The desktop layout uses:
- `w-3/5` (60%) for the image area
- `w-2/5` (40%) for the content area

On tablets (768px-1024px), this split may feel cramped but should not cause horizontal scrolling since percentage-based widths are fluid.

### Potential Issues to Check:
1. Fixed-width elements that could overflow
2. Padding/margin that could cause content to exceed viewport

### Current Desktop Layout Structure:
```tsx
<section className="relative h-screen overflow-hidden bg-background flex pb-8 lg:pb-16">
  <div className="relative w-3/5 h-full overflow-hidden"> {/* Image: 60% */}
  <div className="relative w-2/5 h-full bg-background p-8 lg:p-12 flex flex-col justify-center"> {/* Content: 40% */}
```

### Solution - Add Tablet-Specific Refinements:

1. **Adjust content padding for tablets**: Currently uses `p-8 lg:p-12`. For tablets, `p-6` would provide more breathing room.

2. **Add `md:` breakpoint for text sizing**: Ensure text doesn't overflow on smaller tablet screens.

**Updated Desktop Content Area (Line 327):**
```tsx
<div ref={contentRef} className={`relative w-2/5 h-full bg-background p-6 md:p-8 lg:p-12 flex flex-col justify-center ${contentAnimationClass}`} role="region" aria-label="Content section">
```

**Updated Title Sizing (Line 337):**
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight">
```

**Updated CTA Buttons (Lines 349-361):**
Ensure buttons stack on smaller tablets if needed:
```tsx
<div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
```

---

## Summary of Changes

| File | Lines | Change |
|------|-------|--------|
| `src/components/home/SplitHero.tsx` | 209-214 | Remove play/pause button from mobile |
| `src/components/home/SplitHero.tsx` | 271-276 | Remove bouncing scroll indicator from mobile |
| `src/components/home/SplitHero.tsx` | 327 | Adjust tablet padding: `p-6 md:p-8 lg:p-12` |
| `src/components/home/SplitHero.tsx` | 337 | Add tablet text size: `text-3xl md:text-4xl lg:text-5xl` |
| `src/components/home/SplitHero.tsx` | 349 | Responsive CTA stacking: `flex-col md:flex-row` |

---

## Visual Comparison

### Mobile View (Before):
```text
┌─────────────────────────────────────┐
│ [Soul Train's]     [⏯ play/pause]  │ ← REMOVE
│                                     │
│  [◀]              [▶]               │
│                                     │
└─────────────────────────────────────┘
│ Content Area                        │
│ [Request Quote] [Call Now]          │
│                                     │
│            [↓ bounce]               │ ← REMOVE
└─────────────────────────────────────┘
```

### Mobile View (After):
```text
┌─────────────────────────────────────┐
│ [Soul Train's]                      │ ← Cleaner top bar
│                                     │
│  [◀]              [▶]               │ ← Navigation arrows remain
│                                     │
└─────────────────────────────────────┘
│ Content Area                        │
│ [Request Quote] [Call Now]          │
│                                     │ ← No distracting elements
└─────────────────────────────────────┘
```

### Tablet View (768px-1024px):
```text
Before (cramped):
┌──────────────────────────────────────────────────────────────┐
│ [────────── 60% Image ──────────] │ [──40% Content──]        │
│                                   │  p-8 (too much)          │
│                                   │  text-4xl (may clip)     │
└──────────────────────────────────────────────────────────────┘

After (optimized):
┌──────────────────────────────────────────────────────────────┐
│ [────────── 60% Image ──────────] │ [──40% Content──]        │
│                                   │  p-6 (breathing room)    │
│                                   │  text-3xl (fits better)  │
│                                   │  CTAs stack if needed    │
└──────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

- The `overflow-hidden` on the main section prevents horizontal scrolling
- Percentage-based widths (`w-3/5`, `w-2/5`) are inherently fluid and responsive
- The `ChevronDown` import can remain since it may be used elsewhere (no cleanup needed)
- Auto-play continues on mobile without the play/pause button - users can swipe to navigate
- Navigation arrows provide explicit manual control on mobile

