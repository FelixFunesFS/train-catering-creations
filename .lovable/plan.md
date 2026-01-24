

# Increase Watermark Visibility - Higher Opacity

## Current Issue

The watermark at 15% opacity (`opacity-[0.15]`) is still not visible against the dark gradient overlay (`from-black/80 via-black/60 to-black/40`).

## Solution

Increase opacity to **20%** for clear visibility while maintaining the subtle watermark aesthetic.

### File: `src/pages/About.tsx` (line 50)

**Change:**
```tsx
// Current (line 50)
className="w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 object-contain opacity-[0.15]"

// Updated - increase opacity to 20%
className="w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 object-contain opacity-[0.20]"
```

## Technical Summary

| Property | Current | Updated |
|----------|---------|---------|
| Opacity | `0.15` (15%) | `0.20` (20%) |
| Position | `left-4/8/16` | No change |
| Z-index | `z-[8]` | No change |
| Size | `w-56/64/80` | No change |

This single change will make the watermark noticeably visible as a subtle brand element behind the "Our Story" text content.

