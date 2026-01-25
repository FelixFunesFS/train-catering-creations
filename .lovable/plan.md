

# Dark Gradient Fade Transition Update

## Current vs Desired Behavior

| Aspect | Current (White In) | Desired (Dark Out) |
|--------|-------------------|-------------------|
| Visual Effect | White fades INTO dark section | Dark fades OUT into white sections |
| Top Gradient | `from-background to-transparent` | `from-black/70 to-transparent` |
| Bottom Gradient | `from-background to-transparent` | `from-black/70 to-transparent` |
| Result | White edges visible at boundaries | Dark edges dissolve smoothly |

## Changes Required

### File 1: `src/components/home/TestimonialsCarousel.tsx`

**Lines 149-152 - Update gradient colors:**

```tsx
{/* Top gradient fade for smooth section transition */}
<div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/70 to-transparent z-10" />

{/* Bottom gradient fade for smooth section transition */}
<div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/70 to-transparent z-10" />
```

### File 2: `src/pages/About.tsx` - Our Story Section

**Lines 126-129 - Update gradient colors:**

```tsx
{/* Top gradient fade for smooth section transition */}
<div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/80 to-transparent z-10" />

{/* Bottom gradient fade for smooth section transition */}
<div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/80 to-transparent z-10" />
```

### File 3: `src/pages/About.tsx` - Values Section

**Lines 246-249 - Update gradient colors:**

```tsx
{/* Top gradient fade for smooth section transition */}
<div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/60 to-transparent z-10" />

{/* Bottom gradient fade for smooth section transition */}
<div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/60 to-transparent z-10" />
```

## Visual Comparison

```text
BEFORE (White fading in):
┌──────────────────────────────────────┐
│  White Section                       │
│  ████████████████████████████████████│  ← White gradient entering dark
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓ Dark Section Content ▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  ████████████████████████████████████│  ← White gradient entering dark
│  White Section                       │
└──────────────────────────────────────┘

AFTER (Dark fading out):
┌──────────────────────────────────────┐
│  White Section                       │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Dark gradient bleeding out
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│▓▓▓ Dark Section Content ▓▓▓▓▓▓▓▓▓▓▓▓│
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Dark gradient bleeding out
│  White Section                       │
└──────────────────────────────────────┘
```

## Technical Notes

- Opacity values match existing dark overlays in each section for visual consistency
- TestimonialsCarousel uses `black/70` (matching its overlay)
- Our Story uses `black/80` (matching its overlay)
- Values uses `black/60` (matching its overlay)

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/TestimonialsCarousel.tsx` | Change `from-background` to `from-black/70` |
| `src/pages/About.tsx` | Change `from-background` to `from-black/80` (Our Story) and `from-black/60` (Values) |

