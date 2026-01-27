

# Gallery Page Layout Consolidation

## Overview

This plan removes the "Discover Our Work" header and subtitle from the gallery grid section and combines the masonry image grid with the category cards section into a single unified section.

---

## Current Structure

```text
┌─────────────────────────────────────────┐
│ Hero Section                            │
├─────────────────────────────────────────┤
│ PageSection (pattern="b")               │
│  - Brand Intro (Badge, Title, Subtitle) │
│  - Category Cards                       │
├─────────────────────────────────────────┤
│ PageSection (pattern="c") ← SEPARATE    │
│  - "Discover Our Work" Header           │ ← REMOVE
│  - "Browse our portfolio..." subtitle   │ ← REMOVE
│  - Masonry Image Grid                   │
├─────────────────────────────────────────┤
│ CTA Section                             │
└─────────────────────────────────────────┘
```

## Target Structure

```text
┌─────────────────────────────────────────┐
│ Hero Section                            │
├─────────────────────────────────────────┤
│ PageSection (pattern="b") ← COMBINED    │
│  - Brand Intro (Badge, Title, Subtitle) │
│  - Category Cards                       │
│  - Image Grid (no header)               │ ← MOVED HERE
├─────────────────────────────────────────┤
│ CTA Section                             │
└─────────────────────────────────────────┘
```

---

## Changes

### 1. Remove "Discover Our Work" Header

**File:** `src/components/gallery/InteractiveImageGrid.tsx`

Set `showDiscoverHeader={false}` when calling the component, which will:
- Hide the "Discover Our Work" title
- Hide the "Browse our portfolio of beautifully catered events" subtitle
- Still show the category name and image count when a filter is active

**Alternative approach (cleaner):** Modify the header section to show a minimal indicator when a category is selected, without the large title/subtitle.

---

### 2. Combine Sections in AlternativeGallery.tsx

**File:** `src/pages/AlternativeGallery.tsx`

Move the `InteractiveImageGrid` component inside the same `PageSection` as the Category Cards, eliminating the separate section.

**Before (lines 125-137):**
```tsx
{/* COMBINED: Discover Our Work + Image Grid */}
<PageSection pattern="c" withBorder data-section="gallery-grid">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
    <div ref={contentRef} className={useAnimationClass(contentVariant, contentVisible)}>
      <InteractiveImageGrid 
        images={filteredImages}
        onImageClick={handleImageClick}
        category={selectedCategory}
        showDiscoverHeader={true}
      />
    </div>
  </div>
</PageSection>
```

**After:** Move the `InteractiveImageGrid` inside the first `PageSection` (after CategoryCards) and remove the second `PageSection` entirely.

---

## Implementation Details

### File: `src/pages/AlternativeGallery.tsx`

**Changes:**
1. Move `InteractiveImageGrid` inside the Brand Intro + Category Cards section
2. Remove the separate `PageSection pattern="c"`
3. Set `showDiscoverHeader={false}` to hide the redundant header
4. Keep the `data-section="gallery-grid"` attribute for scroll targeting

**Updated structure:**
```tsx
{/* COMBINED: Brand Intro + Category Cards + Image Grid */}
<PageSection pattern="b" className="py-8 sm:py-12" data-section="gallery-grid">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Intro text - centered */}
    <div ref={introRef} className={...}>
      {/* Badge, Title, Subtitle, Description */}
    </div>
    
    {/* Category Cards */}
    <CategoryCards 
      selectedCategory={selectedCategory}
      onCategorySelect={handleCategorySelect}
    />
    
    {/* Image Grid - Now embedded directly below cards */}
    <div ref={contentRef} className={`mt-8 sm:mt-10 lg:mt-12 ${useAnimationClass(contentVariant, contentVisible)}`}>
      <InteractiveImageGrid 
        images={filteredImages}
        onImageClick={handleImageClick}
        category={selectedCategory}
        showDiscoverHeader={false}  {/* Hide the header */}
      />
    </div>
  </div>
</PageSection>
```

---

### File: `src/components/gallery/InteractiveImageGrid.tsx`

**Optional refinement:** When `showDiscoverHeader={false}`, the component currently shows a simpler header with just the category name. We can optionally hide this entirely or show only a minimal category indicator when a filter is active.

**Current behavior (lines 134-143):**
```tsx
} : (
  <>
    <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
      {getCategoryDisplayName(category)}
    </h2>
    <p className="text-muted-foreground text-sm sm:text-base">
      {sortedImages.length} images
    </p>
  </>
)}
```

**Keep this behavior** - it provides useful context when filtering by category, showing "Weddings & Black Tie (24 images)" etc.

---

## Visual Result

### Before
```text
[ Category Cards ]
─────────────────────────────────
   Discover Our Work              ← REMOVED
   Browse our portfolio...        ← REMOVED
[ Masonry Gallery ]
```

### After
```text
[ Category Cards ]
   
   Weddings & Black Tie (24 images)  ← Only shows when filtered
[ Masonry Gallery ]                   ← Directly below cards
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AlternativeGallery.tsx` | Move grid into first section, remove second PageSection, set `showDiscoverHeader={false}` |

---

## Technical Notes

- The `data-section="gallery-grid"` attribute needs to move to the combined section for the hero's scroll-to-gallery functionality to work correctly
- Animation refs remain in place for smooth scroll animations
- The responsive padding is already handled by the existing `PageSection` and container classes
- No changes needed to `InteractiveImageGrid.tsx` as it already supports `showDiscoverHeader={false}`

