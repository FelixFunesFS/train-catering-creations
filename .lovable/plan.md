
# Position First Hero Image 20% Lower

## Overview
Adjust the vertical focal point of the first hero image (charcuterie board / "Artisan Creations") to show more of the lower portion of the image, without affecting the positioning of the other two carousel images.

## Current State
The `getImageObjectPosition()` function returns:
- Index 0 (charcuterie): `"object-center"` (centered at 50% 50%)
- Index 1 (spread): `"object-left-center"` (left-aligned, vertically centered)
- Index 2 (event space): `"object-center"` (centered at 50% 50%)

## Solution
Modify the `getImageObjectPosition()` function to return a custom position for index 0 that shifts the vertical focal point from 50% to 70% (20% lower).

### Technical Details

**File:** `src/components/home/SplitHero.tsx`

**Change:** Update the `getImageObjectPosition` function (lines 187-194)

```text
Current:
  if (index === 1) {
    return "object-left-center";
  }
  return "object-center";

Updated:
  if (index === 0) {
    return "object-[center_70%]";  // 20% lower than center (50% + 20%)
  }
  if (index === 1) {
    return "object-left-center";
  }
  return "object-center";
```

The Tailwind arbitrary value `object-[center_70%]` translates to `object-position: center 70%`, which keeps the horizontal position centered while moving the vertical focal point 20% lower (from the default 50% to 70%).

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/SplitHero.tsx` | Add index 0 case to `getImageObjectPosition()` function |

## Visual Result
- First image (charcuterie): Focal point shifted 20% lower, showing more of the bottom of the image
- Second image (spread): Unchanged - remains left-center aligned
- Third image (event space): Unchanged - remains centered
