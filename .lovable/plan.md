

# Lock Category Card Preview Images

## Overview
Add fixed preview images to each gallery category so the "Discover Our Work" cards always show the same curated images, instead of randomly selecting from the shuffled gallery.

---

## Problem
Currently, `getCategoryPreviewImage()` in DiscoveryCategoryNav.tsx selects the first image with quality >= 7 from the filtered images. Since `galleryImages` is shuffled randomly on each load, the preview images change unpredictably.

---

## Solution
Add a `previewImage` property to each category in `galleryCategories.ts` with a specific image URL, and update the component to use this fixed image.

---

## Changes

### 1. Update galleryCategories.ts

Add `previewImage` property to the interface and each category:

```typescript
export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  filterIds?: string[];
  previewImage: string;  // NEW: Fixed preview image URL
}
```

| Category | Selected Preview Image |
|----------|----------------------|
| Weddings & Black Tie | `/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png` (Enchanted Barn Reception - quality 9) |
| Artisan Desserts | `/lovable-uploads/84e8a135-2a5b-45ec-a57b-913b0540e56e.png` (Artisan Cupcake Tower - quality 9) |
| Buffet Service | `/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png` (Patriotic Celebration Feast - quality 9) |

---

### 2. Update DiscoveryCategoryNav.tsx

Simplify `getCategoryPreviewImage()` to return the category's fixed preview image:

**Before:**
```typescript
const getCategoryPreviewImage = (categoryId: string) => {
  const category = galleryCategories.find(cat => cat.id === categoryId);
  const filterIds = category?.filterIds || [categoryId];
  const categoryImages = galleryImages.filter(img => filterIds.includes(img.category) && img.quality >= 7);
  return categoryImages[0] || galleryImages[0];
};
```

**After:**
```typescript
const getCategoryPreviewImage = (categoryId: string) => {
  const category = galleryCategories.find(cat => cat.id === categoryId);
  return category?.previewImage || "";
};
```

Update the `<OptimizedImage>` usage to use the string directly:
- Change `src={previewImage.src}` to `src={previewImage}`

---

## Files Modified

| File | Change |
|------|--------|
| `src/data/galleryCategories.ts` | Add `previewImage` property to interface and all categories |
| `src/components/gallery/DiscoveryCategoryNav.tsx` | Simplify preview image logic to use fixed URLs |

---

## Result
- Category cards will always display the same high-quality preview images
- No more random image changes on page refresh
- Curated images that best represent each category

