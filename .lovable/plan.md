

# Request a Quote Page - Desktop Viewport Optimization

## Problem Summary

On desktop (1920x1080), the "Request a Catering Quote" page has layout issues:
1. **CTAs cut off**: The contact CTA section is barely visible without scrolling
2. **Excessive vertical spacing**: Too much padding between sections
3. **Card height**: Cards are taller than needed, pushing content below the fold
4. **Decorative gradients**: Corner overlays reduce text readability

---

## Proposed Solution

Reduce vertical spacing throughout the page to ensure all key content (header, both cards, and CTA contact section) fits within a single desktop viewport without scrolling.

---

## Visual Comparison

### Current Layout (Approximate Heights)

```text
+--------------------------------------------------+
|  Header (nav bar)                        ~60px   |
+--------------------------------------------------+
|                                                  |
|  py-14 section padding (top)             ~56px   |
|                                                  |
|  ┌──────────────────────────────────────────┐    |
|  │  Badge + Title + Subtitle + Description  │    |
|  │  py-16 header padding                    │    |
|  │  (roughly 200-250px total)               │    |
|  └──────────────────────────────────────────┘    |
|                                                  |
|  mt-8 gap                                ~32px   |
|                                                  |
|  ┌───────────────────┐  ┌───────────────────┐    |
|  │  Regular Events   │  │  Formal Events    │    |
|  │  p-8 padding      │  │  p-8 padding      │    |
|  │  Icon + Title     │  │  Icon + Title     │    |
|  │  4 bullet points  │  │  4 bullet points  │    |
|  │  mb-8 + CTA btn   │  │  mb-8 + CTA btn   │    |
|  │  (~380px height)  │  │  (~380px height)  │    |
|  └───────────────────┘  └───────────────────┘    |
|                                                  |
|  py-14 section padding (bottom)          ~56px   |
|                                                  |
+--------------------------------------------------+ <-- ~800px mark
|                                                  |
|  ┌──────────────────────────────────────────┐    |
|  │  Questions About Your Quote? (CTA)       │    | <-- CUT OFF
|  │  py-16 padding + card                    │    |
|  └──────────────────────────────────────────┘    |
|                                                  |
+--------------------------------------------------+
```

### Optimized Layout (Target: Fit in 1080px viewport)

```text
+--------------------------------------------------+
|  Header (nav bar)                        ~60px   |
+--------------------------------------------------+
|                                                  |
|  py-8 section padding (top)              ~32px   |
|                                                  |
|  ┌──────────────────────────────────────────┐    |
|  │  Badge + Title + Subtitle + Description  │    |
|  │  Reduced py-8 header padding             │    |
|  │  (roughly 150-180px total)               │    |
|  └──────────────────────────────────────────┘    |
|                                                  |
|  mt-4 gap                                ~16px   |
|                                                  |
|  ┌───────────────────┐  ┌───────────────────┐    |
|  │  Regular Events   │  │  Formal Events    │    |
|  │  p-5 padding      │  │  p-5 padding      │    |
|  │  Icon + Title     │  │  Icon + Title     │    |
|  │  4 bullet points  │  │  4 bullet points  │    |
|  │  mb-6 + CTA btn   │  │  mb-6 + CTA btn   │    |
|  │  (~300px height)  │  │  (~300px height)  │    |
|  └───────────────────┘  └───────────────────┘    |
|                                                  |
|  py-6 section padding (bottom)           ~24px   |
|                                                  |
+--------------------------------------------------+ <-- ~600px mark
|                                                  |
|  ┌──────────────────────────────────────────┐    |
|  │  Questions About Your Quote? (CTA)       │    | <-- VISIBLE!
|  │  Compact py-8 padding                    │    |
|  └──────────────────────────────────────────┘    |
|                                                  |
+--------------------------------------------------+ <-- ~850px total
```

---

## Changes by File

### 1. RequestQuote.tsx

**Section padding reduction:**
- Change `py-10 lg:py-14` to `py-6 lg:py-8` on main section
- This saves ~40-60px of vertical space

**Gap between header and cards:**
- Change `mt-6 sm:mt-8` to `mt-4 lg:mt-6`
- This saves ~10-15px of vertical space

### 2. QuoteFormSelector.tsx

**Card internal padding:**
- Change `p-5 sm:p-6 lg:p-8` to `p-5 lg:p-6`
- Saves ~8px per card on desktop

**Feature list spacing:**
- Change `space-y-4` to `space-y-3`
- Saves ~12px per card (3 gaps x 4px)

**Button margin:**
- Change `mb-8` to `mb-6`
- Saves ~8px per card

**Center text section margin:**
- Change `mb-6` to `mb-4`
- Saves ~8px per card

**Reduce decorative gradient opacity:**
- Change `from-primary/20` to `from-primary/10`
- Improves text readability without removing visual interest

### 3. QuoteHeader.tsx / PageHeader

**Header padding:**
- Change `py-6 sm:py-8 lg:py-12 xl:py-16` to `py-4 sm:py-6 lg:py-8`
- Saves ~30-50px on desktop

**Bottom margin on description:**
- Keep existing or tighten slightly

### 4. CTASection.tsx

**Section padding:**
- Change `pt-10 pb-6 sm:pt-12 sm:pb-8 lg:py-16` to `pt-6 pb-4 sm:pt-8 sm:pb-6 lg:py-10`
- Saves ~40px on desktop

**Internal card padding:**
- Change `py-8 sm:py-10 lg:py-12` to `py-6 sm:py-8 lg:py-10`
- Saves ~16px

---

## Summary of Space Savings

| Component | Current | Proposed | Savings |
|-----------|---------|----------|---------|
| Section top padding | 56px | 32px | ~24px |
| Header internal padding | 64px | 32px | ~32px |
| Header-to-cards gap | 32px | 16px | ~16px |
| Card padding (per card) | 32px | 24px | ~8px |
| Card feature list spacing | 48px | 36px | ~12px |
| Card button margin | 32px | 24px | ~8px |
| Section bottom padding | 56px | 24px | ~32px |
| CTA section padding | 64px | 40px | ~24px |

**Total estimated savings: ~150-180px**

This brings the total page height from ~950-1000px down to ~800-850px, fitting comfortably within a 1080px viewport height.

---

## Mobile Preservation

All changes use responsive breakpoint classes:
- Mobile values remain the same (e.g., `py-6` on mobile)
- Only `lg:` desktop values are reduced
- No changes to grid behavior or card layout structure

---

## Files to Modify

1. **src/pages/RequestQuote.tsx** - Section padding and gaps
2. **src/components/quote/QuoteFormSelector.tsx** - Card padding and spacing
3. **src/components/ui/page-header.tsx** - Header vertical padding (affects all pages using PageHeader, so changes must be conservative or use a prop)
4. **src/components/ui/cta-section.tsx** - CTA section padding

---

## Implementation Notes

- The PageHeader component is shared across multiple pages. Rather than changing its defaults, we can pass a `compact` prop or use a custom className override specifically for the quote page
- All spacing changes use Tailwind's responsive prefixes to ensure mobile layouts are unaffected
- Card gradient overlays will be softened from `/20` to `/10` opacity for better text contrast

