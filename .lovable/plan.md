
# Refactor CTASection Component for Self-Contained Spacing

## Overview

Simplify and standardize the `CTASection` component to handle its own consistent spacing and card treatment, eliminating the need for any wrapper and ensuring visual consistency across all pages.

---

## Current Issues Identified

### 1. Inconsistent Structure Between Mobile/Desktop

```text
CURRENT IMPLEMENTATION:
┌─────────────────────────────────────────────┐
│  Desktop: hidden lg:block                    │
│  ├─ section py-16 sm:py-20 lg:py-24         │ ← Outer padding
│  │  └─ card mx-4 xl:mx-8 rounded-2xl        │ ← Card margins
│  │     └─ content py-12 xl:py-16            │ ← Inner padding
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Mobile: block lg:hidden                     │
│  ├─ section py-16... mx-4 sm:mx-6 rounded-lg│ ← Combined
└─────────────────────────────────────────────┘
```

**Problems:**
- Different horizontal margins: `mx-4 xl:mx-8` vs `mx-4 sm:mx-6 lg:mx-8`
- Different border radius: `rounded-2xl` vs `rounded-lg`
- Complex nested structure on desktop
- Duplicate animation refs (both sections reference same refs)

### 2. Spacing Tokens Not Aligned with Design System

The current outer section uses `py-16 sm:py-20 lg:py-24` but the approved spacing system defines:
- CTA Sections: `py-12 sm:py-16 lg:py-20` (internal content padding)

---

## Proposed Solution

### Unified Single Layout Structure

Replace the dual mobile/desktop layouts with a single, responsive structure:

```text
PROPOSED IMPLEMENTATION:
┌───────────────────────────────────────────────────┐
│  section py-10 sm:py-12 lg:py-16                  │ ← Outer spacing (matches PageSection)
│  └─ div mx-4 sm:mx-6 lg:mx-8                      │ ← Consistent card margins
│     └─ card rounded-xl sm:rounded-2xl shadow      │ ← Responsive radius
│        └─ content py-8 sm:py-10 lg:py-12          │ ← Internal padding
└───────────────────────────────────────────────────┘
```

### Spacing Alignment

| Element | Mobile | Tablet | Desktop | Purpose |
|---------|--------|--------|---------|---------|
| **Outer section** | `py-10` | `sm:py-12` | `lg:py-16` | Matches PageSection for rhythm |
| **Card margins** | `mx-4` | `sm:mx-6` | `lg:mx-8` | Consistent with horizontal tokens |
| **Card internal** | `py-8` | `sm:py-10` | `lg:py-12` | Comfortable CTA breathing room |

---

## File to Modify

`src/components/ui/cta-section.tsx`

---

## Implementation Details

### Simplified Single-Layout Structure

```tsx
export const CTASection = ({ title, description, buttons, footer }: CTASectionProps) => {
  const { ref: contentRef, isVisible, variant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });

  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      {/* Card Container with consistent margins */}
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
        {/* Card Background */}
        <div className="bg-gradient-to-r from-primary to-primary-dark py-8 sm:py-10 lg:py-12">
          <div 
            ref={contentRef} 
            className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${animationClass}`}
          >
            {/* Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-elegant text-primary-foreground mb-3 sm:mb-4 lg:mb-6">
              {title}
            </h2>
            
            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              {buttons.map((button, index) => (
                <Button 
                  key={index} 
                  asChild 
                  variant={button.variant || "cta"} 
                  size="responsive-lg" 
                  className="w-full sm:w-auto sm:min-w-[12rem]"
                >
                  <a href={button.href} className="flex items-center justify-center gap-2">
                    {button.icon}
                    <span>{button.text}</span>
                  </a>
                </Button>
              ))}
            </div>
            
            {/* Footer */}
            {footer && (
              <p className="text-primary-foreground/75 mt-4 sm:mt-6 text-xs sm:text-sm">
                {footer}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
```

---

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Layout complexity** | Dual mobile/desktop with `hidden/block` | Single responsive layout |
| **Animation refs** | Duplicate refs (titleRef, buttonsRef) | Single contentRef |
| **Horizontal margins** | Inconsistent (`mx-4 xl:mx-8` vs `mx-4 sm:mx-6 lg:mx-8`) | Unified `mx-4 sm:mx-6 lg:mx-8` |
| **Border radius** | Different (`rounded-2xl` vs `rounded-lg`) | Progressive `rounded-xl sm:rounded-2xl` |
| **Outer spacing** | Excessive `py-16 sm:py-20 lg:py-24` | Aligned `py-10 sm:py-12 lg:py-16` |
| **Button widths** | `w-4/5` on mobile | `w-full` for clean mobile |

---

## Visual Result

```text
┌─────────────────────────────────────────────────────────┐
│  Previous Section (PageSection)                         │
│  py-10 sm:py-12 lg:py-16                                │
└─────────────────────────────────────────────────────────┘
        ↓ 40px / 48px / 64px gap ↓
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │     Ready to Create Something Amazing?            │  │
│  │     Let Soul Train's Eatery handle the...        │  │
│  │                                                   │  │
│  │     [Primary CTA]    [Secondary CTA]             │  │
│  │                                                   │  │
│  │     Proudly serving Charleston, SC...            │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  mx-4 sm:mx-6 lg:mx-8 margins                           │
└─────────────────────────────────────────────────────────┘
        ↓ 40px / 48px / 64px gap ↓
┌─────────────────────────────────────────────────────────┐
│  Footer                                                 │
│  py-10 lg:py-12                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Impact on Existing Pages

All pages using `CTASection` will automatically benefit:

| Page | Current Wrapper | Status |
|------|-----------------|--------|
| About.tsx | None (fixed) | Will use new spacing |
| Reviews.tsx | None | Will use new spacing |
| WeddingMenu.tsx | None | Will use new spacing |
| RequestQuote.tsx | Animation div only | Will use new spacing |
| HomePage | home/CTASection | Will use new spacing |
| AlternativeGallery | GalleryCTA | Will use new spacing |

---

## MenuCTASection Alignment (Optional Follow-up)

The `MenuCTASection` component has similar structure but different implementation. For full consistency, it could be refactored to use the base `CTASection` component. However, this is a separate task and not required for the current refactor.

---

## Summary

This refactor:
1. Eliminates duplicate mobile/desktop layouts
2. Standardizes horizontal margins (`mx-4 sm:mx-6 lg:mx-8`)
3. Aligns outer spacing with `PageSection` tokens (`py-10 sm:py-12 lg:py-16`)
4. Simplifies animation to single ref
5. Ensures consistent card treatment across all breakpoints
