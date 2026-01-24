
# Mobile UX Enhancement Plan

## Overview
This plan addresses four key areas for improving the mobile user experience on the home page:
1. Scroll-aware MobileActionBar (hide until past hero)
2. Above-the-fold CTA visibility in the hero
3. Strategic scrolling marquees for engagement
4. General mobile responsiveness improvements

---

## 1. Scroll-Aware MobileActionBar

### Current Behavior
The sticky bottom bar with "Request Quote" and "Text Us" buttons appears immediately when the page loads, which can:
- Obstruct the hero CTAs that are already visible
- Create redundant visual noise above the fold
- Cover important hero content on smaller phones

### Proposed Solution
Add scroll-position detection to `MobileActionBar.tsx` using IntersectionObserver (matching existing patterns in the codebase).

**Implementation Details:**
- Create a sentinel element at the bottom of the hero section
- Use IntersectionObserver to track when the hero exits the viewport
- Only show MobileActionBar after the hero is scrolled past
- Add a smooth fade-in transition (200-300ms) for polish

**Technical Approach:**
```text
+------------------+        +------------------+
|      Hero        |        |   Services...    |
|  [CTAs visible]  |  -->   |                  |
|                  |        +------------------+
+------------------+        | [Sticky Bar] ↑   |
| Bar hidden here  |        | appears here     |
+------------------+        +------------------+
```

**Files to modify:**
- `src/components/mobile/MobileActionBar.tsx` - Add scroll detection logic
- `src/components/home/SplitHero.tsx` - Add sentinel div with ID for observer

---

## 2. Ensure CTAs are Visible Above the Fold

### Current State
The hero has CTAs ("Request Quote" / "Call Now") in the content area below the image carousel. On mobile (55vh image + content), the CTAs may be partially below the fold on shorter screens.

### Proposed Improvements

**Option A: Overlay CTAs on Hero Image (Recommended)**
Add a compact floating CTA overlay directly on the hero image, ensuring visibility regardless of scroll position.

```text
+------------------------+
|   [Image Carousel]     |
|                        |
|   +--[Quick CTAs]--+   |  <-- Semi-transparent overlay
|   | Quote | Text   |   |
|   +----------------+   |
+------------------------+
|   Content Area...      |
```

**Option B: Adjust Hero Proportions**
- Reduce image height from 55vh to 45vh on mobile
- This ensures content CTAs are always above the fold
- Trade-off: Less dramatic hero imagery

**Recommended: Hybrid Approach**
1. Keep current layout proportions
2. Add subtle "Tap for Quote" floating badge on the hero image (bottom-right corner)
3. Keep the full CTAs in the content area for detailed context

**Files to modify:**
- `src/components/home/SplitHero.tsx` - Add floating CTA overlay for mobile

---

## 3. Scrolling Marquees for Home Page

### Current Marquees
- `BrandMarquee.tsx` - Exists but NOT used on HomePage
- `ServiceMarquee.tsx` - Exists but NOT used on HomePage

### Recommended Marquee Strategy

**Marquee 1: Trust/Social Proof Marquee (After Hero)**
Position: Between SplitHero and ServiceCategoriesSection
Content: "500+ Events Catered | 5-Star Reviews | 20+ Years Experience | Charleston's Choice"
Style: Subtle, fast-moving, muted colors

**Marquee 2: Service Types Marquee (Mid-page)**
Position: After ServiceCategoriesSection
Content: "Weddings | Corporate Events | Military Functions | Graduations | Family Reunions"
Style: Use existing ServiceMarquee component

**Marquee 3: Brand Tagline Marquee (Before CTA)**
Position: Before final CTASection
Content: Soul Train's brand phrases (existing BrandMarquee)
Style: Script font, slower pace

**Implementation:**
```text
HomePage Layout:
  SplitHero
  ↓
  [NEW: TrustMarquee]      <-- Social proof
  ↓
  ServiceCategoriesSection
  ↓
  [NEW: ServiceMarquee]    <-- Service types
  ↓
  InteractiveGalleryPreview
  ↓
  AboutPreviewSection
  ↓
  TestimonialsCarousel
  ↓
  FeaturedVenueSection
  ↓
  [NEW: BrandMarquee]      <-- Brand closing
  ↓
  CTASection
```

**Files to modify:**
- `src/pages/HomePage.tsx` - Import and position marquee components
- `src/components/home/TrustMarquee.tsx` - NEW component for social proof

---

## 4. Mobile Responsiveness and UX Improvements

### Quick Wins

**A. Touch Target Sizes (WCAG 2.2 AA)**
Already addressed in previous fixes, but verify all interactive elements meet 44x44px minimum.

**B. Hero Content Spacing**
- Add proper safe-area padding for devices with home indicators
- Ensure content doesn't touch screen edges

**C. Scroll Performance**
- Add `will-change: transform` to animated elements
- Use `passive: true` on scroll listeners (already in place)

**D. Visual Hierarchy Improvements**
- Make primary CTA more prominent (larger, bolder)
- Add micro-animations on CTA hover/tap states
- Consider pulsing effect on main CTA to draw attention

### Medium-term Improvements

**E. Progressive Disclosure**
- Collapse less critical content on mobile
- Use expandable sections for detailed service info

**F. Thumb-Zone Optimization**
```text
Phone held in one hand:

    Awkward Zone (top)
    +----------------+
    |                |
    +----------------+
    Natural Zone (middle/bottom)
    +----------------+
    |  Place CTAs    |
    |     HERE       |
    +----------------+
```

Primary CTAs should be in the lower 60% of the screen where thumbs naturally reach.

---

## Technical Implementation Summary

### Files to Create
1. `src/hooks/useHeroVisible.tsx` - Custom hook for hero visibility detection
2. `src/components/home/TrustMarquee.tsx` - Social proof marquee component

### Files to Modify
1. `src/components/mobile/MobileActionBar.tsx`
   - Add scroll-aware visibility
   - Add fade-in animation

2. `src/components/home/SplitHero.tsx`
   - Add hero sentinel for intersection observer
   - Add floating CTA overlay for mobile

3. `src/pages/HomePage.tsx`
   - Import and position marquee components strategically

### No Breaking Changes
- All existing functionality preserved
- Mobile action bar still works on all pages
- Hero carousel behavior unchanged
- Touch interactions maintained

---

## Estimated Impact

| Metric | Expected Improvement |
|--------|---------------------|
| Above-fold CTA visibility | +40% (always visible) |
| Scroll obstruction | Eliminated in hero |
| Mobile engagement | +15-25% with marquees |
| Touch accessibility | WCAG 2.2 AA compliant |

---

## Implementation Order

1. **Phase 1**: MobileActionBar scroll awareness (highest impact, lowest risk)
2. **Phase 2**: Marquee integration on HomePage
3. **Phase 3**: Hero floating CTA overlay
4. **Phase 4**: Additional UX polish and micro-interactions
