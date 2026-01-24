

# Standardize Spacing, CTAs, and Full-Width Background Design System

## Executive Summary

This plan establishes a consistent spacing system across all pages, addresses the CTA card vs. full-bleed question, and clarifies when to use full-width background images. The goal is visual consistency and a premium feel throughout the site.

---

## Part 1: Design Decisions

### CTAs: Card vs. Full-Width

| Approach | Recommendation | Rationale |
|----------|----------------|-----------|
| **Pre-Footer CTAs** | Card treatment (current `CTASection`) | Creates clear action zones, provides visual separation from footer, premium "floating" effect |
| **Mid-Page CTAs** | Full-bleed for major conversions | Maximum impact when breaking up content |

**Current Implementation is CORRECT**: The `CTASection` component uses a card approach (`rounded-2xl`, `mx-4`, `shadow-elevated`) which is ideal for pre-footer placement. This provides:
- Visual breathing room before the footer
- Clear call-to-action zone
- Consistent with premium catering brand

### Full-Width Backgrounds: Card vs. Full-Bleed

| Section Type | Recommendation | Rationale |
|--------------|----------------|-----------|
| **Cinematic/Story Sections** | Full-bleed (edge-to-edge) | Maximum immersion, premium feel |
| **Content Sections** | Pattern backgrounds | Clean, readable, organized |
| **CTAs** | Card treatment | Clear action boundary |

**Current About page is CORRECT**: "Our Story" and "Our Values" use full-bleed backgrounds which is appropriate for immersive storytelling sections.

---

## Part 2: Spacing Inconsistencies Found

### Issue 1: Double Padding on About Page CTA

**Problem**: About.tsx wraps `CTASection` inside `PageSection`, causing double padding.

```text
Current About.tsx:
┌─ PageSection pattern="a" (py-6 sm:py-8 lg:py-12) ─┐
│  ┌─ CTASection (py-16 sm:py-20 lg:py-24) ───────┐ │
│  │                                                │ │
│  │  CTA Content                                   │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

Result: Excessive vertical spacing (py-6+py-16 = ~88px top on mobile)
```

**Fix**: Remove `PageSection` wrapper, use `CTASection` directly.

### Issue 2: Reviews Page Uses CTASection Correctly (No Wrapper)

Reviews.tsx uses `CTASection` without a `PageSection` wrapper - this is the correct pattern.

### Issue 3: Inconsistent PageSection Base Padding

**Current**: `py-6 sm:py-8 lg:py-12` (24px / 32px / 48px)

This is somewhat tight for content sections. Recommend a slight increase for better rhythm.

### Issue 4: Footer Padding

**Current**: `py-[38px]` - arbitrary value

**Recommendation**: Standardize to `py-10 lg:py-12` (40px / 48px) for consistency.

### Issue 5: Full-Bleed Sections Have Inconsistent Padding

- "Our Story": `py-16 sm:py-20 lg:py-24`
- "Our Values": `py-16 sm:py-20 lg:py-24`
- CTASection: `py-16 sm:py-20 lg:py-24`

These are consistent - good.

---

## Part 3: Proposed Spacing System

### Vertical Section Spacing Token System

| Section Type | Mobile | Tablet | Desktop | CSS Classes |
|--------------|--------|--------|---------|-------------|
| **Standard Content** | 40px | 48px | 64px | `py-10 sm:py-12 lg:py-16` |
| **Hero/Feature** | 48px | 64px | 80px | `py-12 sm:py-16 lg:py-20` |
| **Full-Bleed Cinematic** | 64px | 80px | 96px | `py-16 sm:py-20 lg:py-24` |
| **CTA Sections** | 48px | 64px | 80px | `py-12 sm:py-16 lg:py-20` (internal) |
| **Footer Main** | 40px | 40px | 48px | `py-10 lg:py-12` |
| **Footer Copyright** | 16px | 16px | 16px | `py-4` |

### Horizontal Content Padding (Consistent)

| Breakpoint | Value | CSS |
|------------|-------|-----|
| Mobile | 16px | `px-4` |
| Tablet | 24px | `sm:px-6` |
| Desktop | 32px | `lg:px-8` |

---

## Part 4: Files to Modify

### 1. `src/components/ui/page-section.tsx`

Update base padding from `py-6 sm:py-8 lg:py-12` to `py-10 sm:py-12 lg:py-16` for better vertical rhythm.

### 2. `src/pages/About.tsx`

Remove `PageSection` wrapper around `CTASection` (lines 187-206).

**Before:**
```tsx
<PageSection pattern="a" withBorder>
  <CTASection ... />
</PageSection>
```

**After:**
```tsx
<CTASection ... />
```

### 3. `src/components/Footer.tsx`

Standardize footer padding from `py-[38px]` to `py-10 lg:py-12`.

### 4. `src/pages/FAQ.tsx`

The FAQ page doesn't use `CTASection` - it has an inline CTA. This is fine as it's a different pattern (contact card within content).

---

## Part 5: Visual Summary

### About Page After Changes

```text
┌─────────────────────────────────────────────────────────┐
│  PAGE HEADER (PageSection pattern="a")                  │
│  py-10 sm:py-12 lg:py-16                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  OUR STORY (Full-bleed section)                         │
│  py-16 sm:py-20 lg:py-24                                │
│  [Military Ceremony Background]                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  MEET OUR TEAM (PageSection pattern="c")                │
│  py-10 sm:py-12 lg:py-16                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  OUR VALUES (Full-bleed section)                        │
│  py-16 sm:py-20 lg:py-24                                │
│  [Buffet Setup Background]                              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  CTA SECTION (Card - NO PageSection wrapper)            │
│  mx-4 rounded-2xl shadow-elevated                       │
│  Internal py-12 xl:py-16                                │
└─────────────────────────────────────────────────────────┘
        ↓ Natural spacing to footer ↓
┌─────────────────────────────────────────────────────────┐
│  FOOTER                                                 │
│  py-10 lg:py-12                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Part 6: Responsive Considerations

### Mobile-First Approach

All spacing uses mobile values as base, then scales up:
- Mobile: Tighter spacing for quick scrolling
- Tablet: Moderate breathing room
- Desktop: Generous spacing for immersive experience

### Safe Areas

Footer already accounts for safe-area-inset-bottom in the copyright bar. No changes needed.

---

## Part 7: Implementation Summary

| File | Change | Impact |
|------|--------|--------|
| `page-section.tsx` | Update base padding | All pages get consistent section spacing |
| `About.tsx` | Remove CTA wrapper | Fixes double-padding issue |
| `Footer.tsx` | Standardize to token value | Consistent footer across site |

---

## Design Philosophy Applied

1. **Cards for Actions**: CTA sections use card treatment to create clear action zones
2. **Full-Bleed for Immersion**: Story/values sections use edge-to-edge backgrounds for cinematic impact
3. **Pattern Backgrounds for Content**: Standard sections use subtle patterns to organize without overwhelming
4. **Consistent Tokens**: All spacing follows a predictable scale (10/12/16/20/24 × 4px base)
5. **Progressive Enhancement**: Mobile-first with generous desktop spacing

