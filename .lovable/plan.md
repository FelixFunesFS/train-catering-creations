

# ReviewsImageStrip Enhancement Plan

## Overview

Enhance the Reviews page image strip to match the home page gallery's premium styling by adding:
- Ruby-tinted ring borders on hover
- Elevated shadows with glow effects
- Subtle gradient overlays
- Staggered entrance animations

## Current State Analysis

**ReviewsImageStrip (Current):**
- Basic `rounded-xl` containers
- Simple `shadow-md hover:shadow-lg`
- Basic `scale-105` zoom on hover
- No border effects
- No gradient overlays

**InteractiveGalleryPreview (Target Standard):**
- `border-2 border-transparent hover:border-ruby/30` ring borders
- `scale-110` zoom with smooth 700ms transition
- `bg-gradient-ruby-subtle` overlay on hover
- Staggered `bounce-in` animations
- Card-based structure with refined shadows

## Implementation Details

### File: `src/components/reviews/ReviewsImageStrip.tsx`

**Changes:**

1. **Add staggered animation hook** for sequential reveal
2. **Upgrade container styling** with ruby ring borders
3. **Add hover glow shadows** using existing design system
4. **Add ruby gradient overlay** on hover (subtle, matching home gallery)
5. **Increase zoom effect** from `scale-105` to `scale-110`

### Enhanced Component Structure

```tsx
// Each image container will have:
<div className="
  relative overflow-hidden rounded-xl 
  w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36
  border-2 border-transparent hover:border-ruby/30
  shadow-md hover:shadow-glow-strong
  transition-all duration-500
  group cursor-pointer
">
  {/* Image with enhanced zoom */}
  <img className="... group-hover:scale-110 transition-transform duration-700" />
  
  {/* Ruby gradient overlay on hover */}
  <div className="
    absolute inset-0 
    bg-gradient-ruby-subtle 
    opacity-0 group-hover:opacity-100 
    transition-opacity duration-300
  " />
</div>
```

### Styling Comparison

| Property | Before | After |
|----------|--------|-------|
| Border | None | `border-2 border-transparent hover:border-ruby/30` |
| Shadow | `shadow-md hover:shadow-lg` | `shadow-md hover:shadow-glow-strong` |
| Zoom | `scale-105` | `scale-110` |
| Zoom Duration | `300ms` | `700ms` |
| Overlay | None | `bg-gradient-ruby-subtle` on hover |
| Animation | Basic fade-up | Staggered entrance with index delays |

## Technical Notes

- Uses existing design system variables (`shadow-glow-strong`, `bg-gradient-ruby-subtle`)
- Maintains responsive sizing (w-24 to lg:w-36)
- Preserves lazy loading for performance
- Adds `group` class for coordinated hover effects
- Transition timing matches home gallery (500ms container, 700ms zoom)

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/reviews/ReviewsImageStrip.tsx` | Add ring borders, glow shadows, gradient overlay, enhanced animations |

