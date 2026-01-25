

# Complete CTA Accessibility Fix - All Dark Background Sections

## Problem Summary
All CTA sections with dark ruby gradient backgrounds currently use `variant="cta"` (ruby gradient) for the primary button. This creates a ruby-on-ruby low contrast situation that fails accessibility standards.

The `cta` variant: `bg-gradient-ruby-primary text-white` on a `bg-gradient-to-r from-primary to-primary-dark` background = poor visibility.

---

## Solution
Swap button variants on ALL dark ruby background CTA sections:
- **Primary action**: Use `cta-white` (white bg, navy text) for maximum contrast
- **Secondary action**: Use `cta` (ruby gradient) which still visible but clearly secondary

---

## Files to Fix

### 1. src/components/home/CTASection.tsx
```tsx
// From:
buttons={[
  { text: "Text (843) 970-0265", href: "sms:8439700265", variant: "cta", icon: ... },
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta-white" }
]}

// To:
buttons={[
  { text: "Text (843) 970-0265", href: "sms:8439700265", variant: "cta-white", icon: ... },
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
]}
```

### 2. src/components/gallery/GalleryCTA.tsx
```tsx
// From:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" },
  { text: "Call Us Today", href: "tel:8439700265", variant: "cta-white" }
]}

// To:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta-white" },
  { text: "Call Us Today", href: "tel:8439700265", variant: "cta" }
]}
```

### 3. src/pages/Reviews.tsx (Lines 180-190)
```tsx
// From:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" },
  { text: "Call (843) 970-0265", href: "tel:8439700265", variant: "cta-white" }
]}

// To:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta-white" },
  { text: "Call (843) 970-0265", href: "tel:8439700265", variant: "cta" }
]}
```

### 4. src/pages/RequestQuote.tsx (Lines 64-74)
```tsx
// From:
buttons={[
  { text: "Call (843) 970-0265", href: "tel:8439700265", variant: "cta" },
  { text: "Email Us", href: "mailto:soultrainseatery@gmail.com", variant: "cta-white" }
]}

// To:
buttons={[
  { text: "Call (843) 970-0265", href: "tel:8439700265", variant: "cta-white" },
  { text: "Email Us", href: "mailto:soultrainseatery@gmail.com", variant: "cta" }
]}
```

### 5. src/pages/About.tsx (Lines 302-304)
```tsx
// From:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" },
  { text: "View Our Menu", href: "/menu", variant: "cta-white" }
]}

// To:
buttons={[
  { text: "Request Quote", href: "/request-quote#page-header", variant: "cta-white" },
  { text: "View Our Menu", href: "/menu", variant: "cta" }
]}
```

### 6. src/components/menu/MenuCTASection.tsx (Lines 31-40)
This file uses buttons directly (not the base CTASection), also on a dark ruby gradient background.

```tsx
// From:
<Button asChild variant="cta" size="responsive-lg">
  <Link to="/request-quote#page-header">Request a Free Quote</Link>
</Button>
<Button asChild variant="cta-white" size="responsive-lg">
  <a href="tel:8439700265">Call (843) 970-0265</a>
</Button>

// To:
<Button asChild variant="cta-white" size="responsive-lg">
  <Link to="/request-quote#page-header" className="text-inherit">Request a Free Quote</Link>
</Button>
<Button asChild variant="cta" size="responsive-lg">
  <a href="tel:8439700265" className="text-inherit">Call (843) 970-0265</a>
</Button>
```

---

## Visual Result

### Before (Low Contrast)
| Background | Primary Button | Result |
|------------|----------------|--------|
| Dark Ruby Gradient | Ruby Gradient (`cta`) | Ruby on Ruby - hard to see |

### After (High Contrast)
| Background | Primary Button | Result |
|------------|----------------|--------|
| Dark Ruby Gradient | White (`cta-white`) | White on Ruby - highly visible |

---

## Additional SplitHero Fixes (From Previous Plan)

### src/components/home/SplitHero.tsx

**Line 262 - Mobile Primary Button:**
```tsx
// From:
<Button size="lg" className="w-full sm:flex-1 bg-gradient-ruby-primary hover:opacity-90 text-white font-semibold min-h-[48px] shadow-lg" asChild>

// To:
<Button variant="cta" size="lg" className="w-full sm:flex-1 min-h-[48px] shadow-lg" asChild>
```

**Line 338 - Desktop Primary Button:**
```tsx
// From:
<Button size="lg" className="flex-1 bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold min-h-[48px]" asChild>

// To:
<Button variant="cta" size="lg" className="flex-1 min-h-[48px]" asChild>
```

---

## Complete File Change Summary

| File | Changes |
|------|---------|
| `src/components/home/CTASection.tsx` | Swap button variants |
| `src/components/gallery/GalleryCTA.tsx` | Swap button variants |
| `src/pages/Reviews.tsx` | Swap button variants |
| `src/pages/RequestQuote.tsx` | Swap button variants |
| `src/pages/About.tsx` | Swap button variants |
| `src/components/menu/MenuCTASection.tsx` | Swap button variants + add `text-inherit` |
| `src/components/home/SplitHero.tsx` | Standardize to use `variant="cta"` |

---

## Accessibility Compliance

- High contrast white buttons on dark backgrounds (WCAG AA compliant)
- Touch targets maintained at 48px minimum via `size="responsive-lg"`
- `text-inherit` ensures link text colors respect button styling
- Clear visual hierarchy: white primary stands out, ruby secondary is visible but subdued

