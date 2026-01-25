
# Fix Service Cards Slow/Individual Loading

## The Problem

The three service cards on the homepage currently animate individually with noticeable delays:
- 400ms before first card appears
- 200ms gap between each subsequent card
- Total perceived load time: ~800ms

This creates a "slow loading" appearance when the cards should feel like a unified group appearing together.

## Root Cause

The `ServiceCategoriesSection.tsx` uses `useStaggeredAnimation` with aggressive timing:

```typescript
const staggered = useStaggeredAnimation({
  itemCount: 3,
  staggerDelay: 200,  // 200ms between each card
  baseDelay: 400,     // 400ms before first card
  variant: 'bounce-in'
});
```

This creates the cascade effect where cards 1, 2, and 3 appear at 400ms, 600ms, and 800ms respectively.

## Solution: Simultaneous Group Animation

Replace the staggered animation with a single group animation using `useScrollAnimation`. All three cards will animate together as one cohesive unit.

## Technical Changes

### File: src/components/home/ServiceCategoriesSection.tsx

**1. Remove staggered animation hook import and usage**

Remove:
```typescript
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";

const staggered = useStaggeredAnimation({
  itemCount: 3,
  staggerDelay: 200,
  baseDelay: 400,
  variant: 'bounce-in'
});
```

**2. Add a dedicated scroll animation for the cards grid**

Add:
```typescript
const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ 
  variant: 'fade-up', 
  delay: 100 
});

const cardsAnimationClass = useAnimationClass('fade-up', cardsVisible);
```

**3. Update the grid container**

Change:
```tsx
<div 
  ref={staggered.ref}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6"
>
```

To:
```tsx
<div 
  ref={cardsRef}
  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 ${cardsAnimationClass}`}
>
```

**4. Remove staggered classes from individual cards**

Change:
```tsx
<Card
  className={`... ${staggered.getItemClassName(index)}`}
  style={staggered.getItemStyle(index)}
>
```

To:
```tsx
<Card className="...">  // No dynamic class or style
```

## Performance Comparison Across Pages

| Page/Section | Current Stagger | Base Delay | Total Load Feel | Recommendation |
|--------------|-----------------|------------|-----------------|----------------|
| **Services Cards (Home)** | 200ms | 400ms | 800ms (slow) | Fix - simultaneous |
| Gallery Preview (Home) | 150ms | 300ms | 1050ms | Acceptable for 6 items |
| Menu Categories | 150ms | 100ms | 550ms | Acceptable for 4 items |
| Masonry Gallery | 80ms | 150ms | Fast cascade | Acceptable for many items |

## Screen Size Responsiveness

The fix maintains full responsiveness:
- Mobile (1 column): All 3 cards stacked, animate together
- Tablet (2 columns): 2+1 layout, animate together
- Desktop (3 columns): Side-by-side, animate together

The existing CSS already handles responsive layouts via `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

## Visual Result

**Before:** Cards appear one-by-one with 200ms gaps, creating a slow/broken feel

**After:** All 3 cards fade up together as a cohesive group in ~300ms total, feeling instant and unified

## Files Modified

| File | Change |
|------|--------|
| `src/components/home/ServiceCategoriesSection.tsx` | Replace staggered animation with unified group animation |

## Why This Is Better UX

1. **Faster perceived load** - Users see all content at once instead of waiting
2. **Group cohesion** - The three service options feel like related choices, not separate elements
3. **Reduced motion fatigue** - Less animation noise for users
4. **Mobile-first** - Especially important on mobile where stacking makes the cascade more jarring
5. **Maintains polish** - Still has a subtle fade-up entrance, just applied to the group
