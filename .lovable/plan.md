

# Add Full-Width Background Image to "Our Story" Section

## Overview

Transform the "Our Story" section on the About page from a plain pattern-based background to a cinematic full-bleed section with a background image, matching the visual treatment we just applied to the testimonials section.

---

## Current State

The "Our Story" section currently has:
- `PageSection` wrapper with `pattern="b"` (solid color pattern)
- Two-column grid layout with text and image card
- Standard white/light background

---

## Proposed Design

```text
+------------------------------------------------------------------+
|                                                                  |
|   [FULL-WIDTH BACKGROUND IMAGE - Military formal venue photo]   |
|   [Dark gradient overlay for text contrast]                      |
|                                                                  |
|    ┌─────────────────────┐    ┌──────────────────────┐          |
|    │                     │    │                      │          |
|    │   Our Story         │    │   [Chef Train &     │          |
|    │                     │    │    Team Photo]      │          |
|    │   Soul Train's      │    │                      │          |
|    │   Eatery was born   │    │   Glassmorphism     │          |
|    │   from a deep love  │    │   card effect       │          |
|    │   of Southern...    │    │                      │          |
|    │                     │    └──────────────────────┘          |
|    │   [See Our Work]    │                                      |
|    │                     │                                      |
|    └─────────────────────┘                                      |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Implementation Details

### File: `src/pages/About.tsx`

### Changes:

1. **Replace PageSection with custom section** - Remove `pattern="b"` wrapper and create a relative container with background image
2. **Add background image container** - Use the military formal ceremony image that complements the section's existing photo
3. **Add dark gradient overlay** - For text legibility
4. **Update text colors** - Switch to white text for contrast
5. **Update card styling** - Glassmorphism effect on the image card
6. **Update button styling** - Ensure visibility on dark background

### Background Image Selected:

```
/lovable-uploads/9ea8f6b7-e1cd-4f55-a434-1ffedf0b96dc.png
```
- Military Formal Ceremony with decorative lighting arch
- Quality rating: 9
- Complements the existing team photo showing a military event

---

## Key Code Changes

### 1. Replace PageSection (Lines 30-61)

**Current:**
```tsx
<PageSection pattern="b" withBorder>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    ...
  </div>
</PageSection>
```

**Updated:**
```tsx
{/* Our Story Section - Full-width Background Image */}
<section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
  {/* Full-width Background Image */}
  <div 
    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: `url('/lovable-uploads/9ea8f6b7-e1cd-4f55-a434-1ffedf0b96dc.png')` 
    }}
    aria-hidden="true"
  />
  
  {/* Dark gradient overlay for text contrast */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
  
  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    ...
  </div>
</section>
```

### 2. Text Color Updates

| Element | Current | Updated |
|---------|---------|---------|
| Heading | `text-foreground` | `text-white` |
| Paragraphs | `text-muted-foreground` | `text-white/90` |

### 3. Image Card Styling

**Current:**
```tsx
<NeumorphicCard level={3} className="overflow-hidden p-3">
```

**Updated:**
```tsx
<div className="overflow-hidden p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
```

### 4. Button Styling

The existing `variant="cta"` button should remain visible, but we'll ensure it has proper contrast:
```tsx
<Button asChild variant="cta" size="lg" className="shadow-lg">
```

---

## Gradient Direction Note

Using `bg-gradient-to-r from-black/80 via-black/60 to-black/40` (horizontal gradient):
- Darker on the **left side** where the text is
- Lighter on the **right side** where the image card is
- This ensures text readability while still showing the background image on the right

---

## Accessibility Considerations

- Gradient overlay ensures WCAG AA contrast for white text
- `aria-hidden="true"` on decorative background image
- Button maintains high contrast with CTA styling
- Image in card remains fully visible with white card background

---

## Visual Result

| Element | Before | After |
|---------|--------|-------|
| Section background | Light pattern | Cinematic venue photo |
| Text colors | Dark text | White text |
| Image card | Neumorphic shadow | Glassmorphism blur |
| Overall feel | Standard | Premium/immersive |

---

## Files Modified

- `src/pages/About.tsx`

---

## Result

The "Our Story" section will transform into a visually striking, full-bleed cinematic experience that:
- Creates visual consistency with the testimonials section
- Elevates the premium feel of the About page
- Showcases Soul Train's professional catering work as the backdrop
- Maintains excellent readability with the horizontal gradient overlay

