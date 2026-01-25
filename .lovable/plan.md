
# Comprehensive Animation & UX Enhancements Plan
## With Full Mobile & Tablet Responsiveness

---

## Critical Finding: Missing Animation CSS Classes

The animation hooks (`useScrollAnimation`, `useStaggeredAnimation`) are generating class names like `ios-spring-hidden`, `fade-up-visible`, etc., but **these CSS classes do not exist anywhere in the codebase**. This is why:

1. The navigation bar stickiness appears broken (animations not rendering properly)
2. Page elements using these hooks show no visual animation effect
3. The Menu page's `useStaggeredAnimation` hook adds classes but nothing happens visually

---

## Part 1: Add Missing Animation CSS Classes

**File**: `src/index.css`

Add the complete animation class definitions. These include:

| Animation Variant | Effect | Mobile Behavior |
|-------------------|--------|-----------------|
| `ios-spring` | Subtle upward reveal with spring easing | Same, reduced distance |
| `fade-up` | Fade in + slide up | Same effect |
| `scale-fade` | Fade in + scale from 95% | Same effect |
| `slide-left/right` | Horizontal slide reveal | Same effect |
| `bounce-in` | Playful bounce entrance | Same, slightly less bounce |
| `elastic` | Elastic scale spring | Same effect |
| `zoom-fade` | Zoom in from 85% | Same effect |

**Reduced Motion Support**: All animations will include `@media (prefers-reduced-motion: reduce)` rules to disable transforms for users who prefer reduced motion.

---

## Part 2: Mobile & Tablet Responsiveness Details

### Current Mobile Infrastructure

The codebase already has solid mobile foundations:

| Component | Mobile Handling |
|-----------|-----------------|
| `useIsMobile` hook | Breakpoint at 1024px (tablets included as mobile) |
| `useScrollAnimation` | Has `mobile` and `desktop` config options (lines 12-19) |
| `useParallaxEffect` | Has `disabled` prop for mobile (lines 7-8) |
| Hero sections | Overlay layout for mobile/tablet |
| Touch targets | 44px minimum enforced |

### Animation CSS - Mobile Optimizations

The new animation classes will include mobile-specific adjustments:

```css
/* Mobile: Slightly reduced animation distances for smaller viewports */
@media (max-width: 768px) {
  .fade-up-hidden { transform: translateY(20px); }  /* vs 30px on desktop */
  .slide-left-hidden { transform: translateX(-20px); }  /* vs 30px */
  .slide-right-hidden { transform: translateX(20px); }  /* vs 30px */
  .bounce-in-hidden { transform: translateY(20px) scale(0.9); }  /* gentler */
}
```

### Parallax - Disabled on Mobile

The existing `useParallaxEffect` hook accepts a `disabled` prop. Implementation will use:

```tsx
const isMobile = useIsMobile();
const { ref, style } = useParallaxEffect({
  speed: 0.3,
  disabled: isMobile  // Parallax disabled under 1024px
});
```

This ensures:
- No parallax on phones or portrait tablets
- Better performance on mobile devices
- No janky scroll experiences on touch devices

---

## Part 3: About Page Enhancements

### Current State
- No scroll animations on any sections
- Background images in "Our Story" and "Our Values" sections
- Team cards have basic hover effects only

### Planned Enhancements

| Section | Animation | Mobile Behavior |
|---------|-----------|-----------------|
| Header (PageHeader) | `fade-up` on badge, title, description | Same animation, no delay differences |
| Our Story - Content | `slide-right` staggered reveal | `fade-up` on mobile (no horizontal slide) |
| Our Story - Image | `scale-fade` | Same |
| Our Story - Background | Parallax (speed: 0.3) | **Disabled on mobile/tablet** |
| Team Cards | `bounce-in` staggered (150ms) | Same, reduced bounce distance |
| Values Cards | `fade-up` staggered (120ms) | Same |
| Values - Background | Parallax (speed: 0.25) | **Disabled on mobile/tablet** |

### Mobile-Specific Configuration

```tsx
const storyContent = useScrollAnimation({
  variant: 'slide-right',
  mobile: { variant: 'fade-up' },  // Simpler animation on mobile
  delay: 100
});
```

---

## Part 4: Menu Page Enhancements

### Current State
- Uses `useStaggeredAnimation` with `fade-up` variant (already implemented)
- Animation classes are being added but have no CSS definitions

### Planned Enhancements

| Element | Enhancement | Mobile Behavior |
|---------|-------------|-----------------|
| Header Section | Add ruby corner accents | Same, smaller accents |
| Category Toggle | Micro-interaction on selection | Same |
| Collapsible Categories | Staggered `fade-up` (already coded) | Works once CSS added |

**No additional code changes needed** - just adding the missing CSS classes will activate the existing animations.

---

## Part 5: FAQ Page Enhancements

### Current State
- No scroll animations on accordion items
- CTA section uses `neumorphic-card-3` (has hover transform issue)

### Planned Enhancements

| Section | Animation | Mobile Behavior |
|---------|-----------|-----------------|
| Search/Filter Section | `fade-up` | Same |
| Accordion Items | `fade-up` staggered (80ms per item) | Same |
| Contact CTA Card | `scale-fade` | Same |

---

## Part 6: Site-Wide Parallax Strategy

### Where Parallax Will Be Applied

| Page | Section | Speed | Mobile |
|------|---------|-------|--------|
| About | "Our Story" background | 0.3 | Disabled |
| About | "Our Values" background | 0.25 | Disabled |
| Gallery | Category header images | 0.2 | Disabled |

### Where Parallax Will NOT Be Used

- Navigation bar (breaks sticky positioning)
- Interactive elements (buttons, forms, inputs)
- Text-heavy sections (readability concern)
- Any viewport under 1024px (performance + usability)
- Quote forms (conversion-focused, no distractions)

---

## Part 7: Performance Considerations

### Animation Performance

| Optimization | Implementation |
|--------------|----------------|
| GPU acceleration | Use `transform` and `opacity` only (composite properties) |
| Passive listeners | `{ passive: true }` on scroll events (already implemented) |
| `will-change` | Applied sparingly via CSS, auto-removed after animation |
| Intersection Observer | Used for triggering (not scroll position) |

### Mobile Performance

| Optimization | Implementation |
|--------------|----------------|
| Parallax disabled | `disabled: isMobile` prop |
| Reduced animation distances | Smaller `translateY/X` values under 768px |
| Fewer simultaneous animations | Stagger delays naturally limit concurrent transforms |
| `prefers-reduced-motion` | All animations respect this media query |

---

## Part 8: Implementation Files

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Edit | Add all animation class definitions with mobile + reduced motion support |
| `src/pages/About.tsx` | Edit | Add `useScrollAnimation` and `useParallaxEffect` hooks to sections |
| `src/pages/FAQ.tsx` | Edit | Add scroll animations to accordion section |
| `src/components/ui/page-header.tsx` | Edit | Add optional fade-in animation |
| `src/components/menu/SimpleMenuHeader.tsx` | Edit | Add ruby corner accent elements |

### Files Already Working (Need CSS Only)

| File | Current State |
|------|---------------|
| `src/pages/SimplifiedMenu.tsx` | Has `useStaggeredAnimation`, waiting for CSS |
| `src/components/home/*` | Various animation hooks, waiting for CSS |

---

## Part 9: Animation CSS Implementation Details

### Hidden State Classes

```css
.ios-spring-hidden,
.fade-up-hidden,
.scale-fade-hidden,
.slide-left-hidden,
.slide-right-hidden,
.bounce-in-hidden,
.elastic-hidden,
.zoom-fade-hidden {
  opacity: 0;
  will-change: transform, opacity;
}

/* Transform values for each variant */
.ios-spring-hidden { transform: translateY(20px); }
.fade-up-hidden { transform: translateY(30px); }
.scale-fade-hidden { transform: scale(0.95); }
.slide-left-hidden { transform: translateX(-30px); }
.slide-right-hidden { transform: translateX(30px); }
.bounce-in-hidden { transform: translateY(30px) scale(0.85); }
.elastic-hidden { transform: scale(0.9); }
.zoom-fade-hidden { transform: scale(0.85); }
```

### Visible State Classes

```css
.ios-spring-visible,
.fade-up-visible,
.scale-fade-visible,
.slide-left-visible,
.slide-right-visible,
.bounce-in-visible,
.elastic-visible,
.zoom-fade-visible {
  opacity: 1;
  transform: none;
}

/* Spring/elastic timing curves */
.ios-spring-visible {
  transition: opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bounce-in-visible {
  transition: opacity 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55),
              transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Mobile Overrides

```css
@media (max-width: 768px) {
  .fade-up-hidden { transform: translateY(20px); }
  .slide-left-hidden { transform: translateX(-20px); }
  .slide-right-hidden { transform: translateX(20px); }
  .bounce-in-hidden { transform: translateY(20px) scale(0.9); }
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .ios-spring-hidden,
  .fade-up-hidden,
  .scale-fade-hidden,
  /* ... all variants ... */ {
    opacity: 0;
    transform: none !important;
  }
  
  .ios-spring-visible,
  .fade-up-visible,
  .scale-fade-visible,
  /* ... all variants ... */ {
    opacity: 1;
    transform: none !important;
    transition: opacity 0.2s ease !important;
  }
}
```

---

## Summary: Mobile & Tablet Coverage

| Aspect | Desktop (1024px+) | Tablet (768-1023px) | Mobile (<768px) |
|--------|-------------------|---------------------|-----------------|
| Scroll animations | Full effects | Full effects | Full effects (reduced distances) |
| Parallax | Enabled | **Disabled** | **Disabled** |
| Animation distances | Standard | Standard | Reduced by ~33% |
| Stagger delays | Standard | Standard | Standard |
| Touch targets | N/A | 44px minimum | 44px minimum |
| `prefers-reduced-motion` | Respected | Respected | Respected |

This plan ensures optimal experience across all device sizes while maintaining performance and accessibility.
