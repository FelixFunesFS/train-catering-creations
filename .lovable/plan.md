
# Home Page Gallery Enhancements

## Overview
This plan addresses three improvements to the "A Gallery of Flavor & Style" section on the home page:

1. **Improve badge accessibility** with high-contrast styling
2. **Remove extra text** after the gallery button
3. **Open full gallery modal** when clicking any of the 6 images

---

## Current Architecture

The home page uses `InteractiveGalleryPreview.tsx` which displays 6 curated images with category badges. Currently, clicking an image only shows a hover overlay - there's no modal functionality.

A sister component `InteractiveGallerySection.tsx` already implements the full gallery modal pattern using `EnhancedImageModal` - we'll adopt this approach.

---

## Technical Changes

### File: `src/components/home/InteractiveGalleryPreview.tsx`

#### 1. Add Modal State and Imports

```typescript
// Add imports
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { galleryImages } from "@/data/galleryImages";

// Add state for modal
const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

// Add handlers
const handleImageClick = (imageSrc: string) => {
  const index = galleryImages.findIndex(img => img.src === imageSrc);
  setSelectedImageIndex(index);
};

const handleCloseModal = () => {
  setSelectedImageIndex(null);
};
```

#### 2. Improve Badge Accessibility (High Contrast)

Current badges use semi-transparent backgrounds (e.g., `bg-ruby/10`). Update to solid, high-contrast backgrounds:

```typescript
const getCategoryColor = (category: string) => {
  const colors = {
    Wedding: "bg-ruby text-white border-ruby",
    Appetizers: "bg-gold text-navy border-gold",
    Sides: "bg-navy text-white border-navy",
    Desserts: "bg-primary text-white border-primary",
    Formal: "bg-platinum text-navy border-platinum",
    Military: "bg-navy text-white border-navy"
  };
  return colors[category] || "bg-muted text-foreground border-border";
};
```

This ensures:
- **WCAG AA compliance**: White text on solid colored backgrounds
- **Clear visual hierarchy**: Badges pop against image backgrounds
- **Consistent branding**: Uses brand colors (ruby, gold, navy, platinum)

#### 3. Remove Extra Text After Button

Delete lines 339-341:
```typescript
// REMOVE THIS:
<p className="text-xs text-muted-foreground mt-3">
  Over 200+ photos showcasing our culinary artistry and event expertise
</p>
```

#### 4. Make Images Clickable (Open Modal)

**Mobile Story View** - Update the card touch handler to open modal:
```typescript
// Add onClick to open modal instead of toggling autoplay
onClick={() => handleImageClick(galleryItems[currentStoryIndex].src)}
```

**Desktop Grid View** - Update card click behavior:
```typescript
<Card
  onClick={() => handleImageClick(item.src)}
  // ...existing props
>
```

#### 5. Add Modal Component

At the end of the component, before the closing fragment:
```typescript
<EnhancedImageModal 
  images={galleryImages} 
  selectedIndex={selectedImageIndex} 
  onClose={handleCloseModal} 
/>
```

---

## Accessibility Improvements Summary

| Element | Before | After |
|---------|--------|-------|
| Wedding Badge | `bg-ruby/10 text-ruby` (low contrast) | `bg-ruby text-white` (WCAG AA) |
| Appetizers Badge | `bg-gold/10 text-gold` (low contrast) | `bg-gold text-navy` (WCAG AA) |
| Sides Badge | `bg-navy/10 text-navy` (low contrast) | `bg-navy text-white` (WCAG AA) |
| Desserts Badge | `bg-primary/10 text-primary` (low contrast) | `bg-primary text-white` (WCAG AA) |
| Formal Badge | `bg-platinum/10 text-platinum-foreground` | `bg-platinum text-navy` (WCAG AA) |
| Military Badge | `bg-navy/10 text-navy` (low contrast) | `bg-navy text-white` (WCAG AA) |

---

## User Experience Flow

```text
User clicks gallery image
        ↓
Modal opens showing ALL gallery images (80+)
        ↓
User can navigate with arrows/swipe
        ↓
Starting position = first image in full gallery
(matches behavior of gallery page)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/InteractiveGalleryPreview.tsx` | Add modal state, update badge colors, remove text, wire up click handlers, add EnhancedImageModal |

---

## Best Way to Think About This

**Conceptual Framework:**

1. **Separation of Concerns**: The 6 showcase images are a "preview" - a curated selection. When clicked, they should open the FULL gallery experience (all 80+ images), not just those 6.

2. **Reuse Existing Patterns**: `InteractiveGallerySection` already implements this exact pattern with `EnhancedImageModal`. We're adopting the same approach for consistency.

3. **Accessibility First**: Semi-transparent badges over photos are hard to read. Solid, brand-colored backgrounds with contrasting text ensure readability regardless of the image behind them.

4. **Progressive Enhancement**: Users get a visual preview → click for full experience → can navigate the entire gallery from there.
