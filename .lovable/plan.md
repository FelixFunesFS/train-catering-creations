
# Reviews Page Gallery Repositioning & Menu Gallery 2-Row Update

## Overview

This plan addresses three changes:
1. **Reviews Page**: Move the image gallery to inside the hero section (after CTA button, before 5-star rating)
2. **Reviews Page**: Center the images and replace them with different images from the gallery assets
3. **Menu Page**: Convert the 8-image gallery from 1 row to 2 rows

---

## Part 1: Reviews Page Changes

### Current Structure (Lines 79-108)
```
PageHeader
  → Badge
  → Title  
  → Description
  → CTA Button ("About Us")
  
Additional Content (Lines 94-105)
  → 5 Stars + "5.0" rating
  → Review count text
  → Location text

PageSection pattern="b" (Lines 110-113)
  → ReviewsImageStrip (separate section)
```

### New Structure
```
PageHeader
  → Badge
  → Title  
  → Description
  → CTA Button ("About Us")

Image Gallery (MOVED HERE - centered)
  → 5 new centered images

5 Stars + Rating info
```

### Image Replacements

**Current Images** (to be replaced):
1. charcuterie-spread.jpg
2. berry-tart-tower.jpg
3. chafing-dish-roses.jpg
4. food-mac-cheese.jpg
5. food-salmon.jpg

**New Images** (more variety, avoiding duplicates from other pages):
1. `buffet-orchid-setup.jpg` - Elegant orchid buffet setup
2. `dessert-mini-cheesecakes.jpg` - Gourmet mini cheesecakes
3. `formal-gold-reception.jpg` - Formal gold reception setting
4. `bbq-outdoor-carving.jpg` - BBQ carving station
5. `buffet-holiday-wings.jpg` - Holiday wings display

### Centering Changes

Current layout uses `flex` with `min-w-max` which causes horizontal scroll. 

New layout will use:
- `flex flex-wrap justify-center` for centered wrapping
- Remove `min-w-max` to allow natural centering
- Adjust gap and sizing for responsiveness

---

## Part 2: Menu Page Gallery Changes

### Current Grid (Line 92)
```
grid-cols-2 sm:grid-cols-4 lg:grid-cols-8
```
This displays 8 images in a single row on desktop (8 cols = 1 row).

### New Grid
```
grid-cols-2 sm:grid-cols-4 lg:grid-cols-4
```
This displays 8 images in 2 rows on desktop (4 cols = 2 rows of 4).

### Responsive Breakdown
| Breakpoint | Columns | Rows with 8 images |
|------------|---------|-------------------|
| Mobile (<640px) | 2 | 4 rows |
| Tablet (640-1024px) | 4 | 2 rows |
| Desktop (1024px+) | 4 | 2 rows |

---

## Implementation Details

### File 1: `src/components/reviews/ReviewsImageStrip.tsx`

**Changes:**
1. Replace 5 images with new selections
2. Change layout from horizontal scroll to centered flex-wrap
3. Remove `overflow-x-auto` and `min-w-max`
4. Add `flex-wrap justify-center` for centering
5. Adjust image sizes for better presentation

**Updated Code Pattern:**
```tsx
const images = [
  { src: buffetOrchidSetup, alt: "Elegant orchid buffet setup" },
  { src: dessertMiniCheesecakes, alt: "Gourmet mini cheesecakes" },
  { src: formalGoldReception, alt: "Formal gold reception setting" },
  { src: bbqOutdoorCarving, alt: "BBQ outdoor carving station" },
  { src: buffetHolidayWings, alt: "Holiday wings display" },
];

// Layout change
<div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
  {/* Images centered and wrapping on smaller screens */}
</div>
```

### File 2: `src/pages/Reviews.tsx`

**Changes:**
1. Move `ReviewsImageStrip` component from its own `PageSection` (lines 110-113)
2. Insert it inside the header section, after the CTA button and before the star rating
3. Remove the now-empty `PageSection pattern="b"`
4. Update `PageSection` pattern sequence (c→b, d→c)

**New Structure:**
```tsx
<PageSection pattern="a">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div ref={headerRef} className={headerAnimationClass}>
      <PageHeader ... />
      
      {/* Image Strip - NOW INSIDE HERO */}
      <div className="mt-6 sm:mt-8">
        <ReviewsImageStrip />
      </div>
      
      {/* Star Rating - After images */}
      <div className="text-center mt-6 max-w-4xl mx-auto">
        <div className="flex justify-center ...">
          {renderStars(5)}
          ...
        </div>
      </div>
    </div>
  </div>
</PageSection>

{/* Reviews Section - now pattern "b" */}
<PageSection pattern="b">
  ...reviews cards...
</PageSection>
```

### File 3: `src/components/menu/MenuFoodGallery.tsx`

**Changes:**
1. Update grid from `lg:grid-cols-8` to `lg:grid-cols-4`

**Line 92 Change:**
```tsx
// Before
className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 px-2 sm:px-3"

// After  
className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-3"
```

---

## Visual Summary

```text
REVIEWS PAGE (After Changes):
┌──────────────────────────────────────┐
│           [Badge: Testimonials]       │
│           Client Reviews              │
│    Real Stories, Real Satisfaction    │
│         [About Us Button]             │
│                                       │
│     ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │  ← Images CENTERED, inside hero
│     │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │    │
│     └───┘ └───┘ └───┘ └───┘ └───┘    │
│                                       │
│      ★★★★★ 5.0                        │  ← Stars now AFTER images
│   Based on 6+ reviews...              │
├──────────────────────────────────────┤
│        [Review Cards Grid]            │
├──────────────────────────────────────┤
│        [Team Photo Section]           │
├──────────────────────────────────────┤
│        [Feedback Card]                │
├──────────────────────────────────────┤
│        [CTA Section]                  │
└──────────────────────────────────────┘

MENU PAGE (After Changes):
┌──────────────────────────────────────┐
│         [Menu Categories]             │
├──────────────────────────────────────┤
│      A Taste of What We Serve         │
│                                       │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐           │  ← Row 1
│    │ 1 │ │ 2 │ │ 3 │ │ 4 │           │
│    └───┘ └───┘ └───┘ └───┘           │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐           │  ← Row 2
│    │ 5 │ │ 6 │ │ 7 │ │ 8 │           │
│    └───┘ └───┘ └───┘ └───┘           │
│                                       │
├──────────────────────────────────────┤
│          [Crimson CTA]                │
└──────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/reviews/ReviewsImageStrip.tsx` | Replace images, center layout |
| `src/pages/Reviews.tsx` | Move image strip into hero, reorder sections |
| `src/components/menu/MenuFoodGallery.tsx` | Change to 2-row grid (lg:grid-cols-4) |

---

## Responsive Considerations

1. **Reviews Image Strip**: 
   - Mobile: Images wrap to multiple rows, centered
   - Tablet: 3-5 images visible, centered
   - Desktop: All 5 images in single centered row

2. **Menu Gallery**:
   - Mobile: 2 columns = 4 rows
   - Tablet/Desktop: 4 columns = 2 rows

3. **Hero Section Flow**:
   - Content stacks naturally on all devices
   - Proper spacing with `mt-6 sm:mt-8` for image strip
