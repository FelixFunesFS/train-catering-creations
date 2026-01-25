

# Adding Imagery to Gallery, Reviews, and FAQ Pages

## Overview

This plan adds visually engaging imagery to three key pages using the 9 uploaded photos plus existing assets. Each page will receive a unique treatment appropriate to its purpose and content flow.

---

## Image Assets to Add

The 9 uploaded images will be saved to `src/assets/gallery/`:

| Filename | Description | Best Use |
|----------|-------------|----------|
| `buffet-wings-outdoor.jpg` | Wings, chicken & mac cheese trays outdoors | FAQ background |
| `charcuterie-spread.jpg` | Elaborate cheese & meat board | Reviews visual |
| `breakfast-spread.jpg` | Eggs, bacon, sausages | Gallery addition |
| `berry-tart-tower.jpg` | Tiered fresh berry tarts | Reviews accent |
| `chafing-dish-roses.jpg` | Elegant setup with roses & American flag | FAQ visual |
| `holiday-sides.jpg` | Green beans, mac cheese, rice with poinsettias | Gallery addition |
| `team-western-group.jpg` | Full team in matching western attire | Reviews hero |
| `team-service-action.jpg` | Team actively serving guests | Gallery addition |
| `team-buffet-line.jpg` | Full buffet line with team working | Gallery addition |

---

## Page-by-Page Implementation

### 1. Gallery Page (`AlternativeGallery.tsx`)

**Current State**: Has hero, category navigation, and image grid with 80+ images.

**Enhancement**: Add 4 new images to the gallery collection for more variety.

**Implementation**:
- Add 4 uploaded images to `src/data/gallery/buffetImages.ts`:
  - Breakfast spread
  - Holiday sides with poinsettias
  - Team service action shot
  - Full buffet line with team

---

### 2. Reviews Page (`Reviews.tsx`)

**Current State**: Text-only testimonial cards with no imagery.

**Enhancement**: Add a cinematic background section with team imagery and a mini food gallery strip.

**Design Approach**:

```text
+---------------------------------------+
|  [Existing Header with PageHeader]    |
+---------------------------------------+
|                                       |
|  NEW: Visual Showcase Strip           |
|  ┌─────┬─────┬─────┬─────┬─────┐      |
|  │ img │ img │ img │ img │ img │      |  (horizontal scroll on mobile)
|  └─────┴─────┴─────┴─────┴─────┘      |
|                                       |
+---------------------------------------+
|  [Existing Review Cards Grid]         |
+---------------------------------------+
|                                       |
|  NEW: Team Photo Section              |
|  ┌─────────────────────────────┐      |
|  │  Background: Team group     │      |  (85% overlay, gradient fades)
|  │  "The Faces Behind Your     │      |
|  │   Perfect Event"            │      |
|  └─────────────────────────────┘      |
|                                       |
+---------------------------------------+
|  [Existing Feedback Card + CTA]       |
+---------------------------------------+
```

**Components to Create**:
- `ReviewsImageStrip.tsx` - Horizontal scrolling food gallery (5 images)
- `ReviewsTeamSection.tsx` - Full-width background with team photo

**Images Used**:
- Image strip: charcuterie, berry tarts, chafing dish with roses, mac cheese, salmon
- Team background: Team western group photo

---

### 3. FAQ Page (`FAQ.tsx`)

**Current State**: Text-heavy with search, filters, accordion, and CTA.

**Enhancement**: Add a background image section between FAQ content and CTA to break up text.

**Design Approach**:

```text
+---------------------------------------+
|  [Existing Header]                    |
+---------------------------------------+
|  [Search + Category Filters]          |
+---------------------------------------+
|  [FAQ Accordion]                      |
+---------------------------------------+
|                                       |
|  NEW: Visual Break Section            |
|  ┌─────────────────────────────┐      |
|  │  Background: Buffet setup   │      |  (85% overlay)
|  │  "Still hungry for answers? │      |
|  │   See our food in action."  │      |
|  │  [View Gallery] button      │      |
|  └─────────────────────────────┘      |
|                                       |
+---------------------------------------+
|  [Existing Contact CTA]               |
+---------------------------------------+
```

**Component to Create**:
- `FAQVisualBreak.tsx` - Background section with outdoor buffet image

**Images Used**:
- Background: Outdoor wings buffet OR chafing dish with roses (professional setup)

---

## Technical Implementation Details

### New Asset Files

Copy 9 images to `src/assets/gallery/`:
```
src/assets/gallery/buffet-wings-outdoor.jpg
src/assets/gallery/charcuterie-spread.jpg
src/assets/gallery/breakfast-spread.jpg
src/assets/gallery/berry-tart-tower.jpg
src/assets/gallery/chafing-dish-roses.jpg
src/assets/gallery/holiday-sides.jpg
src/assets/gallery/team-western-group.jpg
src/assets/gallery/team-service-action.jpg
src/assets/gallery/team-buffet-line.jpg
```

### Gallery Data Updates

**File**: `src/data/gallery/buffetImages.ts`

Add 4 new entries:
```typescript
{
  src: breakfastSpread,
  category: "buffet",
  title: "Sunrise Breakfast Buffet",
  description: "Fluffy scrambled eggs, crispy bacon, sausage links and patties ready to start your day",
  quality: 8
},
{
  src: holidaySides,
  category: "buffet", 
  title: "Holiday Comfort Sides",
  description: "Southern green beans, golden mac & cheese, and savory rice with festive white poinsettias",
  quality: 8
},
{
  src: teamServiceAction,
  category: "team",
  title: "Professional Service in Action",
  description: "Our team serving guests with attention to detail and Southern hospitality",
  quality: 9
},
{
  src: teamBuffetLine,
  category: "team",
  title: "Full Service Buffet Line",
  description: "Complete chafing dish setup with our coordinated team ready to serve",
  quality: 9
}
```

### Reviews Page Components

**File**: `src/components/reviews/ReviewsImageStrip.tsx`
- Horizontal scrollable container with `overflow-x-auto`
- 5 food images using `OptimizedFloatingImage`
- Responsive: gap-3 on mobile, gap-4 on desktop
- Images have aspect-square, rounded corners
- Staggered scroll animations

**File**: `src/components/reviews/ReviewsTeamSection.tsx`
- Full-width section with team photo background
- 85% white overlay matching site standards
- Top/bottom gradient fades (h-16 sm:h-20)
- Centered text content with elegant typography
- Optional "View Gallery" link

**File Updates**: `src/pages/Reviews.tsx`
- Import new components
- Add `ReviewsImageStrip` after header section
- Add `ReviewsTeamSection` before CTA section

### FAQ Page Component

**File**: `src/components/faq/FAQVisualBreak.tsx`
- Background image section (outdoor buffet or elegant chafing dish)
- 85% white overlay
- Gradient fades top/bottom
- Short engaging text + "View Gallery" button
- Scroll animation on entry

**File Updates**: `src/pages/FAQ.tsx`
- Import new component
- Add between FAQ accordion and Contact CTA sections

---

## Design Standards Applied

| Standard | Implementation |
|----------|----------------|
| Background overlay | 85% white (`bg-background/85`) |
| Gradient fades | h-16 sm:h-20 lg:h-24 top/bottom |
| Scroll animations | `useScrollAnimation` hook |
| Mobile-first | Horizontal scroll, stacked layouts |
| Accessibility | Proper alt text, contrast ratios |
| No parallax | Per memory, removed for stability |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/reviews/ReviewsImageStrip.tsx` | Horizontal food gallery strip |
| `src/components/reviews/ReviewsTeamSection.tsx` | Team photo background section |
| `src/components/faq/FAQVisualBreak.tsx` | Visual break with buffet background |

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/gallery/buffetImages.ts` | Add 4 new image entries |
| `src/pages/Reviews.tsx` | Integrate image strip + team section |
| `src/pages/FAQ.tsx` | Add visual break section |

## Assets to Copy

9 images from user uploads to `src/assets/gallery/`

---

## Visual Summary

```text
REVIEWS PAGE:
┌──────────────────────────────────┐
│         [Header]                 │
├──────────────────────────────────┤
│  ◀ [img] [img] [img] [img] ▶     │  ← NEW: Scrolling food strip
├──────────────────────────────────┤
│     [Review Cards Grid]          │
├──────────────────────────────────┤
│  ╔════════════════════════════╗  │
│  ║  TEAM PHOTO BACKGROUND     ║  │  ← NEW: Full-width team hero
│  ║  "The Faces Behind..."     ║  │
│  ╚════════════════════════════╝  │
├──────────────────────────────────┤
│     [Feedback + CTA]             │
└──────────────────────────────────┘

FAQ PAGE:
┌──────────────────────────────────┐
│         [Header]                 │
├──────────────────────────────────┤
│     [Search + Filters]           │
├──────────────────────────────────┤
│     [FAQ Accordion]              │
├──────────────────────────────────┤
│  ╔════════════════════════════╗  │
│  ║  BUFFET BACKGROUND         ║  │  ← NEW: Visual break
│  ║  "See our food in action"  ║  │
│  ║      [View Gallery]        ║  │
│  ╚════════════════════════════╝  │
├──────────────────────────────────┤
│     [Contact CTA]                │
└──────────────────────────────────┘

GALLERY PAGE:
- 4 new images added to existing grid
- No structural changes needed
```

