
# Fix Individual Card Loading Across Site

## Overview
Multiple components across the site use individual card animations that create a slow, fragmented loading experience. This plan consolidates the fix to use unified group animations where appropriate, improving perceived performance and visual cohesion.

## Site-Wide Animation Audit Results

### Components Needing Fix

| Component | Page | Current Issue | Items | Total Delay |
|-----------|------|---------------|-------|-------------|
| InteractiveGalleryPreview | Home | Cards animate 1-by-1 | 6 | 1050ms |
| MenuFoodGallery | Menu | Cards animate 1-by-1 | 8 | 610ms |
| ReviewsImageStrip | Reviews | Images animate 1-by-1 | 5 | 400ms |
| Reviews cards | Reviews | Each card has its own hook | 6 | 600ms |

### Already Good (No Changes Needed)

| Component | Page | Why It Works |
|-----------|------|--------------|
| ServiceCategoriesSection | Home | Just fixed - group animation |
| InteractiveImageGrid | Gallery | Already uses group animation on container |
| CategoryCards | Gallery | Already uses group animation on container |
| SimplifiedMenu categories | Menu | Vertical list, stagger is acceptable |

## Performance Philosophy

**Use group animation (all items appear together) when:**
- Small groups of 2-6 items that represent related choices
- Cards at the same visual hierarchy level
- Above-the-fold content needing fast perceived load

**Keep staggered animation when:**
- Large grids of 20+ items (masonry gallery)
- Vertical lists where items expand/collapse
- Content where cascade adds visual interest without blocking interaction

## Implementation Details

### 1. InteractiveGalleryPreview.tsx (Home Page Gallery)

**Current (lines 37-42):**
```typescript
const staggered = useStaggeredAnimation({
  itemCount: 6,
  staggerDelay: 150,
  baseDelay: 300,
  variant: 'bounce-in'
});
```

**Change to:**
```typescript
const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ 
  variant: 'fade-up', 
  delay: 100 
});
const gridAnimationClass = useAnimationClass('fade-up', gridVisible);
```

**Update grid container (line 291-294):**
- Change `ref={staggered.ref}` to `ref={gridRef}`
- Add `${gridAnimationClass}` to className
- Remove `${staggered.getItemClassName(index)}` from Card
- Remove `style={staggered.getItemStyle(index)}` from Card
- Remove `useStaggeredAnimation` import

### 2. MenuFoodGallery.tsx (Menu Page Gallery)

**Current (lines 54-59):**
```typescript
const staggered = useStaggeredAnimation({
  itemCount: galleryImages.length,
  staggerDelay: 80,
  baseDelay: 50,
  variant: 'fade-up'
});
```

**Change to:**
```typescript
const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation({ 
  variant: 'fade-up', 
  delay: 50 
});
const galleryAnimationClass = useAnimationClass('fade-up', galleryVisible);
```

**Update grid container:**
- Apply ref and animation class to grid div
- Remove staggered classes/styles from individual cards
- Remove `useStaggeredAnimation` import

### 3. ReviewsImageStrip.tsx (Reviews Page)

**Current (lines 17-22):**
```typescript
const { ref, getItemClassName } = useStaggeredAnimation({
  itemCount: images.length,
  staggerDelay: 75,
  baseDelay: 100,
  variant: 'bounce-in'
});
```

**Change to:**
```typescript
const { ref, isVisible } = useScrollAnimation({ 
  variant: 'bounce-in', 
  delay: 100 
});
const animationClass = useAnimationClass('bounce-in', isVisible);
```

**Update container:**
- Apply `animationClass` to the flex container div
- Remove `${getItemClassName(index)}` from individual image divs

### 4. Reviews.tsx (Review Cards)

**Current (lines 176-182) - Each card has its own hook:**
```typescript
reviews.map((review, index) => {
  const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
    variant: 'elastic', 
    delay: index * 100,  // Creates cascade
    ...
  });
```

**Change to unified grid animation:**
```typescript
// Single animation for entire grid (before map)
const { ref: reviewsGridRef, isVisible: reviewsGridVisible } = useScrollAnimation({ 
  variant: 'fade-up', 
  delay: 100 
});
const reviewsGridAnimationClass = useAnimationClass('fade-up', reviewsGridVisible);

// In JSX:
<div 
  ref={reviewsGridRef}
  className={`grid md:grid-cols-2 gap-4 ... ${reviewsGridAnimationClass}`}
>
  {reviews.map((review, index) => (
    <NeumorphicCard key={index} level={2} className="hover:scale-105 ...">
```

Remove the individual `useScrollAnimation` hook from inside the map function.

## Files to Modify

| File | Changes |
|------|---------|
| src/components/home/InteractiveGalleryPreview.tsx | Replace staggered with group animation |
| src/components/menu/MenuFoodGallery.tsx | Replace staggered with group animation |
| src/components/reviews/ReviewsImageStrip.tsx | Replace staggered with group animation |
| src/pages/Reviews.tsx | Replace per-card animations with single grid animation |

## Visual Result

**Before:** Cards/images pop in one-by-one with visible delays, creating a "loading" feel

**After:** All items in a group appear simultaneously with a single smooth animation, feeling instant and cohesive

## Performance Impact

- Reduced JavaScript execution (fewer setTimeout calls)
- Fewer DOM mutations during scroll
- Faster Time to Interactive (TTI)
- Consistent experience across mobile and desktop

## What Stays Staggered (By Design)

- **InteractiveImageGrid** (Gallery page): 80+ images in masonry layout - cascade is a feature
- **SimplifiedMenu categories**: 4 vertical sections - stagger aids visual hierarchy
- **About page sections**: Full sections, not cards - different context
