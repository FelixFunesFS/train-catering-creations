

# Remove/Restyle Hero Carousel Control Buttons

## Overview

Address the visual competition between the carousel navigation controls (left/right arrows and play/pause button) and the primary CTAs in the hero section. The solution is to make these controls more subtle with glassmorphism styling so they don't compete with the main call-to-action buttons.

---

## Current State

### Desktop Controls (lines 290-303)
```tsx
<Button variant="ghost" size="icon" 
  className="bg-black/20 backdrop-blur-sm hover:bg-black/30 text-red-500">
```

### Mobile Controls (lines 218-225)
```tsx
<button className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/70 
  p-2 rounded-full min-w-[44px] min-h-[44px] ... shadow-lg border border-white/20">
```

**Issues:**
- Desktop uses `text-red-500` which is jarring
- Both layouts have visible arrow buttons that compete with CTAs
- The play/pause button adds visual clutter

---

## Recommended Solution

### Option A: Glassmorphism Controls (Recommended)

Make the controls ultra-subtle with transparent, frosted glass styling that only becomes visible on hover or focus:

**Desktop:**
- Change `bg-black/20` to `bg-white/10` for a lighter, more subtle appearance
- Change `text-red-500` to `text-white/70` for softer icons
- Add `opacity-60 hover:opacity-100` for reveal-on-hover behavior

**Mobile:**
- Remove the left/right arrow buttons entirely (rely on swipe gestures + auto-play)
- Keep swipe functionality which is already implemented
- This follows the memory recommendation to minimize visual clutter

---

## Implementation Details

### File: `src/components/home/SplitHero.tsx`

### Change 1: Desktop Controls (lines 291-302)

**Before:**
```tsx
<Button variant="ghost" size="icon" onClick={handlePrevious} 
  aria-label="Previous image" 
  className="bg-black/20 backdrop-blur-sm hover:bg-black/30 text-red-500">
  <ArrowLeft className="h-5 w-5" />
</Button>

<Button variant="ghost" size="icon" onClick={togglePlayPause} 
  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'} 
  className="bg-black/20 backdrop-blur-sm hover:bg-black/30 text-red-500">
  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
</Button>

<Button variant="ghost" size="icon" onClick={handleNext} 
  aria-label="Next image" 
  className="bg-black/20 backdrop-blur-sm hover:bg-black/30 text-red-500">
  <ArrowRight className="h-5 w-5" />
</Button>
```

**After:**
```tsx
<Button variant="ghost" size="icon" onClick={handlePrevious} 
  aria-label="Previous image" 
  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white/70 hover:text-white opacity-60 hover:opacity-100 transition-all duration-200 border border-white/10">
  <ArrowLeft className="h-5 w-5" />
</Button>

<Button variant="ghost" size="icon" onClick={togglePlayPause} 
  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'} 
  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white/70 hover:text-white opacity-60 hover:opacity-100 transition-all duration-200 border border-white/10">
  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
</Button>

<Button variant="ghost" size="icon" onClick={handleNext} 
  aria-label="Next image" 
  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white/70 hover:text-white opacity-60 hover:opacity-100 transition-all duration-200 border border-white/10">
  <ArrowRight className="h-5 w-5" />
</Button>
```

### Change 2: Remove Mobile Arrow Buttons (lines 218-225)

**Before:**
```tsx
{/* Navigation Arrows */}
<button onClick={handlePrevious} className="absolute left-4 top-1/2 ...">
  <ArrowLeft className="h-4 w-4" />
</button>

<button onClick={handleNext} className="absolute right-4 top-1/2 ...">
  <ArrowRight className="h-4 w-4" />
</button>
```

**After:**
Remove entirely - mobile users can swipe left/right (already implemented) or tap the progress indicators.

---

## Visual Comparison

```text
BEFORE (Desktop):
┌────────────────────────────────────────────┐
│  [●●○]                      [◀][⏸][▶]     │  ← Dark buttons, red icons
│                                            │
│         [Image Area]                       │
│                                            │
│  ❤ Soul Train's Eatery                     │
└────────────────────────────────────────────┘

AFTER (Desktop):
┌────────────────────────────────────────────┐
│  [●●○]                      [◁][⏸][▷]     │  ← Frosted glass, subtle
│                                            │     60% opacity until hover
│         [Image Area]                       │
│                                            │
│  ❤ Soul Train's Eatery                     │
└────────────────────────────────────────────┘

BEFORE (Mobile):
┌─────────────────────────┐
│  [●●○]                  │
│                         │
│  [◀]    Image    [▶]   │  ← Arrow buttons visible
│                         │
└─────────────────────────┘

AFTER (Mobile):
┌─────────────────────────┐
│  [●●○]                  │  ← Clean, swipe to navigate
│                         │
│         Image           │  ← No arrow buttons
│                         │
└─────────────────────────┘
```

---

## Summary

| Change | Rationale |
|--------|-----------|
| Desktop: Glassmorphism controls | Subtle, elegant, doesn't compete with CTAs |
| Desktop: 60% opacity with hover reveal | Controls visible but not demanding attention |
| Mobile: Remove arrow buttons | Rely on swipe gestures (already implemented) |
| Fix `text-red-500` to `text-white/70` | Consistent color scheme |

This approach maintains full functionality while creating clear visual hierarchy where the CTAs are the focal point.

