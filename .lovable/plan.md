

# Fix Stats Cards Contrast in Testimonials Section

## Problem Identified

The 3 stats cards below the testimonial quote appear as "white on white" because:

1. The `Card` component uses `neumorphic-card-2` class by default
2. This class applies `bg-gradient-to-br from-card to-muted` (white gradient background)
3. The `bg-white/10` utility class I added gets overridden due to CSS specificity

---

## Solution

Override the neumorphic background by using the `!important` flag via Tailwind's `!` prefix, or by explicitly adding background override. For this case, I'll use Tailwind's `!bg-white/10` syntax to ensure the transparent background takes precedence.

---

## Technical Changes

### File: `src/components/home/TestimonialsCarousel.tsx`

**Lines 284-295 - Update Stats Cards:**

```tsx
// Current (gets overridden by neumorphic-card-2)
<Card className="p-3 text-center bg-white/10 backdrop-blur-sm border-white/20">

// Fixed (using ! prefix to override neumorphic defaults)
<Card className="p-3 text-center !bg-white/10 !backdrop-blur-sm !border-white/20 !shadow-none">
```

The `!` prefix forces these utilities to take precedence over the neumorphic-card-2 base styles.

Also add `!shadow-none` to remove the neumorphic shadow which doesn't work well on dark backgrounds.

---

## All Card Updates

| Line | Current | Fixed |
|------|---------|-------|
| 284 | `bg-white/10 backdrop-blur-sm border-white/20` | `!bg-white/10 !backdrop-blur-sm !border-white/20 !shadow-none` |
| 288 | Same | Same fix |
| 292 | Same | Same fix |

---

## Mobile Swipe Text Fix

Also update line 277 for the mobile swipe instruction text, which uses `text-muted-foreground` (dark text on dark background):

```tsx
// Current
<p className="text-center text-xs text-muted-foreground mt-4">

// Fixed
<p className="text-center text-xs text-white/60 mt-4">
```

---

## Result

- Stats cards will have a subtle glassmorphism effect with 10% white background
- White text will be clearly visible against the dark image background
- Maintains the premium aesthetic established by the full-bleed design

