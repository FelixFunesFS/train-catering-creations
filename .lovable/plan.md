
# Hero Section Mobile UX Fixes

## Overview

Fix four issues with the home page hero section:
1. Remove duplicate "Get Quote" floating badge on mobile
2. Fix hamburger menu contrast (white on white)
3. Fix play/pause button contrast on mobile
4. Remove desktop bouncing scroll arrow

---

## Issue 1: Remove Extra "Get Quote" Button on Mobile

**File: `src/components/home/SplitHero.tsx`**

The mobile view currently has TWO quote CTAs:
- Floating "Get Quote" badge over the image (lines 245-254)
- Main "Request Quote" button in content area (lines 278-284)

**Solution**: Remove the floating badge since the main CTA buttons are already within viewport in the content section.

### Lines to Remove (245-254):
```tsx
// DELETE THIS ENTIRE BLOCK:
{/* Floating CTA Badge - Always visible on mobile */}
<Link 
  to="/request-quote"
  className="absolute bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 bg-ruby/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-ruby transition-all duration-200 min-h-[44px] animate-pulse hover:animate-none"
  aria-label="Request a quote"
>
  <Sparkles className="h-4 w-4" />
  <span className="font-semibold text-sm">Get Quote</span>
</Link>
```

Also remove the `Sparkles` import since it's only used for that badge (line 6).

---

## Issue 2: Fix Hamburger Menu Contrast

**File: `src/components/Header.tsx`**

The hamburger icon uses hardcoded `stroke="white"` which doesn't adapt to the light background.

### Current (line 77):
```tsx
<svg className="h-10 w-10 md:h-12 md:w-12" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
```

### Updated:
```tsx
<svg className="h-10 w-10 md:h-12 md:w-12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
```

This uses `currentColor` which inherits from the parent's `text-foreground` class (already on the Button), ensuring proper contrast in both light and dark modes.

---

## Issue 3: Fix Play/Pause Button Contrast on Mobile

**File: `src/components/home/SplitHero.tsx`**

The play/pause button uses `text-white` but may lack contrast on lighter image areas.

### Current (lines 222-226):
```tsx
<Button variant="ghost" size="icon" onClick={togglePlayPause} className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 min-w-[44px] min-h-[44px]" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
```

### Updated:
```tsx
<Button variant="ghost" size="icon" onClick={togglePlayPause} className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 min-w-[44px] min-h-[44px] shadow-md" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
```

**Changes:**
- Increased background opacity: `bg-black/20` → `bg-black/40`
- Increased hover opacity: `bg-black/30` → `bg-black/50`
- Added `shadow-md` for additional separation

### Also update navigation arrows (lines 237-243):
```tsx
// Left arrow
<button onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 shadow-md" aria-label="Previous image">

// Right arrow  
<button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 shadow-md" aria-label="Next image">
```

---

## Issue 4: Remove Desktop Bouncing Arrow

**File: `src/components/home/SplitHero.tsx`**

### Lines to Remove (408-413):
```tsx
// DELETE THIS ENTIRE BLOCK:
{/* Scroll Indicator */}
<div className="absolute bottom-8 right-8 z-20">
  <Button variant="ghost" size="icon" onClick={handleScrollToDiscover} className="bg-muted/50 backdrop-blur-sm text-foreground hover:bg-muted animate-bounce" aria-label="Scroll to next section">
    <ChevronDown className="h-5 w-5" />
  </Button>
</div>
```

This removes the distracting bouncing arrow on desktop while keeping the scroll indicator on mobile (inside the content area, lines 293-298) which is more contextually appropriate.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/home/SplitHero.tsx` | Remove floating "Get Quote" badge, remove Sparkles import, increase control button contrast, remove desktop scroll arrow |
| `src/components/Header.tsx` | Change hamburger `stroke="white"` to `stroke="currentColor"` |

---

## Visual Before/After

### Mobile Hero Controls (Before):
```text
┌─────────────────────────────────────┐
│ [Soul Train's]     [⏯ light btn]   │
│                                     │
│  [◀]              [▶]               │
│                                     │
│              [✨ Get Quote] (pulse) │ ← REMOVE
└─────────────────────────────────────┘
│ Content with [Request Quote] [Call] │ ← KEEP
```

### Mobile Hero Controls (After):
```text
┌─────────────────────────────────────┐
│ [Soul Train's]     [⏯ dark btn]    │ ← Better contrast
│                                     │
│  [◀]              [▶]               │ ← Better contrast
│                                     │
└─────────────────────────────────────┘
│ Content with [Request Quote] [Call] │ ← Single CTA area
```

### Header Hamburger (Before/After):
```text
Before: stroke="white" → invisible on white header
After:  stroke="currentColor" → inherits text-foreground color
```

### Desktop Layout (Before/After):
```text
Before: [↓] bouncing arrow bottom-right
After:  Clean layout, no distracting animation
```
