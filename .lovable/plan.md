

# Remove Grey Waves & Add Crimson Design Elements to Gallery Section

## Overview

Remove the grey SVG wave dividers from the "Gallery of Flavor & Style" section and replace them with elegant crimson/ruby design elements that match the styling used on the quote page selection cards.

## Current State

The `InteractiveGalleryPreview.tsx` component currently has:
- **Top WaveDivider** (line 168-172): White wave transitioning from services section
- **Bottom WaveDivider** (line 375-380): Platinum-light wave transitioning to about section

## Design Inspiration: Quote Page Cards

The quote selection cards (`QuoteFormSelector.tsx`) feature:
- Corner gradient accents (`bg-gradient-to-bl from-primary/20 to-transparent`)
- Gradient backgrounds with subtle ruby hints (`via-primary/5`)
- Border styling with ruby accents (`border-primary/30`)

## Implementation

### Step 1: Remove Wave Dividers

Delete the two WaveDivider components and their import from `InteractiveGalleryPreview.tsx`.

### Step 2: Add Crimson Corner Accents

Add decorative corner gradient elements to the section, similar to the quote cards:

| Element | Position | Styling |
|---------|----------|---------|
| Top-left accent | Absolute, top-0 left-0 | Ruby gradient fading to transparent |
| Top-right accent | Absolute, top-0 right-0 | Ruby gradient fading to transparent |
| Bottom-left accent | Absolute, bottom-0 left-0 | Ruby gradient fading to transparent |
| Bottom-right accent | Absolute, bottom-0 right-0 | Ruby gradient fading to transparent |

### Step 3: Add Subtle Crimson Border Lines

Add thin horizontal decorative lines at the top and bottom edges:

```tsx
{/* Top decorative border */}
<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />

{/* Bottom decorative border */}
<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />
```

### Step 4: Enhance Section Background

Update the section to include subtle ruby tinting in the gradient, matching the quote card aesthetic:

```tsx
className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-ruby/[0.02] to-background"
```

---

## Visual Comparison

**Before (Grey Waves)**
```text
~~~~~~~~~~~~~ grey wave ~~~~~~~~~~~~~
│                                   │
│   Gallery of Flavor & Style       │
│                                   │
~~~~~~~~~~~~~ grey wave ~~~~~~~~~~~~~
```

**After (Crimson Accents)**
```text
┌─────── ruby gradient line ───────┐
│ ◤                             ◥ │  ← corner accents
│                                   │
│   Gallery of Flavor & Style       │
│                                   │
│ ◣                             ◢ │  ← corner accents
└─────── ruby gradient line ───────┘
```

---

## File Changes

| File | Action | Details |
|------|--------|---------|
| `src/components/home/InteractiveGalleryPreview.tsx` | Edit | Remove WaveDivider import and usages, add crimson design elements |

---

## Technical Implementation

### Updated Section Structure

```tsx
<section 
  ref={ref}
  className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-ruby/[0.02] to-background overflow-hidden"
>
  {/* Crimson decorative elements */}
  
  {/* Top border line */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />
  
  {/* Corner accents */}
  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-ruby/10 to-transparent rounded-br-full pointer-events-none" />
  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-ruby/10 to-transparent rounded-bl-full pointer-events-none" />
  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-ruby/8 to-transparent rounded-tr-full pointer-events-none" />
  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-ruby/8 to-transparent rounded-tl-full pointer-events-none" />
  
  {/* Bottom border line */}
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />
  
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    {/* Existing content */}
  </div>
</section>
```

---

## Design Benefits

1. **Brand Cohesion**: Matches the crimson styling used on the quote selection page
2. **Visual Elegance**: Corner accents add sophistication without heavy visual weight
3. **No Grey Tones**: Eliminates the neutral grey waves that don't align with the ruby brand palette
4. **Subtle Transitions**: Ruby gradient lines create clean section boundaries
5. **Mobile Responsive**: Corner accents scale appropriately on smaller screens

