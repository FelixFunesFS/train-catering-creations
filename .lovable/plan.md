
# Updated Gallery Cleanup Plan

## Overview
This expanded plan now includes:
1. Consolidate to 3 categories only (Weddings & Black Tie, Buffet Service, Artisan Desserts)
2. Remove random image shuffling
3. Remove descriptions from gallery grid and modal (keep Discover Our Work card descriptions)
4. Remove suspected duplicate images
5. Clean up unused category files

---

## Best Way to Ensure No Actual Duplicate Images

Since all 52 image URLs are unique strings, there are no byte-identical duplicates by URL. However, to catch **visually similar** images, the options are:

| Method | Pros | Cons |
|--------|------|------|
| **Manual visual review** | Most accurate | Time-consuming |
| **File hash comparison** | Catches identical files | Requires file access |
| **AI image similarity** | Catches similar-looking images | Requires API integration |

**Recommended approach**: Remove the 2 suspected duplicates identified by similar descriptions, then visually verify the final gallery looks correct.

### Suspected Duplicates to Remove

Based on title/description analysis suggesting same scene:

1. **Buffet**: Remove `ca7c68a6-6138-4fa3-85d3-6d9fb5bf2da2.png` ("Patriotic Southern Sides")
   - Keep `531de58a-4283-4d7c-882c-a78b6cdc97c0.png` ("Patriotic Celebration Feast" - quality 9)

2. **Formal**: Remove `fef8f5c1-040b-4e11-9102-f04a790da932.png` ("Regal Purple Celebration")
   - Keep `6aec2d18-641f-46aa-8c0e-e39f4e604fd6.png` ("Purple Linen Elegance" - quality 8)

---

## Changes

### 1. Remove Descriptions from InteractiveImageGrid.tsx

**Remove lines 100-103** (description paragraph in hover overlay):
```tsx
// DELETE THIS:
<p className="text-white/80 text-xs sm:text-sm line-clamp-2">
  {image.description}
</p>
```

The title will remain visible on hover for context.

---

### 2. Remove Descriptions from EnhancedImageModal.tsx

**Simplify lines 154-164** (info section below image):
```tsx
// BEFORE:
{currentImage && (
  <div className="mt-4 text-center px-2 sm:px-8">
    <h3 className="font-elegant font-semibold text-white text-base sm:text-lg mb-1">
      {currentImage.title}
    </h3>
    <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-2">
      {currentImage.description}
    </p>
  </div>
)}

// AFTER:
{currentImage && (
  <div className="mt-4 text-center px-2 sm:px-8">
    <h3 className="font-elegant font-semibold text-white text-base sm:text-lg">
      {currentImage.title}
    </h3>
  </div>
)}
```

---

### 3. Update galleryImages.ts

Remove unused category imports and consolidate:

```typescript
import { GalleryImage } from './gallery/types';
import { buffetImages } from './gallery/buffetImages';
import { weddingImages } from './gallery/weddingImages';
import { formalImages } from './gallery/formalImages';
import { dessertImages } from './gallery/dessertImages';

export type { GalleryImage } from './gallery/types';

const allImages: GalleryImage[] = [
  ...buffetImages,
  ...weddingImages,
  ...formalImages,
  ...dessertImages
];

export const galleryImages: GalleryImage[] = allImages;
```

---

### 4. Remove Duplicate from buffetImages.ts

Delete the "Patriotic Southern Sides" entry (lines 131-136):
```typescript
// DELETE THIS ENTRY:
{
  src: "/lovable-uploads/ca7c68a6-6138-4fa3-85d3-6d9fb5bf2da2.png",
  category: "buffet",
  title: "Patriotic Southern Sides",
  description: "Fresh green beans, hearty casseroles, and golden chicken with American flags",
  quality: 8
},
```

---

### 5. Remove Duplicate from formalImages.ts

Delete the "Regal Purple Celebration" entry (lines 61-66):
```typescript
// DELETE THIS ENTRY:
{
  src: "/lovable-uploads/fef8f5c1-040b-4e11-9102-f04a790da932.png",
  category: "formal",
  title: "Regal Purple Celebration",
  description: "Sophisticated affair with rich purple accents against rustic brick walls",
  quality: 7
},
```

---

### 6. Empty Unused Category Files

Set these arrays to empty (keeps imports valid but removes images):

| File | Change |
|------|--------|
| `teamImages.ts` | `export const teamImages: GalleryImage[] = [];` |
| `militaryImages.ts` | `export const militaryImages: GalleryImage[] = [];` |
| `corporateImages.ts` | `export const corporateImages: GalleryImage[] = [];` |
| `privateImages.ts` | `export const privateImages: GalleryImage[] = [];` |
| `grazingImages.ts` | `export const grazingImages: GalleryImage[] = [];` |
| `bbqImages.ts` | `export const bbqImages: GalleryImage[] = [];` |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/gallery/InteractiveImageGrid.tsx` | Remove description display |
| `src/components/gallery/EnhancedImageModal.tsx` | Remove description display |
| `src/data/galleryImages.ts` | Remove unused imports, keep only 4 categories |
| `src/data/gallery/buffetImages.ts` | Remove 1 duplicate entry |
| `src/data/gallery/formalImages.ts` | Remove 1 duplicate entry |
| `src/data/gallery/teamImages.ts` | Empty the array |
| `src/data/gallery/militaryImages.ts` | Empty the array |
| `src/data/gallery/corporateImages.ts` | Empty the array |
| `src/data/gallery/privateImages.ts` | Empty the array |
| `src/data/gallery/grazingImages.ts` | Empty the array |
| `src/data/gallery/bbqImages.ts` | Empty the array |

---

## Final Image Counts

| Category | Count |
|----------|-------|
| Weddings & Black Tie (wedding + formal) | 18 images |
| Buffet Service | 20 images |
| Artisan Desserts | 12 images |
| **Total** | **50 unique images** |

---

## Result

- Gallery consolidated to 3 categories matching Discover Our Work cards
- No descriptions shown in gallery grid hover or modal viewer
- Discover Our Work card descriptions preserved
- 2 suspected duplicate images removed
- Consistent, non-random image ordering
- Clean codebase with unused categories emptied
