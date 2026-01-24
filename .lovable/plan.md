

# Global Alternating Backgrounds & Full Mobile Audit Plan

## Executive Summary

This plan establishes a **site-wide design system** for consistent visual rhythm through standardized section backgrounds, using the existing `PageSection` component and `section-pattern-a/b/c/d` classes. The goal is to create a cohesive experience across ALL pages, not just the home page, while addressing remaining mobile responsiveness issues.

---

## Part 1: Global Design System

### Current Architecture

The site already has a robust foundation:

**Existing CSS Pattern Classes** (in `src/index.css` lines 474-491):
```text
section-pattern-a: Ruby-tinted subtle gradient
section-pattern-b: Platinum/secondary gradient  
section-pattern-c: Gold-accent gradient
section-pattern-d: Navy-platinum gradient
```

**PageSection Component** (in `src/components/ui/page-section.tsx`):
- Accepts `pattern="a|b|c|d"` prop
- Applies responsive padding `py-6 sm:py-8 lg:py-12`
- Optional `withBorder` for section separation

### Pages Audit - Current State

| Page | Uses PageSection? | Current Pattern Flow | Status |
|------|------------------|---------------------|--------|
| About.tsx | Yes | A - B - C - B - A | Correct |
| AlternativeGallery.tsx | Yes | Hero - B - A - C - CTA | Correct |
| FAQ.tsx | Yes | A - B - C - D | Correct |
| Reviews.tsx | No | Plain sections | Needs Update |
| RequestQuote.tsx | No | Plain sections | Needs Update |
| Menu.tsx | Partial | Only contact uses PageSection | Needs Update |
| WeddingMenu.tsx | No | Inline styling | Needs Update |
| HomePage.tsx | No | Components use inline bg classes | Needs Update |

### Proposed Global Pattern Standard

Establish a consistent **A-B alternating rhythm** with C/D for accent sections:

```text
Pattern A: Header/CTA sections (Ruby-tinted - warm, inviting)
Pattern B: Content sections (Platinum/neutral - readable)
Pattern C: Featured content (Gold accent - highlighting)
Pattern D: Contact/Footer CTAs (Navy/ruby - action-oriented)
```

**Standard Flow for Multi-Section Pages:**
```
Header Section     → Pattern A (or no pattern if hero)
Primary Content    → Pattern B
Secondary Content  → Pattern C
Tertiary Content   → Pattern B (alternating back)
CTA/Contact        → Pattern D or A
```

---

## Part 2: Implementation by Page

### 2.1 Home Page Components

The home page uses individual components that apply their own backgrounds. Update for consistency:

| Component | Current Background | Proposed Background |
|-----------|-------------------|---------------------|
| SplitHero | `bg-background` | Keep (full-bleed hero) |
| TrustMarquee | `bg-secondary/30` | `bg-secondary/50` (stronger band) |
| ServiceCategoriesSection | `bg-gradient-pattern-c` | Keep (gold accent) |
| InteractiveGalleryPreview | `bg-gradient-pattern-b` | `bg-background` (white for contrast) |
| AboutPreviewSection | `bg-gradient-pattern-d` | Keep (navy accent) |
| TestimonialsCarousel | `bg-gradient-pattern-a` | `bg-background` (white for readability) |
| FeaturedVenueSection | `bg-gradient-pattern-a` | Keep (ruby accent, now single use) |
| BrandMarquee | none | `bg-secondary/30` (matching TrustMarquee) |
| CTASection | `bg-gradient-primary` | Keep (ruby CTA) |

**Visual Flow After Changes:**
```text
+---------------------------+
|       SplitHero           |  bg-background (white)
+---------------------------+
|     TrustMarquee          |  bg-secondary/50 (light gray band)
+---------------------------+
| ServiceCategoriesSection  |  bg-gradient-pattern-c (gold)
+---------------------------+
| InteractiveGalleryPreview |  bg-background (white)
+---------------------------+
|   AboutPreviewSection     |  bg-gradient-pattern-d (navy)
+---------------------------+
|  TestimonialsCarousel     |  bg-background (white)
+---------------------------+
|  FeaturedVenueSection     |  bg-gradient-pattern-a (ruby)
+---------------------------+
|     BrandMarquee          |  bg-secondary/30 (light gray band)
+---------------------------+
|       CTASection          |  bg-gradient-primary (ruby)
+---------------------------+
```

### 2.2 Reviews.tsx

Currently uses plain `<section>` tags. Update to use PageSection:

```text
FROM: <section className="py-8 lg:py-12">
TO:   <PageSection pattern="a|b|c">
```

**Pattern Assignment:**
- Header section: Pattern A
- Reviews grid: Pattern B  
- Feedback section: Pattern C
- CTA: Keep existing CTASection component

### 2.3 RequestQuote.tsx

Currently uses plain `<section>` tags. Minimal changes needed since it's intentionally clean:

**Keep current structure** but ensure:
- Responsive padding is applied via existing classes
- No pattern needed (clean form-focused layout)

### 2.4 Menu.tsx

Currently uses inline section styling. Update contact section:

**Current (line 154):**
```tsx
<PageSection withBorder>
```

**Proposed:**
```tsx
<PageSection pattern="a" withBorder>
```

### 2.5 WeddingMenu.tsx

Currently uses inline styling (`bg-muted/10`). This page has a unique elegant aesthetic:

**Keep current structure** - the wedding menu intentionally differs with its "paper texture" background for an elegant, formal feel that matches wedding events.

---

## Part 3: CSS Enhancements

### 3.1 Subtle Section Divider Utility

Add a reusable decorative divider class for elegant section transitions:

**File:** `src/index.css` (add around line 510)

```css
/* Subtle centered section divider */
.section-divider-subtle {
  position: relative;
  padding-top: 1rem;
}

.section-divider-subtle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, hsla(var(--primary), 0.25), transparent);
  border-radius: 1px;
}
```

This can be optionally added to any section that needs extra visual separation.

---

## Part 4: Full Mobile Audit

### Issues Identified & Fixes

#### Issue 1: InteractiveGalleryPreview Mobile Story Height
**Location:** `src/components/home/InteractiveGalleryPreview.tsx` (line 184)

**Current:** `h-[70vh]` may be too tall on short mobile screens
**Fix:** Change to `h-[65vh] min-h-[400px] max-h-[600px]`

#### Issue 2: QuoteFormSelector Card Padding
**Location:** `src/components/quote/QuoteFormSelector.tsx` (lines 28, 70)

**Current:** Fixed `p-8` padding
**Fix:** Responsive padding `p-5 sm:p-6 lg:p-8`

#### Issue 3: CTA Section Button Width
**Location:** `src/components/ui/cta-section.tsx` (lines 62, 101)

**Current:** `w-3/5` may be too narrow on some mobiles
**Fix:** Change to `w-4/5 sm:w-auto`

#### Issue 4: TrustMarquee Contrast
**Location:** `src/components/home/TrustMarquee.tsx` (line 43)

**Current:** `bg-secondary/30` is subtle
**Fix:** Increase to `bg-secondary/50`

### Items Verified as Working

The following were audited and confirmed responsive:

- Header/Navigation: Mobile menu functions correctly
- Footer: 4-col desktop, 2-col tablet, 1-col mobile grid works
- SplitHero: Proper mobile/desktop layouts with swipe
- MobileActionBar: Now uses responsive-compact buttons (previously fixed)
- DiscoveryCategoryNav: Vertical stacking on mobile (previously fixed)
- ServiceCategoriesSection: 3-col to 1-col grid stacking works
- TestimonialsCarousel: Swipe navigation works
- All touch targets meet 44px WCAG minimum

---

## Part 5: Files to Modify

| File | Change Type | Priority |
|------|-------------|----------|
| `src/index.css` | Add section-divider-subtle class | Medium |
| `src/components/home/InteractiveGalleryPreview.tsx` | Background + mobile height | High |
| `src/components/home/TestimonialsCarousel.tsx` | Background change | High |
| `src/components/home/TrustMarquee.tsx` | Increase opacity | High |
| `src/components/home/BrandMarquee.tsx` | Add background | High |
| `src/pages/Reviews.tsx` | Add PageSection wrappers | Medium |
| `src/pages/Menu.tsx` | Add pattern to contact PageSection | Low |
| `src/components/quote/QuoteFormSelector.tsx` | Responsive padding | High |
| `src/components/ui/cta-section.tsx` | Button width adjustment | High |

---

## Part 6: Technical Implementation Details

### Change 1: index.css - Section Divider

Add after line 491:
```css
/* Subtle centered section divider */
.section-divider-subtle {
  position: relative;
  padding-top: 1rem;
}

.section-divider-subtle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, hsla(var(--primary), 0.25), transparent);
  border-radius: 1px;
}
```

### Change 2: InteractiveGalleryPreview.tsx

Line 138: `bg-gradient-pattern-b` → `bg-background`
Line 184: `h-[70vh]` → `h-[65vh] min-h-[400px] max-h-[600px]`

### Change 3: TestimonialsCarousel.tsx

Line 135: `bg-gradient-pattern-a` → `bg-background`

### Change 4: TrustMarquee.tsx

Line 43: `bg-secondary/30` → `bg-secondary/50`

### Change 5: BrandMarquee.tsx

Line 63 (inner div): Add `bg-secondary/30`

### Change 6: QuoteFormSelector.tsx

Lines 28, 70: `p-8` → `p-5 sm:p-6 lg:p-8`

### Change 7: cta-section.tsx

Lines 62, 101: `w-3/5` → `w-4/5 sm:w-auto`

### Change 8: Reviews.tsx

Wrap sections with PageSection component:
- Header section: `<PageSection pattern="a">`
- Reviews grid section: `<PageSection pattern="b">`
- Feedback section: `<PageSection pattern="c">`

### Change 9: Menu.tsx

Line 154: `<PageSection withBorder>` → `<PageSection pattern="a" withBorder>`

---

## Part 7: Testing Checklist

### Visual Rhythm Verification
1. Navigate through all pages and verify alternating backgrounds create clear separation
2. Ensure no two adjacent sections use the same gradient pattern (except intentional white sections)
3. Verify marquee bands (Trust/Brand) are visually distinct

### Mobile Testing (Viewports)
- iPhone SE: 320px width (smallest common)
- iPhone 14: 390px width (standard)
- Galaxy S21: 360px width (Android)
- iPad Mini: 768px portrait

### Functionality Checks
- Hero carousel swipe works
- Testimonial swipe works  
- Gallery story view works
- All CTAs are tappable
- No horizontal overflow on any page
- Touch targets meet 44px minimum

---

## Summary

This plan creates a cohesive global design system by:

1. **Standardizing backgrounds** using the existing PageSection pattern system across all pages
2. **Creating visual rhythm** through A-B alternating patterns with C/D accents
3. **Adding subtle enhancements** like the section-divider-subtle utility
4. **Fixing mobile issues** including story height, padding, and button widths
5. **Maintaining intentional exceptions** (WeddingMenu's elegant paper texture)

The changes are non-breaking and focus on visual consistency while preserving all existing functionality.

