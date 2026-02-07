

## Fix: Remove Zoom/Motion on First Hero Image (Mobile)

### Problem

When the hero section loads on mobile, the first image visibly "zooms in" for about 0.6 seconds. This comes from two sources:

1. **Container entrance animation**: The `scale-fade` variant scales the entire visual area from `scale(0.95)` to `scale(1)` over 0.6 seconds -- this is the main zoom effect.
2. **Image transition class**: The `<OptimizedImage>` has `transition-transform duration-700` which can cause visible motion when switching between slides with different `object-position` values.

### Changes

#### 1. `src/components/home/SplitHero.tsx` -- Use fade-only animation on mobile

Change the scroll animation variant for the visual container from `scale-fade` to `subtle` on mobile. The `subtle` variant only translates 8px vertically (no scale), which is imperceptible on a full-screen hero. Desktop keeps `scale-fade`.

```text
// Line 40-44: Change from:
useScrollAnimation({ variant: 'scale-fade', delay: 0 })

// To:
useScrollAnimation({ variant: isMobile ? 'subtle' : 'scale-fade', delay: 0 })
```

Also update the `useAnimationClass` call to match:

```text
// Line 52: Change from:
useAnimationClass('scale-fade', visualVisible)

// To:
useAnimationClass(isMobile ? 'subtle' : 'scale-fade', visualVisible)
```

#### 2. `src/components/home/SplitHero.tsx` -- Remove transition from image element

Remove `transition-transform duration-700` from the mobile `<OptimizedImage>` (line 257). The slide change is already instant (React re-render swaps the `src`), so the transition class just causes unwanted motion between slides.

```text
// Line 257: Change from:
className={`... transition-transform duration-700`}

// To:
className={`... `}
```

### Result

- First image appears with a smooth fade-in (opacity only), no zoom or scale motion
- Slide transitions are instant with no visible object-position shift
- Desktop hero keeps the existing `scale-fade` entrance animation unchanged

