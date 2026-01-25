

# Hero Section Review and Enhancement Plan

## Current State Analysis

The home page hero (`SplitHero.tsx`) currently has two distinct layouts:

**Mobile/Tablet (up to 1023px):**
- Full-screen overlay design with image carousel
- Content overlaid on images with gradient for readability
- Height set to `85vh` which may cause content cutoff on some tablets

**Desktop (1024px and above):**
- 60/40 split layout (60% image, 40% content panel)
- Clean separation between visual and text content
- Full screen height (`h-screen`)

## Issue Identified: Tablet Content Cutoff

The tablet view may experience content cutoff due to:
1. Fixed `h-[85vh]` height not accounting for tablet viewport variations
2. Content positioned at `bottom-[15%]` which can push elements off-screen
3. `max-w-md` constraint limiting content width on larger tablets (768px-1023px)

## Recommendation: Enhanced Tablet-Specific Optimizations

Rather than switching to a full-width desktop hero (which would sacrifice the clean content separation that improves readability), I recommend targeted tablet improvements:

### Option A: Tablet-Specific Refinements (Recommended)

Adjust the mobile/tablet layout to better accommodate tablet screens:
- Increase height from `h-[85vh]` to `h-[90vh] sm:h-[92vh]` for tablets
- Adjust content positioning from `bottom-[15%]` to `bottom-[12%] sm:bottom-[10%]`
- Expand content width from `max-w-md` to `max-w-md sm:max-w-lg` for tablets
- Add responsive padding adjustments

### Option B: Full-Width Desktop Hero

Convert the desktop layout to match the mobile/tablet full-width overlay approach:
- Removes the 60/40 split entirely
- Single unified layout across all devices
- Content overlaid on full-screen imagery
- More dramatic, cinematic presentation

**Trade-offs:**
- Gains more visual impact from catering photography
- Loses dedicated content area which aids readability
- Increases risk of text-over-image accessibility issues

## Implementation Plan (Option A - Recommended)

### Step 1: Adjust Tablet Height and Positioning

Update the mobile/tablet section (lines 202-280) to use responsive values:

```text
Before:
- section: h-[85vh]
- content: bottom-[15%]
- container: max-w-md

After:
- section: h-[85vh] sm:h-[90vh] md:h-[92vh]
- content: bottom-[12%] sm:bottom-[10%]
- container: max-w-md sm:max-w-lg md:max-w-xl
```

### Step 2: Enhance Trust Marquee Spacing

Adjust the top trust marquee for better tablet visibility:

```text
Before: top-12
After: top-14 sm:top-16
```

### Step 3: Responsive CTA Button Sizing

Ensure buttons don't overflow on tablet landscape:

```text
Before: flex-col sm:flex-row gap-2 sm:gap-3
After: flex-col sm:flex-row gap-3 sm:gap-4
```

---

## Technical Changes Summary

**File: `src/components/home/SplitHero.tsx`**

1. Update section height classes (line 202)
2. Adjust content overlay positioning (line 240)
3. Expand content container width (line 241)
4. Refine trust marquee top offset (line 213)
5. Adjust CTA button gap spacing (line 261)

All changes are contained within the mobile/tablet conditional block, preserving the desktop 60/40 split layout.

