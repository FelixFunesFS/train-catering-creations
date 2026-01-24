

# Fix "Our Story" Watermark Visibility

## Problem Analysis

The watermark logo is currently invisible due to:

1. **Z-index layering issue** - Content at `z-10` covers the watermark at `z-[5]`
2. **Positioned behind the photo card** - Right-aligned watermark sits exactly where the photo is placed
3. **Low contrast** - 12% opacity against `from-black/80 via-black/60 to-black/40` gradient makes it invisible
4. **Gradient overlay covers it** - The dark gradient overlay is applied after the background image but before the watermark, dimming it further

## Solution

Reposition the watermark and increase visibility:

### File: `src/pages/About.tsx` (lines 44-52)

**Current positioning (hidden behind photo):**
```
right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 z-[5] opacity-[0.12]
```

**New positioning (visible on the left side, behind text content):**
- Move to the **left side** of the section (where the text is)
- Increase z-index to appear above the gradient overlay
- Increase opacity to 15-18% for better visibility against dark background
- Position slightly offset from center-left for visual balance

```tsx
{/* Watermark Logo - repositioned to left side for visibility */}
<div className="absolute left-4 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 pointer-events-none z-[8]">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 object-contain opacity-[0.15]"
  />
</div>
```

## Visual Result

```
┌─────────────────────────────────────────────────────────┐
│  [Dark Background Image]                                │
│                                                         │
│  ╭─────────────╮                                        │
│  │    🍴       │  Our Story                             │
│  │  WATERMARK  │  Soul Train's Eatery was...   [Photo]  │
│  │   (15%)     │  ...                                   │
│  ╰─────────────╯  [See Our Work]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technical Details

| Property | Before | After |
|----------|--------|-------|
| Position | `right-4/8/16` | `left-4/8/16` |
| Z-index | `z-[5]` | `z-[8]` |
| Opacity | `0.12` (12%) | `0.15` (15%) |
| Size | `w-48/56/64` | `w-56/64/80` (slightly larger) |

This places the watermark behind the text content where it will be visible as a subtle brand element without competing with the photo or being hidden by it.

