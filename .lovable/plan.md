

# Fix Glassmorphic Testimonial Card - Override Neumorphic Styles

## Problem Identified

The Card component has a base class `neumorphic-card-2` that applies:
```css
@apply bg-gradient-to-br from-card to-muted border border-border/30;
box-shadow: var(--shadow-neumorphic-2);
```

This solid gradient background overrides our `bg-white/15` glassmorphism styling. The stats cards at the bottom of the testimonials section already work correctly because they use `!important` flags (`!bg-none !bg-black/35`).

---

## Solution

Use Tailwind's `!important` modifier to override the neumorphic base styles, similar to how the stats cards do it.

---

## File to Modify

`src/components/home/TestimonialsCarousel.tsx`

---

## Implementation Details

### Change 1: Main Testimonial Card (line 170)

**Before:**
```tsx
<Card 
  className="relative p-5 lg:p-6 bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl ring-1 ring-white/20 overflow-hidden"
```

**After:**
```tsx
<Card 
  className="relative p-5 lg:p-6 !bg-white/15 !backdrop-blur-xl !border-white/30 !shadow-2xl ring-1 ring-white/20 overflow-hidden"
```

Key changes:
- `bg-white/15` to `!bg-white/15` - forces the glass background
- `backdrop-blur-xl` to `!backdrop-blur-xl` - ensures blur effect applies
- `border-white/30` to `!border-white/30` - overrides neumorphic border
- `shadow-2xl` to `!shadow-2xl` - overrides neumorphic shadow

---

## Visual Comparison

```text
BEFORE (Current - Broken):
┌─────────────────────────────────────┐
│ ███████████████████████████████████ │  ← Solid white/card color
│ █  "Quote text..."                █ │     (neumorphic-card-2 wins)
│ █  - Author Name                  █ │     White text invisible
│ ███████████████████████████████████ │
└─────────────────────────────────────┘

AFTER (Fixed):
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Frosted glass (bg-white/15)
│ ░  "Quote text..."                ░ │     Background image visible through
│ ░  - Author Name                  ░ │     White text readable
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────┘
```

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| White-on-white card | `neumorphic-card-2` base class overrides background | Use `!important` modifiers on bg, blur, border, shadow |

This single line change will make the testimonial card properly glassmorphic with the frosted glass effect showing the dark background image behind it, ensuring white text is readable with high contrast.

