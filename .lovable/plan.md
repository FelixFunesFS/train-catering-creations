
# Add Subtle Vignette Effect to Hero Image Edges

## Overview
Add a refined vignette effect specifically optimized for the hero section's large-scale images. The current site-wide vignette exists but is tuned for smaller gallery images. The hero needs a more pronounced but still subtle effect that adds cinematic depth while preserving the immersive feel.

## Analysis

### Current State
- The `OptimizedImage` component has `enableVignette={true}` by default
- Existing vignette CSS uses `inset box-shadow` with 60px/120px blur radii
- Hero images already get this effect, but it's not visible enough at hero scale
- The hero also uses gradient overlays for content readability (separate from vignette)

### Approach
Create a dedicated hero vignette class that:
- Uses larger blur radii appropriate for full-screen images
- Adds subtle radial gradient for a true "camera lens" vignette feel
- Remains subtle enough to not obscure the catering imagery
- Works in both mobile (full-screen overlay) and desktop (60% split) layouts

## Implementation Details

### 1. Add Hero-Specific Vignette CSS Class (src/index.css)

Add a new `.hero-vignette` class with:
- Larger inset box-shadow blur (100px, 200px) for edge darkening
- Subtle radial gradient overlay for natural lens-like falloff
- Slightly stronger effect on corners than current vignette
- Dark mode variant with adjusted opacity

```css
/* Hero-specific vignette for large-scale images */
.hero-vignette {
  position: relative;
}

.hero-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 80% at center,
    transparent 40%,
    rgba(0, 0, 0, 0.08) 70%,
    rgba(0, 0, 0, 0.18) 100%
  );
  box-shadow: 
    inset 0 0 100px rgba(0, 0, 0, 0.12),
    inset 0 0 200px rgba(0, 0, 0, 0.08);
  pointer-events: none;
  z-index: 10;
}

.dark .hero-vignette::after {
  background: radial-gradient(
    ellipse 80% 80% at center,
    transparent 40%,
    rgba(0, 0, 0, 0.15) 70%,
    rgba(0, 0, 0, 0.25) 100%
  );
}
```

### 2. Apply Vignette to Hero Image Container (src/components/home/SplitHero.tsx)

**Desktop Layout (Line ~282):**
Add `hero-vignette` class to the visual area container that wraps the `OptimizedImage`.

**Mobile Layout (Line ~200):**
Add `hero-vignette` class to the visual area container for consistency.

### 3. Disable Default Vignette on Hero Images

Since we're using a custom hero-specific vignette on the container, set `enableVignette={false}` on the hero `OptimizedImage` components to avoid double-layering effects.

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `.hero-vignette` and dark mode variant classes |
| `src/components/home/SplitHero.tsx` | Add `hero-vignette` class to image containers (2 locations), set `enableVignette={false}` on hero images |

## Visual Result

The hero images will have:
- Subtle edge darkening that draws focus to the center content
- Natural lens-like falloff typical of cinematic photography
- Enhanced depth without losing the immersive full-bleed feel
- Consistent effect across mobile and desktop layouts
- Proper dark mode adaptation

## Performance Considerations
- Uses CSS only (no additional JavaScript)
- `pointer-events: none` ensures no interaction interference
- Hardware-accelerated via GPU compositing
- No impact on LCP as it's a pseudo-element overlay
