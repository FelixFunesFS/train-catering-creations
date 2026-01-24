

# Shorten Mobile Hero & Move Trust Marquee to About Page

## Overview

This plan addresses two changes:
1. **Shorten Mobile Hero**: Reduce the mobile hero height from `h-screen` (100vh) to `h-[85vh]` so all content and CTAs fit within the mobile viewport without scrolling
2. **Move TrustMarquee**: Relocate the scrolling marquee from the Home page (after hero) to the About page (after the nav bar, before the main content)

---

## Current State Analysis

### Mobile Hero Issues
| Issue | Current | Impact |
|-------|---------|--------|
| Hero height | `h-screen` (100vh) | CTAs may be cut off or require scrolling on smaller devices |
| Content position | `bottom-[20%]` | Content may overflow viewport on shorter screens |
| Safe area | No bottom safe-area consideration | May clip on devices with home indicators |

### TrustMarquee Location
| Current (HomePage.tsx) | Target (About.tsx) |
|------------------------|-------------------|
| Line 15: `<TrustMarquee />` after `<SplitHero />` | Insert after nav bar, before first `<PageSection>` |

---

## Solution Architecture

### Shortened Mobile Hero Layout
```text
┌─────────────────────────────────────┐
│ [Progress Dots]                     │
│ [Compact Trust Bar]                 │  <- top-12
│                                     │
│       [Hero Image]                  │  85vh total
│                                     │
│   [Badge]                           │
│   Title                             │  <- bottom-[15%]
│   Subtitle                          │
│   [Request Quote] [Call Now]        │
└─────────────────────────────────────┘
  ↑ All visible without scrolling
```

### About Page with Marquee
```text
┌─────────────────────────────────────┐
│ [Navigation Bar]                    │
├─────────────────────────────────────┤
│ ← 500+ Events • 5-Star • 20+ Yrs →  │  <- TrustMarquee (scrolling)
├─────────────────────────────────────┤
│ [PageHeader - Our Story]            │
│ ...rest of About page...            │
└─────────────────────────────────────┘
```

---

## Technical Changes

### File 1: `src/components/home/SplitHero.tsx`

**Change 1: Reduce Hero Height (line 193)**

```tsx
// Current
<section className="relative h-screen overflow-hidden bg-black" ...>

// Updated - 85vh ensures viewport fit
<section className="relative h-[85vh] overflow-hidden bg-black" ...>
```

**Change 2: Adjust Content Position (line 231)**

Move content up slightly to ensure CTAs are fully visible:

```tsx
// Current
className={`absolute inset-x-0 bottom-[20%] z-20 p-4 sm:p-6 ${contentAnimationClass}`}

// Updated - 15% from bottom for better viewport fit
className={`absolute inset-x-0 bottom-[15%] z-20 p-4 sm:p-6 ${contentAnimationClass}`}
```

**Change 3: Reduce Description Line Clamp (line 246)**

Tighten description to ensure buttons aren't pushed out of view:

```tsx
// Current
<p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-3">

// Updated - 2 lines on mobile for tighter layout
<p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2 sm:line-clamp-3">
```

**Change 4: Reduce Spacing in Content Area (line 232)**

Tighten the spacing between elements:

```tsx
// Current
<div className="max-w-md mx-auto w-full space-y-3 sm:space-y-4">

// Updated
<div className="max-w-md mx-auto w-full space-y-2 sm:space-y-3">
```

**Change 5: Reduce Button Gap (line 252)**

```tsx
// Current
<div className="flex flex-col sm:flex-row gap-3 pt-2">

// Updated - tighter button stack
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
```

---

### File 2: `src/pages/HomePage.tsx`

**Remove TrustMarquee Import and Usage**

```tsx
// Remove from imports (line 8)
import { TrustMarquee } from "@/components/home/TrustMarquee";

// Remove from JSX (line 15)
<TrustMarquee />
```

Updated HomePage:
```tsx
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <SplitHero />
      <ServiceCategoriesSection />
      <InteractiveGalleryPreview />
      <AboutPreviewSection />
      <TestimonialsCarousel />
      <FeaturedVenueSection />
      <BrandMarquee />
      <CTASection />
    </div>
  );
};
```

---

### File 3: `src/pages/About.tsx`

**Add TrustMarquee Import and Usage**

```tsx
// Add import at top
import { TrustMarquee } from "@/components/home/TrustMarquee";

// Insert TrustMarquee after main opening tag, before first PageSection (line 13)
<main id="main-content">
  {/* Trust Marquee - First element after nav */}
  <TrustMarquee />
  
  {/* Header Section - Pattern A */}
  <PageSection pattern="a" skipToContentId="about-header">
    ...
```

---

## Visual Comparison

### Mobile Hero
| Aspect | Before | After |
|--------|--------|-------|
| **Height** | 100vh (full screen) | 85vh (fits viewport) |
| **Content position** | 20% from bottom | 15% from bottom |
| **Description** | 3 lines | 2 lines on mobile |
| **Button gap** | 12px | 8px on mobile |
| **Scrolling needed** | Possibly | No |

### TrustMarquee Location
| Before | After |
|--------|-------|
| Home page (after hero) | About page (after nav, before content) |

---

## Responsive Considerations

- **85vh height**: Ensures hero fits on most mobile viewports (including iPhone SE, Android devices with nav bars)
- **Safe area**: The reduced height naturally accommodates device safe areas
- **Touch targets**: 48px button heights maintained for accessibility
- **Breakpoint behavior**: Changes apply primarily to mobile; desktop hero remains unchanged

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/SplitHero.tsx` | Reduce height to 85vh, adjust content position, tighten spacing |
| `src/pages/HomePage.tsx` | Remove TrustMarquee import and component |
| `src/pages/About.tsx` | Add TrustMarquee import and place after nav bar |

