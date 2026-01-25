
# Menu Food Gallery Enhancement & CTA Background Strategy

## Overview

This plan addresses three items:
1. Make the "A Taste of What We Serve" gallery in the menu section full-bleed
2. Update gallery images (remove mac & cheese, add 4 new images)
3. Review and optimize CTA backgrounds across all pages

---

## Part 1: MenuFoodGallery Changes

### Current State
The gallery is constrained within a `max-w-6xl` container with `px-4 sm:px-6 lg:px-8` padding, limiting it to about 1152px max width.

### Changes

**A. Make Gallery Full-Bleed**
- Remove the container constraint so images span edge-to-edge
- Keep header centered with max-width
- Expand image grid to use full viewport width
- Maintain responsive columns: 2 cols (mobile) to 8 cols (desktop) for more images

**B. Update Gallery Images**

Remove:
- `food-mac-cheese.jpg` - "Golden Mac & Cheese"

Add 4 new images (to be saved to `src/assets/gallery/`):
1. `holiday-meats.jpg` - Fried chicken varieties + glazed ham with pineapple
2. `sides-holiday.jpg` - Mac & cheese with potato salad and holiday decorations
3. `military-charcuterie.jpg` - Military ceremony with elaborate charcuterie spread
4. `chicken-waffles.jpg` - Chicken and waffles with fresh berries

**New Gallery Array (8 images total):**
```
1. Cajun-Spiced Salmon (existing)
2. Herb-Roasted Chicken (existing)
3. Full Service Setup (existing)
4. Holiday Cupcakes (existing)
5. Holiday Meats Platter (NEW)
6. Sides & Potato Salad (NEW)
7. Military Ceremony Spread (NEW)
8. Chicken & Waffles (NEW)
```

---

## Part 2: CTA Background Strategy

### Analysis

| Page | Current CTA | Purpose | Recommendation |
|------|-------------|---------|----------------|
| **Home** | Crimson gradient + watermark | Primary conversion page | **Keep crimson** - Brand anchor, drives quotes |
| **About** | Crimson gradient | Team/story context | **Add image background** - Team photo reinforces family narrative |
| **Menu** | Crimson gradient | Menu completion | **Keep crimson** - Clean, food-focused content above |
| **Gallery** | Crimson gradient | Visual completion | **Keep crimson** - Page is image-heavy, needs contrast |
| **Reviews** | Crimson gradient | Social proof completion | **Keep crimson** - Already has team image section above it |
| **FAQ** | Image break + neumorphic card | Informational | **Keep current** - Unique pattern works well for FAQ |

### Rationale

**Keep Crimson Gradient:**
- Home, Menu, Gallery, Reviews

These pages either:
- Are the primary brand anchor (Home)
- Already contain significant imagery above the CTA
- Need visual contrast to "close" the page effectively

**Convert to Image Background:**
- About page only

The About page is focused on storytelling and family. Adding a warm buffet/service image background to the CTA would reinforce the "family catering" message while creating visual interest. The current About CTA feels disconnected from the rich imagery in the sections above.

---

## Part 3: Implementation Details

### New Asset Files

Copy 4 images to `src/assets/gallery/`:
```
src/assets/gallery/holiday-meats.jpg
src/assets/gallery/sides-holiday.jpg  
src/assets/gallery/military-charcuterie.jpg
src/assets/gallery/chicken-waffles.jpg
```

### File Changes

**1. `src/components/menu/MenuFoodGallery.tsx`**
- Remove `food-mac-cheese.jpg` import
- Add 4 new image imports
- Update `galleryImages` array
- Remove `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` from outer container
- Keep header centered with `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Grid becomes full-width with edge padding only (`px-3 sm:px-4 lg:px-6`)
- Update grid columns to accommodate 8 images: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-8`

**2. `src/pages/About.tsx`**
- Replace bottom CTASection with new component that has image background
- Use existing buffet image (e.g., `buffet-orchid-setup.jpg` or `buffet-outdoor-tent.jpg`)
- Apply standard 85% overlay + gradient fades
- Keep same CTA content and buttons

### About Page CTA Enhancement

Create a new pattern that wraps the CTASection concept with an image background:

```tsx
<section className="relative py-10 sm:py-12 lg:py-16 overflow-hidden">
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${buffetOrchidSetup})` }}
  />
  
  {/* Overlay */}
  <div className="absolute inset-0 bg-primary/85" />
  
  {/* Gradient Fades */}
  <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-background to-transparent z-10" />
  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent z-10" />
  
  {/* Content - Same as CTASection */}
  <div className="relative z-20 mx-4 sm:mx-6 lg:mx-8">
    {/* ... CTA content ... */}
  </div>
</section>
```

---

## Visual Summary

```text
MENU PAGE (After Changes):
┌──────────────────────────────────────────────────────────────┐
│                    [Menu Categories]                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│            ★ A Taste of What We Serve ★                      │  ← Header centered
│                                                               │
│ ┌────┬────┬────┬────┬────┬────┬────┬────┐                    │
│ │img1│img2│img3│img4│img5│img6│img7│img8│ ← Full-bleed grid   │
│ └────┴────┴────┴────┴────┴────┴────┴────┘                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│              [Crimson CTA - Keep As-Is]                       │
└──────────────────────────────────────────────────────────────┘

ABOUT PAGE (CTA Enhancement):
┌──────────────────────────────────────────────────────────────┐
│                    [Values Section]                           │
├──────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════════╗│
│  ║  BACKGROUND: Buffet setup image                          ║│
│  ║  OVERLAY: 85% crimson (not white)                        ║│
│  ║                                                          ║│
│  ║     "Ready to Experience Soul Train's Difference?"       ║│
│  ║           [Request Quote]  [View Our Menu]               ║│
│  ║                                                          ║│
│  ╚══════════════════════════════════════════════════════════╝│
└──────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/MenuFoodGallery.tsx` | Full-bleed layout, 8 images, remove mac cheese |
| `src/pages/About.tsx` | Replace CTASection with image-backed CTA section |

## Assets to Copy

4 new images from user uploads to `src/assets/gallery/`

---

## Technical Notes

- The full-bleed gallery will use horizontal scrolling on mobile (2 cols visible) and show all 8 images on desktop
- Responsive breakpoints: 2→4→8 columns ensures clean grid at all sizes
- About CTA uses crimson overlay (not white) to maintain brand color while adding visual depth
- All other pages keep their current crimson gradient CTAs for consistency
