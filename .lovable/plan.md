
# Gallery Page Performance & Mobile Optimization Plan

## Issues Identified

### 1. Console Warning: `fetchPriority` Prop Casing
**File:** `src/components/ui/optimized-image.tsx` (line 79)
- React warns about unrecognized DOM attribute `fetchPriority` - should be lowercase `fetchpriority`
- This warning appears on every image load

### 2. Large Image Dataset Loading All At Once
**Current State:**
- `galleryImages` array contains 80+ images from 4 categories (buffet: 38, wedding: 6, formal: 14, desserts: 15)
- All images are rendered simultaneously in `InteractiveImageGrid`
- No virtualization or progressive loading implemented
- Mobile devices attempting to load 80+ images causes severe performance issues

### 3. Missing Lazy Loading Threshold Optimization
**File:** `src/components/ui/optimized-image.tsx`
- Uses `loading="lazy"` but no `rootMargin` buffer to preload images before viewport entry
- Images only start loading when they're already visible, causing visible loading states

### 4. No Image Batch/Pagination Strategy
**File:** `src/components/gallery/InteractiveImageGrid.tsx`
- Renders all `sortedImages` at once with no pagination
- No "Load More" or infinite scroll implementation
- Desktop loads 5 columns * ~16 rows = 80 images simultaneously

### 5. Masonry Column Layout on Mobile
**Current:** `columns-1 sm:columns-2` on mobile
- Single column layout forces sequential loading of all 80+ images in one long list
- No optimization for viewport-only rendering

---

## Performance Optimization Plan

### Phase 1: Fix Console Warning (Quick Fix)
**File:** `src/components/ui/optimized-image.tsx`
- Change `fetchPriority` prop to lowercase `fetchpriority` for HTML5 compliance

### Phase 2: Implement Progressive Loading with "Load More"
**File:** `src/components/gallery/InteractiveImageGrid.tsx`

Add pagination with initial load of 12-16 images and "Load More" button:

```typescript
// New state
const [visibleCount, setVisibleCount] = useState(16);

// Show subset
const displayedImages = sortedImages.slice(0, visibleCount);

// Load more handler
const handleLoadMore = () => {
  setVisibleCount(prev => Math.min(prev + 12, sortedImages.length));
};
```

**Mobile-specific:** Load 8 images initially, then 8 more per tap

### Phase 3: Add IntersectionObserver-based Lazy Loading Buffer
**File:** `src/components/ui/optimized-image.tsx`

Add `rootMargin` to native lazy loading to preload images 200px before viewport:

```typescript
<img
  ...
  loading={priority ? "eager" : "lazy"}
  // Add data attribute for potential Intersection Observer enhancement
  data-src={src}
/>
```

### Phase 4: Optimize Image Priority Logic
**File:** `src/components/gallery/InteractiveImageGrid.tsx`

Set `priority={true}` for first 4 images (above the fold):

```typescript
<OptimizedImage
  ...
  priority={index < 4}
/>
```

### Phase 5: Add Mobile-First Grid Optimization
**File:** `src/components/gallery/InteractiveImageGrid.tsx`

Reduce initial mobile load and optimize column gaps:

| Device | Initial Load | Columns | Load More |
|--------|--------------|---------|-----------|
| Mobile | 8 images | 1-2 | +8 |
| Tablet | 12 images | 2-3 | +8 |
| Desktop | 16 images | 4-5 | +12 |

### Phase 6: Add Loading State Skeleton Improvements
**File:** `src/components/ui/optimized-image.tsx`

Improve perceived performance with better skeleton animation timing and reduced jank.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/optimized-image.tsx` | Fix `fetchPriority` casing, add rootMargin buffer |
| `src/components/gallery/InteractiveImageGrid.tsx` | Add pagination, "Load More", mobile-first loading |
| `src/components/gallery/CategoryCards.tsx` | Add priority to category preview images |

---

## Technical Implementation Details

### InteractiveImageGrid.tsx Changes

```typescript
// Add responsive initial load counts
const getInitialLoadCount = () => {
  return isMobile ? 8 : 16;
};

const [visibleCount, setVisibleCount] = useState(getInitialLoadCount());
const hasMoreImages = visibleCount < sortedImages.length;
const displayedImages = sortedImages.slice(0, visibleCount);

// Load more button at bottom
{hasMoreImages && (
  <div className="flex justify-center mt-8">
    <Button 
      variant="outline" 
      onClick={() => setVisibleCount(prev => prev + (isMobile ? 8 : 12))}
    >
      Load More ({sortedImages.length - visibleCount} remaining)
    </Button>
  </div>
)}
```

### OptimizedImage.tsx Changes

```typescript
// Fix casing issue
<img
  ...
  fetchpriority={priority ? "high" : "auto"}  // lowercase for HTML5
  ...
/>
```

### ImageCard Priority

```typescript
// In ImageCard rendering
<OptimizedImage
  src={image.src}
  alt={image.title}
  priority={index < 4}  // First 4 images load immediately
  ...
/>
```

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Initial images loaded | 80+ | 8-16 |
| Console warnings | 1 per image | 0 |
| Mobile LCP | Slow (loading spinner) | Fast (first 4 priority) |
| User experience | Images not loading | Smooth progressive load |
| Data usage (mobile) | All 80+ images | Only what's viewed |

---

## Summary

1. **Fix `fetchPriority` casing** to eliminate console warnings
2. **Implement "Load More" pagination** to reduce initial load from 80+ to 8-16 images
3. **Add priority loading** for first 4 images to eliminate visible loading spinners
4. **Mobile-first approach** with smaller initial batch sizes for mobile devices
5. **Progressive enhancement** allowing users to load more as needed
