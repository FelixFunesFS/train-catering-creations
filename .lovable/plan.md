

# Gallery Marquee Repositioning Plan (Revised)

## Overview
This plan repositions the ServiceMarquee to appear at the very top of the gallery page, directly after the site navigation header and above the immersive hero section. This creates a smooth visual transition from navigation into the gallery experience.

---

## Current vs. Proposed Layout

**Current Layout:**
```
[Site Header/Nav]
ImmersiveMobileHero (full-screen hero)
DiscoveryCategoryNav (Discover Our Work)
ServiceMarquee           <-- CURRENT POSITION (line 123)
Dynamic Content
```

**Proposed Layout:**
```
[Site Header/Nav]
ServiceMarquee           <-- NEW POSITION (first element in page)
ImmersiveMobileHero (full-screen hero)
DiscoveryCategoryNav (Discover Our Work)
Dynamic Content
```

---

## Changes Summary

### 1. Move ServiceMarquee to Top of Page

**File: `src/pages/AlternativeGallery.tsx`**

Move the `<ServiceMarquee />` component from line 123 to line 95, making it the first element inside the page container, directly above the hero `PageSection`.

This placement:
- Creates an elegant header transition from nav into the gallery
- Sets context about services before the visual showcase begins
- Provides visual rhythm at the entry point of the page

---

### 2. Further Slow Down Marquee Speed

**File: `src/index.css`**

Reduce marquee speeds by approximately 30% for a calm, readable experience:

| Speed | Current Mobile | New Mobile | Current Tablet | New Tablet | Current Desktop | New Desktop |
|-------|----------------|------------|----------------|------------|-----------------|-------------|
| normal | 55s | 70s | 48s | 60s | 40s | 50s |
| slow | 80s | 100s | 65s | 80s | 55s | 70s |
| fast | 45s | 55s | 38s | 48s | 30s | 38s |

---

### 3. Enhance ServiceMarquee Styling

**File: `src/components/home/ServiceMarquee.tsx`**

Update styling for better visual complement to the gallery:
- Increase vertical padding for breathing room
- Add subtle bottom border for clean separation from hero
- Ensure responsive text sizing across all breakpoints

Current: `py-3 lg:py-4 border-b border-border/20`
Proposed: `py-4 sm:py-5 lg:py-6 border-b border-border/30 bg-background`

The `bg-background` ensures a clean, solid surface that contrasts nicely with the dramatic hero below.

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AlternativeGallery.tsx` | Move ServiceMarquee from line 123 to line 95 (before hero PageSection) |
| `src/index.css` | Slow all marquee animation speeds by ~30% |
| `src/components/home/ServiceMarquee.tsx` | Increase padding, add background color |

---

## Visual Flow

```
+---------------------------+
|      Header Navigation    |
+---------------------------+
|     ServiceMarquee        |  <-- NEW: Sets context
|  Corporate Events • ...   |
+---------------------------+
|                           |
|    Immersive Hero         |
|    (Full-screen images)   |
|                           |
+---------------------------+
|    Discovery Navigation   |
+---------------------------+
|    Gallery Content        |
+---------------------------+
```

---

## No Breaking Changes

- All existing gallery functionality preserved
- Hero interactions unchanged
- Navigation and filtering intact
- Modal behavior unaffected

