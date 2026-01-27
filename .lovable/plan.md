

# Remove "All Images" Header from Gallery Grid

## Problem

After consolidating the gallery layout, the `InteractiveImageGrid` component still displays:
- **"All Images"** as a header when no category filter is active
- **"73 images"** count below it

This is redundant since the gallery is already integrated with the category cards section.

---

## Solution

Modify `InteractiveImageGrid.tsx` to only show the header when a specific category IS selected. When showing all images (no filter), hide the header entirely.

---

## Implementation

### File: `src/components/gallery/InteractiveImageGrid.tsx`

**Current behavior (lines 134-143):**
```tsx
) : (
  <>
    <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
      {getCategoryDisplayName(category)}  // Shows "All Images" when category is null
    </h2>
    <p className="text-muted-foreground text-sm sm:text-base">
      {sortedImages.length} images
    </p>
  </>
)}
```

**New behavior:**
```tsx
) : (
  // Only show header when a category is selected
  category && (
    <>
      <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
        {getCategoryDisplayName(category)}
      </h2>
      <p className="text-muted-foreground text-sm sm:text-base">
        {sortedImages.length} images
      </p>
    </>
  )
)}
```

Additionally, update the header container to not render empty space when there's no content:

```tsx
{/* Header - Only show when category is selected or showDiscoverHeader is true */}
{(showDiscoverHeader || category) && (
  <div 
    ref={headerRef}
    className={`mb-6 sm:mb-8 lg:mb-10 ${showDiscoverHeader ? 'text-center' : ''} ${useAnimationClass(headerVariant, headerVisible)}`}
  >
    {/* ... header content ... */}
  </div>
)}
```

---

## Visual Result

### Before (No Filter Active)
```text
[ Category Cards ]

   All Images              ← REMOVED
   73 images               ← REMOVED

[ Masonry Gallery ]
```

### After (No Filter Active)
```text
[ Category Cards ]

[ Masonry Gallery ]        ← Directly below cards, no header
```

### After (Category Selected)
```text
[ Category Cards (Wedding selected) ]

   Weddings & Black Tie    ← Still shows
   24 images               ← Still shows

[ Filtered Masonry Gallery ]
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/gallery/InteractiveImageGrid.tsx` | Conditionally hide header when no category is selected |

---

## Technical Notes

- The header will only appear when filtering by a specific category, providing useful context
- When showing all images, the gallery flows seamlessly below the category cards
- No changes needed to `AlternativeGallery.tsx` - the prop is already set correctly
- Animation refs remain functional for when the header does appear

