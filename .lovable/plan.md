
# Gallery Consolidation and Marquee Optimization Plan

## Overview
This plan consolidates the gallery pages by removing PhotoGallery and making AlternativeGallery the sole gallery experience, moves the ServiceMarquee from the home page to the gallery, and further slows down marquee speeds for better readability.

---

## Changes Summary

### 1. Remove ServiceMarquee from Home Page

**File: `src/pages/HomePage.tsx`**

Remove the `ServiceMarquee` import and component from the home page layout.

Current layout:
```
SplitHero
TrustMarquee
ServiceCategoriesSection
ServiceMarquee          <-- REMOVE THIS
InteractiveGalleryPreview
AboutPreviewSection
...
```

New layout:
```
SplitHero
TrustMarquee
ServiceCategoriesSection
InteractiveGalleryPreview
AboutPreviewSection
...
```

---

### 2. Add ServiceMarquee to Alternative Gallery

**File: `src/pages/AlternativeGallery.tsx`**

Import and add `ServiceMarquee` between the Discovery Navigation and the Dynamic Content sections.

New gallery layout:
```
ImmersiveMobileHero
DiscoveryCategoryNav
ServiceMarquee          <-- ADD HERE
Dynamic Content (grid/story/search)
EnhancedImageModal
```

---

### 3. Replace PhotoGallery with AlternativeGallery

**File: `src/App.tsx`**

Change the `/gallery` route to use `AlternativeGallery` instead of `PhotoGallery`:
- Keep the import for `AlternativeGallery`
- Remove the import for `PhotoGallery`
- Update the route: `<Route path="/gallery" element={<AlternativeGallery />} />`
- Remove the `/gallery-alt` route (no longer needed)

---

### 4. Update Navigation Links

All existing links point to `/gallery#page-header`, which will now show the AlternativeGallery. The hash anchor may need adjustment since AlternativeGallery uses `gallery-hero` as its content ID.

**Files to update:**
- `src/components/Header.tsx` - Change `/gallery#page-header` to `/gallery`
- `src/components/Footer.tsx` - Change `/gallery#page-header` to `/gallery`
- `src/components/home/InteractiveGalleryPreview.tsx` - Change `/gallery` links
- `src/components/home/InteractiveGallerySection.tsx` - Change `/gallery#page-header`
- `src/components/wedding/MobileWeddingTaglineSection.tsx` - Change `/gallery#page-header`

---

### 5. Slow Down Marquee Speeds (Gallery-Optimized)

**File: `src/index.css`**

The current speeds are still too fast. Increase all durations by approximately 50%:

| Speed | Current Mobile | New Mobile | Current Tablet | New Tablet | Current Desktop | New Desktop |
|-------|----------------|------------|----------------|------------|-----------------|-------------|
| normal | 40s | 55s | 35s | 48s | 30s | 40s |
| slow | 60s | 80s | 50s | 65s | 45s | 55s |
| fast | 30s | 45s | 25s | 38s | 20s | 30s |

This creates a more relaxed, comfortable reading pace that complements a visual gallery experience.

---

### 6. Optional: Remove PhotoGallery.tsx (Cleanup)

**File: `src/pages/PhotoGallery.tsx`**

This file can be deleted since it will no longer be used. However, keeping it temporarily is safe if you want to reference its design patterns.

---

## Technical Implementation Details

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/HomePage.tsx` | Remove ServiceMarquee |
| `src/pages/AlternativeGallery.tsx` | Add ServiceMarquee import and component |
| `src/App.tsx` | Remove PhotoGallery import, remove /gallery-alt route, update /gallery to use AlternativeGallery |
| `src/index.css` | Slow down all marquee speeds by ~50% |
| `src/components/Header.tsx` | Update gallery link |
| `src/components/Footer.tsx` | Update gallery link |
| `src/components/home/InteractiveGalleryPreview.tsx` | Update gallery links |
| `src/components/home/InteractiveGallerySection.tsx` | Update gallery link |
| `src/components/wedding/MobileWeddingTaglineSection.tsx` | Update gallery link |

### Files to Delete (Optional)
| File | Reason |
|------|--------|
| `src/pages/PhotoGallery.tsx` | No longer used |

---

## No Breaking Changes

- All `/gallery` links will continue to work (now showing the enhanced alternative gallery)
- The home page will still have 2 marquees (TrustMarquee at top, BrandMarquee before CTA)
- Gallery page gains the ServiceMarquee for visual rhythm
- Marquee speeds will be noticeably slower and more readable
- All existing functionality (modals, filtering, search) preserved

---

## Expected Improvements

| Metric | Before | After |
|--------|--------|-------|
| Marquee readability | Too fast | Comfortable reading pace |
| Home page marquees | 3 marquees | 2 marquees (cleaner) |
| Gallery engagement | No marquee | ServiceMarquee adds visual interest |
| Code duplication | 2 gallery pages | 1 consolidated gallery |
| Perceived speed (mobile) | 40s/30s/60s | 55s/45s/80s |
