

# Service Cards Collapsible Fix & CTA Button Standardization (Updated)

## Overview
This plan addresses three issues:
1. Remove collapsible behavior from tablet views for service cards (keep mobile-only)
2. Fix hero section CTA buttons (white-on-white issue + wrong phone number)
3. Standardize all CTA buttons across mobile and tablet for consistency, accessibility, and responsiveness

---

## Issue 1: Remove Collapsible from Tablet Views

### Current Problem
The `useIsMobile()` hook returns `true` for screens under 1024px, which includes both mobile AND tablet devices. This causes the collapsible behavior to appear on tablets when it should only be on mobile phones.

### Solution
Create a separate mobile-only check (under 768px) specifically for the collapsible behavior.

### Implementation
**File: `src/components/home/ServiceCategoriesSection.tsx`**

Add a new media query hook for true mobile detection:
```tsx
// Add new hook for mobile-only collapsible (under 768px)
const isMobileOnly = useMediaQuery("(max-width: 767px)");
```

Update the conditional rendering to use `isMobileOnly` instead of `isMobile`:
```tsx
// Change from
{isMobile ? (

// To:
{isMobileOnly ? (
```

### Behavior After Fix
| Viewport | Collapsible | Card Layout |
|----------|-------------|-------------|
| Mobile (<768px) | Yes | Vertical, full width |
| Tablet (768-1023px) | No | Card 1&2 vertical, Card 3 horizontal split |
| Desktop (1024px+) | No | 3-column grid |

---

## Issue 2: Hero Section CTA Buttons (Critical Fix)

### Problems Identified

**Mobile Hero (lines 262-273):**
- Secondary button: Uses `border-2 border-white text-white bg-white/10` but inner `<a>` tag lacks `text-inherit`, causing potential white-on-white text issue when link styles override

**Desktop Hero (lines 337-350):**
- Primary button: Inner `<a>` lacks `text-inherit`
- Secondary button: Inner `<a>` lacks `text-inherit`
- Wrong phone number: `tel:+1234567890` instead of `tel:8439700265`

### Solution
1. Add `text-inherit` to all inner anchor tags to prevent link style overrides
2. Fix the phone number on desktop
3. Use existing `glass-white` variant for mobile secondary button for consistency

### Changes Required

**File: `src/components/home/SplitHero.tsx`**

**Mobile Hero Primary Button (line 263):**
```tsx
// From:
<Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">

// To:
<Link to="/request-quote#page-header" className="flex items-center justify-center gap-2 text-inherit">
```

**Mobile Hero Secondary Button (lines 268-272):**
```tsx
// From:
<Button variant="outline" size="lg" className="w-full sm:flex-1 border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 min-h-[48px] shadow-lg" asChild>
  <a href="tel:8439700265" className="flex items-center justify-center gap-2">

// To:
<Button variant="glass-white" size="lg" className="w-full sm:flex-1 min-h-[48px] shadow-lg" asChild>
  <a href="tel:8439700265" className="flex items-center justify-center gap-2 text-inherit">
```

**Desktop Hero Primary Button (lines 338-342):**
```tsx
// From:
<a href="/request-quote#page-header" className="flex items-center justify-center space-x-2">

// To:
<a href="/request-quote#page-header" className="flex items-center justify-center space-x-2 text-inherit">
```

**Desktop Hero Secondary Button (lines 344-348):**
```tsx
// From:
<Button variant="outline" size="lg" className="flex-1 border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[48px]" asChild>
  <a href="tel:+1234567890" className="flex items-center justify-center space-x-2">

// To:
<Button variant="cta-outline" size="lg" className="flex-1 min-h-[48px]" asChild>
  <a href="tel:8439700265" className="flex items-center justify-center space-x-2 text-inherit">
```

---

## Issue 3: Other Section CTA Button Standardization

### Current Inconsistencies Found

| Component | Current Pattern | Issue |
|-----------|-----------------|-------|
| ServiceCategoriesSection | `size="lg"` + manual `min-h-[44px]` | Non-standard sizing |
| AboutPreviewSection | `size="lg"` + manual `min-h-[44px]` | Non-standard sizing |
| FeaturedVenueSection | `size="lg"` + manual `min-h-[44px]`, always stacked | Non-standard, poor tablet layout |

### Standard Pattern to Apply
- Primary actions: `variant="cta"` (ruby gradient)
- Secondary actions: `variant="cta-outline"` (ruby border with outline style)
- Size: `responsive-compact` (min-h-[44px]) or `responsive-lg` (min-h-[48px])
- All inner `<a>` tags: Add `text-inherit` class

### Changes Required

**1. ServiceCategoriesSection.tsx (Lines 181-191, 211-222)**
```tsx
// From:
<Button variant="outline" size="lg" className="w-full border-ruby text-ruby hover:bg-ruby hover:text-white group min-h-[44px]" asChild>

// To:
<Button variant="cta-outline" size="responsive-compact" asChild>
  <Link ... className="flex items-center justify-center gap-2 text-inherit">
```

**2. AboutPreviewSection.tsx (Lines 135-152)**

Primary button:
```tsx
// From:
<Button size="lg" className="w-full sm:w-auto sm:flex-1 bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold group min-h-[44px]" asChild>

// To:
<Button variant="cta" size="responsive-compact" className="sm:flex-1" asChild>
  <Link ... className="... text-inherit">
```

Secondary button:
```tsx
// From:
<Button variant="outline" size="lg" className="w-full sm:w-auto sm:flex-1 border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[44px]" asChild>

// To:
<Button variant="cta-outline" size="responsive-compact" className="sm:flex-1" asChild>
  <Link ... className="... text-inherit">
```

**3. FeaturedVenueSection.tsx (Lines 123-139)**
```tsx
// From:
<div className="flex flex-col space-y-3">
  <Button size="lg" className="w-full bg-gradient-ruby-primary... min-h-[44px]" asChild>
  <Button variant="outline" size="lg" className="w-full border-ruby... min-h-[44px]" asChild>
</div>

// To:
<div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
  <Button variant="cta" size="responsive-compact" className="sm:flex-1" asChild>
    <Link ... className="... text-inherit">
  <Button variant="cta-outline" size="responsive-compact" className="sm:flex-1" asChild>
    <a ... className="... text-inherit">
</div>
```

---

## Summary of Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/SplitHero.tsx` | Add `text-inherit` to all anchor tags, use `glass-white` variant for mobile secondary, fix phone number, use `cta-outline` variant for desktop secondary |
| `src/components/home/ServiceCategoriesSection.tsx` | Add `useMediaQuery` import, create `isMobileOnly` variable, update collapsible condition, standardize CTA buttons with `text-inherit` |
| `src/components/home/AboutPreviewSection.tsx` | Update buttons to use standardized variants with `text-inherit` |
| `src/components/home/FeaturedVenueSection.tsx` | Update buttons to side-by-side on tablet, use standardized variants with `text-inherit` |

### Accessibility Compliance
- All buttons maintain WCAG 2.2 AA touch target minimum (44px via `responsive-compact`, 48px via `responsive-lg`)
- `text-inherit` prevents link styles from overriding button text colors
- `glass-white` variant has built-in `[&_svg]:text-white` to ensure icon visibility
- Keyboard navigation and focus states preserved from button component

### Visual Consistency After Changes
- Hero mobile secondary: Uses `glass-white` variant (dark glass effect with white text/border)
- All CTA button pairs below hero: side-by-side on tablet+, stacked on mobile
- Primary actions: `variant="cta"` (ruby gradient)
- Secondary actions: `variant="cta-outline"` (ruby border) or `variant="glass-white"` (for dark overlays)

