

# Comprehensive Logo Placement Strategy - All Main Pages

## Overview

The original plan only addressed the **home page hero (SplitHero)**. This expanded plan covers logo placement across **all main public-facing pages** to create consistent brand presence throughout the site.

---

## Current Logo Inventory

| Location | Current Status | Size |
|----------|---------------|------|
| **Header** (global) | ✅ Logo present | h-6/w-6 → h-8/w-8 (lg) |
| **Footer** (global) | ✅ Logo present | w-10/h-10 |
| **SplitHero** (Home) | ❌ Heart icon only | N/A |
| **StoryHero** (alternate) | ✅ Logo present | h-16/w-16 |
| **About** page | ❌ No logo | N/A |
| **Menu** page | ❌ No logo | N/A |
| **Reviews** page | ❌ No logo | N/A |
| **Gallery** page | ❌ No logo | N/A |
| **FAQ** page | ❌ No logo | N/A |
| **Request Quote** page | ❌ No logo | N/A |

---

## Proposed Changes by Page

### 1. HOME PAGE - SplitHero.tsx (Primary Focus)

**Current:** Heart icon + "Soul Train's" text badge
**Proposed:** Replace with actual logo + text

**Mobile (lines 210-216):**
```tsx
<div className="absolute top-4 left-4 z-20">
  <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
    <img 
      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
      alt="Soul Train's Eatery Logo" 
      className="h-8 w-8 object-contain"
    />
    <span className="text-white font-script text-lg">Soul Train's</span>
  </div>
</div>
```

**Desktop (lines 283-289):**
```tsx
<div className="absolute bottom-6 left-6 z-20">
  <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl">
    <img 
      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
      alt="Soul Train's Eatery Logo" 
      className="h-12 w-12 object-contain"
    />
    <span className="text-white font-script text-2xl">Soul Train's Eatery</span>
  </div>
</div>
```

**Desktop Content Watermark (line ~293):**
```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-72 h-72 object-contain opacity-[0.04]"
  />
</div>
```

---

### 2. ABOUT PAGE - About.tsx

**Location:** "Our Story" section background (lines 31-74)
**Proposed:** Add subtle watermark logo in the background behind content

```tsx
{/* Add inside the relative section, after the dark gradient overlay */}
<div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden opacity-[0.06]">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-64 h-64 object-contain"
  />
</div>
```

---

### 3. MENU PAGE - SimplifiedMenu.tsx

**Location:** SimpleMenuHeader component (would need to check component)
**Proposed:** Add small logo accent next to the menu style toggle or as a decorative element

**Alternative:** Add watermark behind category sections

---

### 4. GALLERY PAGE - AlternativeGallery.tsx

**Location:** "Family Story" section (lines 86-110)
**Proposed:** Add logo next to the Camera icon badge for brand consistency

```tsx
{/* Update the badge area */}
<div className="flex items-center justify-center space-x-2 mb-3">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    className="h-6 w-6 object-contain"
  />
  <Camera className="h-5 w-5 text-ruby" />
  <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
    Our Gallery
  </Badge>
</div>
```

---

### 5. REVIEWS PAGE - Reviews.tsx

**Location:** Header section (lines 77-100)
**Proposed:** Consider adding logo as part of the rating display or as a watermark behind testimonial cards

---

### 6. FAQ PAGE - FAQ.tsx

**Location:** Header section (lines 50-66)
**Proposed:** Subtle watermark in the "Contact CTA" section at the bottom

---

### 7. REQUEST QUOTE PAGE - RequestQuote.tsx

**Location:** CTASection component at bottom (lines 51-69)
**Proposed:** Add watermark logo behind the CTA card for brand reinforcement at decision point

---

## Priority Implementation Order

| Priority | Page | Change Type | Impact |
|----------|------|-------------|--------|
| 1 | Home (SplitHero) | Replace icon with logo + add watermark | High - first impression |
| 2 | About | Background watermark | Medium - storytelling |
| 3 | Gallery | Badge enhancement | Medium - visual storytelling |
| 4 | Request Quote | CTA watermark | Medium - conversion point |
| 5 | Menu | Decorative accent | Low - functional page |
| 6 | Reviews | Subtle watermark | Low - testimonial focus |
| 7 | FAQ | Subtle watermark | Low - functional page |

---

## Design Guidelines

**Watermark Specifications:**
- Opacity: 3-6% (`opacity-[0.03]` to `opacity-[0.06]`)
- Size: w-48 to w-72 depending on context
- Position: Offset from center to avoid competing with content
- Always use `aria-hidden="true"` and `pointer-events-none`

**Active Logo Specifications:**
- Always include proper `alt` text
- Use glassmorphic containers on image backgrounds
- Maintain consistent sizing within context (hero vs. accent)

---

## Summary

| Page | Current | Proposed |
|------|---------|----------|
| **Home Hero** | Heart icon | Logo + text badge, content watermark |
| **About** | None | Background watermark in story section |
| **Menu** | None | Optional decorative accent |
| **Gallery** | None | Logo in "Family Story" badge area |
| **Reviews** | None | Optional subtle watermark |
| **FAQ** | None | Optional contact section watermark |
| **Quote** | None | CTA section watermark |
| **Header** | ✅ Present | No change |
| **Footer** | ✅ Present | No change |

This comprehensive approach ensures the Soul Train's Eatery brand is consistently reinforced across all visitor touchpoints while maintaining visual elegance and avoiding over-saturation.

