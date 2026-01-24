

# Gallery Cleanup: Swap Cards, Remove Random Order, and Remove Featured Badges

## Overview
This plan addresses three changes to the gallery:
1. Swap the order of "Buffet Service" and "Artisan Desserts" category cards
2. Remove the random image shuffling to maintain consistent ordering
3. Remove the "Featured" badges from gallery images

---

## Changes

### 1. Swap Category Card Order

**File:** `src/data/galleryCategories.ts`

Reorder the array so Buffet Service appears before Artisan Desserts:

| Current Order | New Order |
|---------------|-----------|
| 1. Weddings & Black Tie | 1. Weddings & Black Tie |
| 2. Artisan Desserts | 2. **Buffet Service** |
| 3. Buffet Service | 3. **Artisan Desserts** |

---

### 2. Remove Random Image Shuffling

**File:** `src/data/galleryImages.ts`

**Current code (line 35):**
```typescript
export const galleryImages: GalleryImage[] = allImages.sort(() => 0.5 - Math.random());
```

**New code:**
```typescript
export const galleryImages: GalleryImage[] = allImages;
```

This will maintain a consistent order based on how images are imported (buffet first, then wedding, formal, team, etc.). Images within each category will display in their defined order.

---

### 3. Remove Featured Badges

**File:** `src/components/gallery/InteractiveImageGrid.tsx`

Remove the Featured badge block (lines 82-90):
```tsx
{/* Featured Badge - Always visible */}
{image.quality >= 8 && (
  <div className="absolute top-3 left-3">
    <Badge className="bg-white/10 text-white border-white/20 text-xs gap-1 backdrop-blur-sm">
      <Sparkles className="h-3 w-3" />
      Featured
    </Badge>
  </div>
)}
```

Also remove unused imports:
- Remove `Badge` from `@/components/ui/badge`
- Remove `Sparkles` from `lucide-react`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/data/galleryCategories.ts` | Swap buffet and desserts order |
| `src/data/galleryImages.ts` | Remove random sorting |
| `src/components/gallery/InteractiveImageGrid.tsx` | Remove Featured badge and unused imports |

---

## Result

- Category cards will display in order: Weddings & Black Tie, Buffet Service, Artisan Desserts
- Gallery images will maintain consistent, predictable order on every page load
- No more "Featured" badges appearing on high-quality images
- Cleaner, distraction-free gallery viewing experience

