

# Remove Heart Component and Fix Modal Button Contrast

## Overview
This plan addresses two issues:
1. Remove the heart/favorite component from gallery image cards
2. Fix the modal navigation buttons (left, right, close) to have better contrast against light images

---

## Changes

### 1. Remove Heart/Favorites from InteractiveImageGrid.tsx

**Remove:**
- `Heart` import from lucide-react (line 10)
- `favorites` state and `setFavorites` (line 23)
- `toggleFavorite` function (lines 46-56)
- `isFavorite` variable in ImageCard (line 65)
- Heart button JSX in the hover overlay (lines 88-98)

**Simplified ImageCard content section:**
```tsx
{/* Content - Visible on hover */}
<div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
  <h3 className="font-elegant font-semibold text-white text-sm sm:text-base line-clamp-1">
    {image.title}
  </h3>
</div>
```

---

### 2. Fix Modal Button Contrast in EnhancedImageModal.tsx

The modal background is dark (`bg-black/95`), but the navigation buttons may blend with light-colored images. 

**Add visible backgrounds to all control buttons:**

**Close button (line 102-110):**
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  onClick={onClose}
  className="text-white bg-black/50 hover:bg-black/70 h-10 w-10 p-0 rounded-full backdrop-blur-sm"
  aria-label="Close modal"
>
  <X className="h-5 w-5" />
</Button>
```

**Previous button (line 122-131):**
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full backdrop-blur-sm"
  onClick={handlePrevious}
  disabled={images.length <= 1}
  aria-label="Previous image"
>
  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
</Button>
```

**Next button (line 141-150):**
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full backdrop-blur-sm"
  onClick={handleNext}
  disabled={images.length <= 1}
  aria-label="Next image"
>
  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
</Button>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/gallery/InteractiveImageGrid.tsx` | Remove Heart import, favorites state, toggleFavorite function, and heart button |
| `src/components/gallery/EnhancedImageModal.tsx` | Add semi-transparent dark backgrounds to navigation buttons |

---

## Result

- No more heart/favorite icons on gallery images - cleaner, distraction-free experience
- Modal navigation buttons (close, left, right arrows) have visible dark semi-transparent backgrounds with blur
- Controls remain clearly visible regardless of image content brightness
- Improved accessibility with better contrast ratios

