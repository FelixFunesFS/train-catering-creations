
# Add Full-Width Background Image to "Our Values" Section

## Overview

Transform the "Our Values" section on the About page from a pattern-based background to a cinematic full-bleed section, matching the visual treatment applied to the "Our Story" section above it.

---

## Current State (Lines 134-172)

The "Our Values" section currently has:
- `PageSection` wrapper with `pattern="b"` (solid color pattern)
- Three-column grid of NeumorphicCards with icons (Award, Users, Clock)
- Standard light background with dark text
- Values displayed: Quality First, Family Spirit, Reliability

---

## Proposed Design

```text
+------------------------------------------------------------------+
|                                                                  |
|   [FULL-WIDTH BACKGROUND IMAGE - Rustic venue with chandeliers] |
|   [Dark gradient overlay for text contrast - center-focused]    |
|                                                                  |
|                        Our Values                                |
|              "These core values guide..."                        |
|                                                                  |
|    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      |
|    │   ★ Award    │  │   ★ Users    │  │   ★ Clock    │      |
|    │               │  │               │  │               │      |
|    │  Quality     │  │  Family      │  │  Reliability │      |
|    │  First       │  │  Spirit      │  │               │      |
|    │               │  │               │  │               │      |
|    │  Glassmorphism│  │  Glassmorphism│  │  Glassmorphism│      |
|    │  dark cards  │  │  dark cards  │  │  dark cards  │      |
|    └───────────────┘  └───────────────┘  └───────────────┘      |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Background Image Selection

**Recommended**: `/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png`
- Rustic venue with chandeliers, string lights, and elegant dining setup
- Different from the military ceremony image used in "Our Story"
- Warm, inviting atmosphere that complements the "values" messaging

---

## File to Modify

`src/pages/About.tsx`

---

## Implementation Details

### 1. Replace PageSection with Custom Section (Lines 134-172)

**Current structure:**
```tsx
<PageSection pattern="b" withBorder>
  <div className="max-w-7xl mx-auto...">
    ...
  </div>
</PageSection>
```

**New structure:**
```tsx
<section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
  {/* Full-width Background Image */}
  <div 
    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: `url('/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png')` 
    }}
    aria-hidden="true"
  />
  
  {/* Dark gradient overlay */}
  <div className="absolute inset-0 bg-black/60" />
  
  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    ...
  </div>
</section>
```

### 2. Update Text Colors for Contrast

| Element | Current | Updated |
|---------|---------|---------|
| Section heading | `text-foreground` | `text-white` |
| Section subtitle | `text-muted-foreground` | `text-white/80` |

### 3. Update Value Cards - Glassmorphism Dark Style

Replace NeumorphicCard with glassmorphism dark cards:

**Current:**
```tsx
<NeumorphicCard level={2} className="text-center hover:scale-105...">
  <Award className="h-12 w-12 text-primary..." />
  <h3 className="...text-foreground...">Quality First</h3>
  <p className="...text-muted-foreground">...</p>
</NeumorphicCard>
```

**Updated:**
```tsx
<div className="!bg-none !bg-black/35 !backdrop-blur-md rounded-xl p-6 text-center border border-white/20 ring-1 ring-white/10 hover:scale-105 transition-transform duration-300">
  <Award className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-sm" />
  <h3 className="text-xl font-elegant font-semibold text-white mb-4 drop-shadow-sm">Quality First</h3>
  <p className="text-sm text-white/80 drop-shadow-sm">...</p>
</div>
```

### 4. Icon Color Updates

| Icon | Current | Updated |
|------|---------|---------|
| Award | `text-primary` | `text-white` |
| Users | `text-primary` | `text-white` |
| Clock | `text-primary` | `text-white` |

---

## Gradient Overlay Choice

Using `bg-black/60` (uniform dark overlay) because:
- The section has centered content (heading + 3 cards in a row)
- A uniform overlay works better than a directional gradient for this layout
- Ensures all three value cards remain equally readable

---

## Accessibility Considerations

- Dark overlay ensures WCAG AA contrast for white text
- `aria-hidden="true"` on decorative background image
- `drop-shadow-sm` on text provides additional legibility boost
- Cards have clear visual boundaries with ring and border

---

## Visual Result

| Element | Before | After |
|---------|--------|-------|
| Section background | Light pattern | Elegant venue photo |
| Text colors | Dark text | White text with drop shadows |
| Value cards | Neumorphic (light) | Glassmorphism (dark, blurred) |
| Icons | Ruby red | White |
| Overall feel | Standard | Premium/immersive |

---

## Consistency with "Our Story" Section

This treatment matches the "Our Story" section pattern:
- Full-bleed background image
- Dark overlay for contrast
- White text colors
- Glassmorphism card styling

Creates visual rhythm: Hero → Our Story (full-bleed) → Team (light) → Values (full-bleed) → CTA
