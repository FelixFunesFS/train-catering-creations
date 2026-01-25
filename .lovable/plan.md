

# Gallery Section Background Enhancement

## Current State

The home page **InteractiveGalleryPreview** section currently uses `bg-background` (plain white), which breaks the established A-B-C-D alternating gradient pattern used across the site.

### Current Section Flow
```text
Hero           → Full-width image
Services       → Pattern C (gold)
Gallery        → Plain white ← BREAKS PATTERN
About          → Pattern D (navy)
Testimonials   → Full-width image
Featured Venue → Pattern A (ruby)
Marquee        → Gray band
CTA            → Crimson gradient
```

---

## Recommended Solution: Pattern B Gradient

Apply the existing `bg-gradient-pattern-b` (platinum accent) to maintain the alternating rhythm. This is the cleanest approach that:
- Maintains visual consistency with the established design system
- Provides subtle visual separation without overwhelming the gallery images
- Requires minimal code changes

### Updated Section Flow
```text
Hero           → Full-width image
Services       → Pattern C (gold)
Gallery        → Pattern B (platinum) ← FIXED
About          → Pattern D (navy)
Testimonials   → Full-width image
Featured Venue → Pattern A (ruby)
```

---

## Implementation

### File Change: `src/components/home/InteractiveGalleryPreview.tsx`

**Current (line 162-165):**
```tsx
<section 
  ref={ref}
  className="py-12 sm:py-16 lg:py-20 bg-background"
>
```

**Updated:**
```tsx
<section 
  ref={ref}
  className="py-12 sm:py-16 lg:py-20 bg-gradient-pattern-b"
>
```

---

## Alternative: Full-Width Background Image

If you prefer a more dramatic visual treatment similar to the Testimonials section, an alternative approach uses a curated culinary image with a light overlay:

```tsx
<section ref={ref} className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
  {/* Full-width Background Image */}
  <div 
    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: `url('/lovable-uploads/[selected-image].png')` 
    }}
    aria-hidden="true"
  />
  
  {/* Light overlay for readability on white theme */}
  <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />

  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    {/* Content */}
  </div>
</section>
```

This approach requires:
- Selecting an appropriate background image from the gallery
- Tuning the overlay opacity for proper text contrast
- More complex implementation

---

## Technical Notes

### Existing Gradient Patterns (from index.css)
| Pattern | Color Accent | Usage |
|---------|--------------|-------|
| Pattern A | Ruby | Featured Venue |
| Pattern B | Platinum | **Gallery (proposed)** |
| Pattern C | Gold | Services |
| Pattern D | Navy | About |

### Why Pattern B Works Best
- **Platinum accent** complements the gallery images without competing with food colors
- **Maintains the established rhythm** without introducing new design patterns
- **Minimal implementation risk** - uses existing CSS variables
- **Consistent with style guide** per the memory documentation

---

## Summary

| Approach | Pros | Cons |
|----------|------|------|
| **Pattern B Gradient (Recommended)** | Simple, consistent, minimal code | Less dramatic |
| **Full-Width Image** | Visual impact, immersive | More complex, needs image selection |
| **Hybrid Texture** | Unique visual interest | Most complex, may distract from gallery |

**Recommendation**: Use Pattern B gradient for consistency with the established design system. Reserve full-width background images for high-impact sections like Hero, Testimonials, and CTA.

