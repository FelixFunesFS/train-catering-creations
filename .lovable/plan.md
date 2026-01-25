
# Fix Duplicate Images in Home Page Gallery

## Problem Identified

The home page gallery shows images 5 and 6 as the same picture because:

1. **Sorting instability**: The code sorts all images by quality descending (`.sort((a, b) => b.quality - a.quality)`) and takes the top 6
2. **Many tied scores**: There are ~20+ images with quality 9, and JavaScript's sort is unstable for equal values
3. **Random selection**: Which 5 quality-9 images appear alongside the quality-10 image varies unpredictably
4. **Potential visual duplicates**: Some images may look very similar (e.g., outdoor tent photos from different angles)

## Current Flow

```text
galleryImages (80+ images)
    ↓
.sort by quality descending
    ↓
.slice(0, 6) - takes first 6
    ↓
But images 2-6 are all quality 9 (tied)
    ↓
Unstable sort = unpredictable order
```

## Solution: Curated Showcase Array

Instead of relying on quality-based sorting, explicitly define which 6 images appear on the home page. This gives full control over the gallery showcase.

---

## Technical Changes

### File: `src/data/galleryImages.ts`

Add a new export for curated showcase images with specific order:

```typescript
import teamWesternBuffet from '@/assets/team-western-buffet.jpg';

// Curated images for home page showcase - order is fixed
export const showcaseImages: GalleryImage[] = [
  {
    src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
    category: "wedding",
    title: "Garden Wedding Dining",
    description: "Breathtaking venue with cascading florals and crystal-clear place settings",
    quality: 9
  },
  {
    src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    category: "wedding",
    title: "Enchanted Barn Reception",
    description: "A dreamy rustic venue glowing with chandeliers and twinkling string lights",
    quality: 9
  },
  // dessert-parfait-display.jpg
  {
    src: dessertParfaitDisplay,
    category: "desserts",
    title: "Strawberry & Cookies 'n Cream Parfaits",
    description: "Elegant tiered display of fresh strawberry shortcake and Oreo cream parfaits",
    quality: 9
  },
  // formal-gold-reception.jpg
  {
    src: formalGoldReception,
    category: "formal",
    title: "Gold & White Reception Hall",
    description: "Elegant gold-sashed chairs and sparkling fairy lights for a stunning formal event",
    quality: 9
  },
  // Mac & Cheese (food-mac-cheese.jpg)
  {
    src: foodMacCheese,
    category: "buffet",
    title: "Golden Baked Mac & Cheese",
    description: "Creamy, bubbly mac and cheese with a perfectly golden herbed crust",
    quality: 9
  },
  // NEW: Western Team photo (position 6)
  {
    src: teamWesternBuffet,
    category: "team",
    title: "Western-Themed Family Service",
    description: "Our family team in matching western attire ready to serve authentic Southern comfort food",
    quality: 10
  }
];
```

### File: `src/components/home/InteractiveGallerySection.tsx`

Update import and remove sorting logic:

```typescript
// Change import
import { galleryImages, showcaseImages } from "@/data/galleryImages";

// Remove this code (lines 37-40):
const showcaseImages = galleryImages
  .sort((a, b) => b.quality - a.quality)
  .slice(0, 6);

// Now showcaseImages is imported directly with fixed order
```

---

## Showcase Image Selection (6 images, diverse categories)

| Position | Image | Category | Why Selected |
|----------|-------|----------|--------------|
| 1 | Garden Wedding Dining | Wedding | Beautiful venue shot |
| 2 | Enchanted Barn Reception | Wedding | Romantic atmosphere |
| 3 | Parfait Display | Desserts | Colorful, appetizing |
| 4 | Gold Reception Hall | Formal | Elegant setting |
| 5 | Mac & Cheese | Buffet | Signature dish, comfort food |
| 6 | Western Team Photo | Team | **NEW: Family-owned emphasis** |

---

## Benefits

- **Fixed order**: No sorting means predictable, controlled display
- **Category diversity**: Curated mix ensures variety (wedding, desserts, formal, buffet, team)
- **No duplicates**: Hand-picked images guarantee uniqueness
- **Easy updates**: Change showcase by editing one array
- **Maintains full gallery**: Original `galleryImages` array remains unchanged for the full gallery page

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/galleryImages.ts` | Add `showcaseImages` export with 6 curated images in fixed order |
| `src/components/home/InteractiveGallerySection.tsx` | Import `showcaseImages` directly, remove sorting logic |
