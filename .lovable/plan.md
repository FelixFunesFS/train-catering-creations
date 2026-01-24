
# Simplify Gallery Experience

## Overview
Streamline the gallery page by removing complexity:
1. Remove "Wedding Venue Dining" from hero
2. Remove search/filter components and story mode
3. Combine Wedding and Formal categories into one
4. Default to masonry grid for all images

---

## Changes Summary

| File | Change |
|------|--------|
| `src/data/heroImages.ts` | Remove "Wedding Venue Dining" image |
| `src/data/galleryCategories.ts` | Combine Wedding and Formal into "Weddings & Black Tie" |
| `src/pages/AlternativeGallery.tsx` | Remove story/search mode logic, simplify to masonry grid only |
| `src/components/gallery/DiscoveryCategoryNav.tsx` | Remove view mode toggle buttons, simplify to grid-only |
| `src/components/gallery/InteractiveImageGrid.tsx` | Remove search bar, view mode toggle, and filters - default to masonry |

---

## Detailed Changes

### 1. Hero Images (`src/data/heroImages.ts`)

Remove the "Wedding Venue Dining" entry (lines 29-35), leaving 3 hero images:
- Rustic Wedding Venue
- Grand Banquet Hall
- Military Formal Ceremony

---

### 2. Gallery Categories (`src/data/galleryCategories.ts`)

**Before:**
```text
1. Wedding Celebrations
2. Formal & Black Tie Events
3. Artisan Desserts
4. Buffet Service
```

**After:**
```text
1. Weddings & Black Tie  (combines wedding + formal)
2. Artisan Desserts
3. Buffet Service
```

The new combined category will:
- Use ID: "weddings-formal" or keep filtering for both "wedding" and "formal"
- Display images from both original categories

---

### 3. Alternative Gallery Page (`src/pages/AlternativeGallery.tsx`)

Remove:
- `viewMode` state (no story/search modes)
- `searchQuery` and `qualityFilter` state
- `handleStoryModeSelect` and `handleSearchModeSelect` functions
- `GallerySearchInterface` and `StoryGalleryViewer` imports and usage

Simplify:
- Always render `InteractiveImageGrid` (no conditional view modes)
- Update filter logic to handle combined "weddings-formal" category

---

### 4. Discovery Category Nav (`src/components/gallery/DiscoveryCategoryNav.tsx`)

Remove:
- View mode toggle buttons (Story Mode, Grid View, Smart Search)
- Props: `onStoryModeSelect`, `onSearchModeSelect`, `viewMode`, `setViewMode`
- Subtitle text about "stories, grids, or smart search"

Keep:
- Category cards for browsing
- Clean section header

---

### 5. Interactive Image Grid (`src/components/gallery/InteractiveImageGrid.tsx`)

Remove:
- Search input bar
- View mode toggle (masonry/grid/list buttons)
- Sort and filter dropdowns
- `showFilters` state and filter panel
- `filterOption` and `sortOption` state

Keep:
- Masonry grid layout as default and only view
- Favorites functionality (heart icons)
- Featured badge for quality 8+ images
- Clean header with category name and image count

---

## Visual Result

```text
Before:
+----------------------------------+
| Discover Our Work                |
| [Story] [Grid] [Search]          |  <-- REMOVED
+----------------------------------+
| [Wedding] [Formal] [Desserts]    |
+----------------------------------+
| [Search bar............]         |  <-- REMOVED
| [Filters] [View Mode]            |  <-- REMOVED
+----------------------------------+

After:
+----------------------------------+
| Discover Our Work                |
+----------------------------------+
| [Weddings & Black Tie] [Desserts]|
| [Buffet]                         |
+----------------------------------+
| All Images (24 images)           |
| [Masonry Grid of Images]         |
+----------------------------------+
```

---

## Files Modified

| File | Lines Changed | Summary |
|------|--------------|---------|
| `src/data/heroImages.ts` | ~7 lines removed | Remove Wedding Venue Dining |
| `src/data/galleryCategories.ts` | ~8 lines modified | Combine categories |
| `src/pages/AlternativeGallery.tsx` | ~30 lines simplified | Remove story/search modes |
| `src/components/gallery/DiscoveryCategoryNav.tsx` | ~40 lines removed | Remove view mode toggles |
| `src/components/gallery/InteractiveImageGrid.tsx` | ~80 lines removed | Remove search, filters, view toggles |

---

## Technical Notes

- Category filtering will need to handle the combined category by filtering for images where `category === 'wedding' OR category === 'formal'`
- Existing gallery image data categories remain unchanged (still "wedding" and "formal" in the source data)
- Masonry layout CSS classes are already implemented and will be the only view
