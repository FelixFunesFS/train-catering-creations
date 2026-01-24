
# Add Full-Width Background Image to Testimonials Section

## Overview

Transform the "What Our Clients Say" testimonials section from a plain white background to a cinematic full-bleed section with a background image, creating a more immersive and premium feel that enhances social proof.

---

## Current State

The `TestimonialsCarousel` component currently has:
- Plain `bg-background` (white) background
- Standard container padding
- No visual depth or imagery

---

## Proposed Design

```text
+------------------------------------------------------------------+
|                                                                  |
|   [FULL-WIDTH BACKGROUND IMAGE - Elegant venue/event photo]     |
|   [Dark gradient overlay for text contrast]                      |
|                                                                  |
|                    ✦ Client Love ✦                               |
|               What Our Clients Say                               |
|             Real Stories, Real Satisfaction                      |
|                                                                  |
|           ┌────────────────────────────────────┐                |
|           │  "Soul Train's Eatery made our     │                |
|           │   wedding day absolutely perfect"   │                |
|           │                                     │                |
|           │      - Sarah & Michael Johnson     │                |
|           └────────────────────────────────────┘                |
|                                                                  |
|              ● ● ● ○ ○ ○ ○  (dots navigation)                   |
|                                                                  |
|        [500+ Events]  [★ 4.9 Rating]  [98% Recommend]           |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Implementation Details

### File: `src/components/home/TestimonialsCarousel.tsx`

### Changes:

1. **Add background image container** with full-width coverage
2. **Add dark gradient overlay** for text legibility
3. **Update text colors** for contrast on dark background
4. **Update card styling** for glassmorphism effect
5. **Update stats cards** to match dark theme

### Background Image Options:

Using the high-quality wedding venue image from heroImages:
```
/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png
```
- Rustic wedding venue with chandeliers and string lights
- Quality rating: 9
- Perfect for testimonials context

---

## Key Code Changes

### 1. Section Wrapper (Line 133-136)

**Current:**
```tsx
<section 
  ref={ref}
  className="py-16 sm:py-20 lg:py-24 bg-background"
>
```

**Updated:**
```tsx
<section 
  ref={ref}
  className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
>
  {/* Full-width Background Image */}
  <div 
    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: `url('/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png')` 
    }}
    aria-hidden="true"
  />
  
  {/* Dark gradient overlay for text contrast */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
```

### 2. Text Color Updates

- Badge: `border-white/50 text-white` (was `border-ruby text-ruby`)
- Heading: `text-white` (was `text-foreground`)
- Subtitle: `text-ruby-light` or `text-white/90` (was `text-ruby`)

### 3. Card Styling Update (Line 157-158)

**Current:**
```tsx
<Card 
  className="relative p-5 lg:p-6 bg-white/95 backdrop-blur-sm border-2 border-ruby/20 overflow-hidden"
```

**Updated:**
```tsx
<Card 
  className="relative p-5 lg:p-6 bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
```

### 4. Stats Cards Update (Lines 272-283)

**Current:**
```tsx
<Card className="p-3 text-center bg-white/60 border-ruby/20">
```

**Updated:**
```tsx
<Card className="p-3 text-center bg-white/10 backdrop-blur-sm border-white/20">
  <div className="text-lg lg:text-xl font-bold text-white">500+</div>
  <div className="text-sm text-white/70">Events Catered</div>
</Card>
```

---

## Accessibility Considerations

- Gradient overlay ensures WCAG AA contrast (4.5:1) for all text
- `aria-hidden="true"` on decorative background image
- Card maintains high contrast with white background
- Quote text remains dark on white card for maximum readability

---

## Visual Hierarchy

| Element | Before | After |
|---------|--------|-------|
| Section background | Plain white | Cinematic venue photo |
| Header text | Dark text | White text with shadow |
| Testimonial card | White with ruby border | White with blur effect |
| Stats cards | White/transparent | Glass-morphism style |
| Overall feel | Standard | Premium/immersive |

---

## Files Modified

- `src/components/home/TestimonialsCarousel.tsx`

---

## Result

The testimonials section will transform from a standard white section into a visually striking, full-bleed cinematic experience that:
- Creates emotional connection through imagery
- Elevates perceived brand quality
- Increases trust through premium presentation
- Maintains excellent readability and accessibility
