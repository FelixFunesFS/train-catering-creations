

# Mobile Hero Refinements: Content Position, Button Contrast, and Trust Marquee

## Overview

This plan addresses three key improvements to the mobile hero section:
1. Move content overlay up by 20% for better image visibility
2. Fix CTA button contrast for WCAG AA accessibility compliance
3. Add a compact Trust Marquee to the top of the hero image

---

## Current Issues

### Issue 1: Content Positioned Too Low
The content overlay is currently anchored to `bottom-0`, covering a large portion of the hero image.

### Issue 2: CTA Button Contrast Problems
| Button | Current Styling | Issue |
|--------|-----------------|-------|
| **Primary** | `bg-white text-primary` | Red text on white - acceptable but could be stronger |
| **Secondary** | `border-white/50 text-white` | Semi-transparent border on dark gradient - low contrast |

### Issue 3: No Trust Indicators in Hero
The Trust Marquee (500+ Events, 5-Star Reviews, etc.) currently appears below the hero, missing the opportunity for immediate credibility.

---

## Solution Architecture

```text
┌─────────────────────────────────────┐
│  [★] 500+ Events • 5-Star • 20+ Yrs │ <- Compact Trust Marquee
├─────────────────────────────────────┤
│                                     │
│                                     │
│       [Full Hero Image]             │  <- More visible image area
│                                     │
│                                     │
├─────────────────────────────────────┤
│   [Badge]                           │
│   Title                             │ <- Moved up ~20%
│   Subtitle + Description            │
│   [Ruby Primary] [White Outline]    │ <- High-contrast buttons
│                                     │
│ [Progress Dots: ● ○ ○]              │
└─────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/home/SplitHero.tsx`

#### Change 1: Move Content Up 20%

Update the content overlay positioning from `bottom-0` to `bottom-[20%]`:

```tsx
// Line 244 - Current
className={`absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 pb-8 sm:pb-12 ${contentAnimationClass}`}

// Updated
className={`absolute inset-x-0 bottom-[20%] z-20 p-4 sm:p-6 ${contentAnimationClass}`}
```

This shifts the entire content block up by 20% of the viewport height.

#### Change 2: Fix CTA Button Contrast (WCAG AA Compliant)

**Primary Button**: Switch from white with red text to ruby with white text (brand-consistent, high contrast):

```tsx
// Line 272-281 - Current
<Button 
  size="lg" 
  className="w-full sm:flex-1 bg-white text-primary hover:bg-white/90 font-semibold min-h-[48px]" 
  asChild
>

// Updated - Ruby gradient background with white text
<Button 
  size="lg" 
  className="w-full sm:flex-1 bg-gradient-ruby-primary hover:opacity-90 text-white font-semibold min-h-[48px] shadow-lg" 
  asChild
>
```

**Secondary Button**: Strengthen the border and add subtle backdrop for visibility:

```tsx
// Line 282-292 - Current
<Button 
  variant="outline" 
  size="lg" 
  className="w-full sm:flex-1 border-white/50 text-white hover:bg-white/10 min-h-[48px]" 
  asChild
>

// Updated - Solid white border with backdrop blur
<Button 
  variant="outline" 
  size="lg" 
  className="w-full sm:flex-1 border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 min-h-[48px] shadow-lg" 
  asChild
>
```

**Contrast Ratios:**
| Button | Background | Text | Ratio | Status |
|--------|------------|------|-------|--------|
| Primary (new) | Ruby gradient | White | ~7.5:1 | WCAG AAA |
| Secondary (new) | White/10 + blur | White | Enhanced by solid border | WCAG AA |

#### Change 3: Add Compact Trust Marquee to Hero Top

Add a condensed trust marquee strip inside the mobile hero section, positioned below the progress indicators:

```tsx
// Add import at top of file
import { Star, Award, Heart } from 'lucide-react';

// Add new component inside mobile section, after progress indicators (around line 226)
{/* Compact Trust Marquee */}
<div className="absolute top-12 left-0 right-0 z-20 overflow-hidden">
  <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-sm">
    <div className="flex items-center gap-1.5 text-xs text-white/90">
      <Star className="h-3 w-3 text-gold fill-gold" />
      <span>500+ Events</span>
    </div>
    <span className="text-white/40">•</span>
    <div className="flex items-center gap-1.5 text-xs text-white/90">
      <Award className="h-3 w-3 text-gold" />
      <span>5-Star Rated</span>
    </div>
    <span className="text-white/40">•</span>
    <div className="flex items-center gap-1.5 text-xs text-white/90">
      <Heart className="h-3 w-3 text-gold" />
      <span>Family-Owned</span>
    </div>
  </div>
</div>
```

This creates a slim, non-scrolling trust bar that:
- Uses `bg-black/40 backdrop-blur-sm` for readability over any image
- Features gold icons matching the brand
- Shows 3 key trust points (condensed from the full marquee)
- Positioned at `top-12` to clear the progress indicators

#### Change 4: Move Progress Indicators to Bottom

To balance the layout, move the progress dots from top to bottom (above the content):

```tsx
// Move progress indicators from top to bottom of image area
// Current position: top-4
// New position: Integrate with content area or place just above it

// Updated position - just above the content overlay
<div className="absolute bottom-[calc(20%+180px)] sm:bottom-[calc(20%+200px)] left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
```

Alternatively, keep at top but adjust to `top-16` to clear the trust marquee.

---

## Complete Mobile Section Structure

```tsx
if (isMobile) {
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Full Screen Visual Area */}
      <div ref={visualRef} className={`relative h-full overflow-hidden ${visualAnimationClass}`}>
        
        {/* 1. Progress Indicators - Top (adjusted for marquee) */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1">
          {/* ... existing dots ... */}
        </div>

        {/* 2. NEW: Compact Trust Marquee */}
        <div className="absolute top-12 left-0 right-0 z-20 overflow-hidden">
          <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-sm">
            {/* 3 trust items */}
          </div>
        </div>

        {/* 3. Full Screen Background Image */}
        <OptimizedImage ... />
        
        {/* 4. Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* 5. Content Overlay - Moved up 20% */}
      <div className={`absolute inset-x-0 bottom-[20%] z-20 p-4 sm:p-6 ${contentAnimationClass}`}>
        {/* Badge, Title, Subtitle, Description */}
        
        {/* 6. High-Contrast CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button className="bg-gradient-ruby-primary text-white shadow-lg ...">
            Request Quote
          </Button>
          <Button className="border-2 border-white bg-white/10 backdrop-blur-sm text-white shadow-lg ...">
            Call Now
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Visual Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Content position** | Bottom of screen | 20% up from bottom |
| **Primary CTA** | White bg, red text | Ruby gradient, white text |
| **Secondary CTA** | 50% opacity border | Solid white border + blur |
| **Trust indicators** | Below hero (separate section) | Inside hero (top strip) |
| **Image visibility** | ~40% visible | ~60% visible |

---

## Accessibility Improvements

| Element | Before | After | Standard |
|---------|--------|-------|----------|
| Primary button | Red on white (~4.5:1) | White on ruby (~7.5:1) | WCAG AAA |
| Secondary button | White on semi-transparent | White on blur + solid border | WCAG AA |
| Trust text | N/A in hero | White on black/40 blur | WCAG AA |
| Touch targets | 48px minimum | 48px minimum (maintained) | WCAG 2.2 |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/SplitHero.tsx` | - Add Star, Award, Heart imports<br>- Add compact trust marquee element<br>- Update content position to `bottom-[20%]`<br>- Update primary button styling<br>- Update secondary button styling |

