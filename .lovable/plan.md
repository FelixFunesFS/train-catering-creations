

# Our Values Icons - Three Complementary Accessible Colors

## Overview

Instead of using a single gold color for all three icons, we'll use three distinct brand colors that create visual variety while maintaining accessibility against the dark glassmorphic background (`bg-black/35`).

---

## Color Selection

Based on the theme's color system, here are three complementary colors with excellent contrast on dark backgrounds:

| Card | Icon | Color Class | HSL Value | Contrast Rationale |
|------|------|-------------|-----------|-------------------|
| Quality First | Award | `text-gold` | 45, 85%, 55% | Warm gold - represents excellence and premium quality |
| Family Spirit | Users | `text-ruby-light` | 348, 83%, 62% | Light ruby/crimson - represents warmth and love (brand primary) |
| Reliability | Clock | `text-platinum-light` | 210, 5%, 85% | Light platinum/silver - represents dependability and timelessness |

---

## Visual Preview

```text
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🏆 GOLD        │  │  ❤️ RUBY        │  │  ⏱️ PLATINUM    │
│  Quality First  │  │  Family Spirit  │  │  Reliability    │
│  ...            │  │  ...            │  │  ...            │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

This creates a warm-to-cool progression across the three cards while using the established brand palette.

---

## Implementation Details

**File:** `src/pages/About.tsx`

### Change 1: Award Icon - Gold (line 161)
```tsx
// Before
<Award className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-sm" />

// After
<Award className="h-12 w-12 text-gold mx-auto mb-4 drop-shadow-sm" />
```

### Change 2: Users Icon - Ruby Light (line 169)
```tsx
// Before
<Users className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-sm" />

// After
<Users className="h-12 w-12 text-ruby-light mx-auto mb-4 drop-shadow-sm" />
```

### Change 3: Clock Icon - Platinum Light (line 177)
```tsx
// Before
<Clock className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-sm" />

// After
<Clock className="h-12 w-12 text-platinum-light mx-auto mb-4 drop-shadow-sm" />
```

---

## Accessibility Considerations

All three colors have strong contrast against the `bg-black/35` backdrop:

- **Gold** (HSL 45, 85%, 55%): Bright warm tone, ~7:1 contrast ratio
- **Ruby Light** (HSL 348, 83%, 62%): Lighter crimson, ~5:1 contrast ratio, maintains brand identity
- **Platinum Light** (HSL 210, 5%, 85%): Near-white silver, ~10:1 contrast ratio

All exceed WCAG AA requirements for graphical elements (3:1 minimum).

---

## Summary

| Element | Before | After | Semantic Meaning |
|---------|--------|-------|------------------|
| Award icon | `text-white` | `text-gold` | Excellence, premium |
| Users icon | `text-white` | `text-ruby-light` | Warmth, family love |
| Clock icon | `text-white` | `text-platinum-light` | Timeless reliability |

This approach adds visual interest through color variety while staying within the brand palette and maintaining excellent accessibility.

