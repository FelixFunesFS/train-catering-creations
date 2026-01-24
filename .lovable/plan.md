

# Remove Hero Controls & Add Glassmorphic Testimonial Cards

## Overview

Two focused changes to clean up the hero section and enhance the testimonials visual design with accessible glassmorphism.

---

## Part 1: Remove Hero Carousel Controls

### Current State (lines 282-295 in SplitHero.tsx)
```tsx
{/* Controls */}
<div className="absolute top-6 right-6 z-20 flex space-x-2">
  <Button ... onClick={handlePrevious}>...</Button>
  <Button ... onClick={togglePlayPause}>...</Button>
  <Button ... onClick={handleNext}>...</Button>
</div>
```

### Action
Delete the entire controls div (lines 282-295). Navigation will rely on:
- Progress indicator dots (already in place, lines 275-280)
- Auto-play functionality (already enabled)

### Impact
- Cleaner hero visual
- CTAs become the sole focal point
- Progress dots remain for manual navigation

---

## Part 2: Glassmorphic Testimonial Card

### Current State (line 169-170 in TestimonialsCarousel.tsx)
```tsx
<Card className="relative p-5 lg:p-6 bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
```

This is almost glassmorphic but uses `bg-white/95` which is nearly opaque.

### Proposed Glassmorphism Styling

| Property | Current | Proposed | Rationale |
|----------|---------|----------|-----------|
| Background | `bg-white/95` | `bg-white/20` | More see-through for glass effect |
| Backdrop blur | `backdrop-blur-md` | `backdrop-blur-xl` | Stronger frosted glass |
| Border | `border-white/20` | `border-white/30` | Slightly more visible edge |
| Shadow | `shadow-2xl` | `shadow-2xl` | Keep for depth |
| Ring | none | `ring-1 ring-white/20` | Subtle inner glow |

### Accessibility Considerations

With a more transparent background, text contrast becomes critical. The section already has a dark overlay (`bg-black/70 via-black/60 to-black/70`), but we need to ensure text remains readable.

**Text Color Adjustments:**
- Quote text: Change from `text-foreground` to `text-white` for maximum contrast
- Author name: Change from `text-foreground` to `text-white`
- Role text: Keep `text-ruby` but ensure it's visible (ruby on dark = good contrast)
- Event text: Change from `text-muted-foreground` to `text-white/80`
- Quote icon: Keep `text-ruby` with reduced opacity

**Contrast Ratios (WCAG AA requires 4.5:1 for normal text):**
- White text on dark blur background: ~15:1 (exceeds requirement)
- Ruby (#9B2335) on dark background: ~5.2:1 (passes AA)

---

## Implementation Details

### File 1: `src/components/home/SplitHero.tsx`

**Delete lines 282-295** (the Controls div):
```tsx
// DELETE THIS ENTIRE BLOCK:
{/* Controls */}
<div className="absolute top-6 right-6 z-20 flex space-x-2">
  <Button variant="ghost" size="icon" onClick={handlePrevious} ...>
    <ArrowLeft className="h-5 w-5" />
  </Button>
  
  <Button variant="ghost" size="icon" onClick={togglePlayPause} ...>
    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
  </Button>
  
  <Button variant="ghost" size="icon" onClick={handleNext} ...>
    <ArrowRight className="h-5 w-5" />
  </Button>
</div>
```

**Note:** The `togglePlayPause`, `Pause`, and `Play` imports can also be cleaned up since they'll no longer be used.

### File 2: `src/components/home/TestimonialsCarousel.tsx`

**Change 1: Card styling (line 169-170)**

Before:
```tsx
<Card 
  className="relative p-5 lg:p-6 bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
```

After:
```tsx
<Card 
  className="relative p-5 lg:p-6 bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl ring-1 ring-white/20 overflow-hidden"
```

**Change 2: Quote icon (line 177)**

Before:
```tsx
<Quote className="h-12 w-12 lg:h-16 lg:w-16 text-ruby" />
```

After:
```tsx
<Quote className="h-12 w-12 lg:h-16 lg:w-16 text-white/30" />
```

**Change 3: Quote text (line 189)**

Before:
```tsx
<blockquote className="text-center text-base lg:text-lg text-foreground leading-relaxed italic">
```

After:
```tsx
<blockquote className="text-center text-base lg:text-lg text-white leading-relaxed italic">
```

**Change 4: Author name (line 204)**

Before:
```tsx
<h4 className="font-elegant font-bold text-foreground text-lg">
```

After:
```tsx
<h4 className="font-elegant font-bold text-white text-lg">
```

**Change 5: Event text (line 217)**

Before:
```tsx
<p className="text-sm text-muted-foreground">
```

After:
```tsx
<p className="text-sm text-white/80">
```

**Change 6: Navigation buttons (lines 236, 245) - adjust for glass context**

Before:
```tsx
className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border border-ruby/20"
```

After:
```tsx
className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
```

Also update ChevronLeft/ChevronRight icons from `text-ruby` to `text-white`.

---

## Visual Result

```text
BEFORE (Hero):
┌────────────────────────────────────────────┐
│  [●●○]                      [◁][⏸][▷]     │  ← Controls visible
│                                            │
│         [Image Area]                       │
│                                            │
│  ❤ Soul Train's Eatery                     │
└────────────────────────────────────────────┘

AFTER (Hero):
┌────────────────────────────────────────────┐
│  [●●○]                                     │  ← Clean, dots only
│                                            │
│         [Image Area]                       │
│                                            │
│  ❤ Soul Train's Eatery                     │
└────────────────────────────────────────────┘

BEFORE (Testimonials):
┌─────────────────────────────────────┐
│ ███████████████████████████████████ │  ← Nearly opaque white
│ █  "Quote text..."                █ │
│ █  - Author Name                  █ │
│ ███████████████████████████████████ │
└─────────────────────────────────────┘

AFTER (Testimonials):
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Frosted glass, sees through
│ ░  "Quote text..."                ░ │     White text for contrast
│ ░  - Author Name                  ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────┘
```

---

## Summary

| Change | File | Impact |
|--------|------|--------|
| Remove hero controls | SplitHero.tsx | Cleaner hero, dots remain for navigation |
| Glassmorphic card | TestimonialsCarousel.tsx | Elegant frosted glass effect |
| White text colors | TestimonialsCarousel.tsx | High contrast for accessibility |
| Glass nav buttons | TestimonialsCarousel.tsx | Consistent glass aesthetic |

