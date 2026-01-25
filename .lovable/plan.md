
# Wave Dividers for Gallery Section

## Overview

Add elegant SVG wave dividers to the top and bottom of the "Gallery of Flavor & Style" section to create smooth visual transitions between sections. The waves will complement the existing platinum gradient background and brand color palette.

## Design Approach

The waves will use a subtle, organic curve that flows naturally between sections:
- **Top wave**: Transitions from the previous section (Services with Pattern C gold) into the gallery
- **Bottom wave**: Transitions from the gallery into the next section (About with Pattern D navy)

## Implementation

### Step 1: Create Reusable WaveDivider Component

Create a new component `src/components/ui/wave-divider.tsx` with configurable options:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| position | 'top' \| 'bottom' | 'bottom' | Wave placement |
| color | string | 'currentColor' | Fill color (supports CSS variables) |
| height | number | 60 | Wave height in pixels |
| flip | boolean | false | Flip wave horizontally |
| className | string | '' | Additional styling |

The component renders an inline SVG with a smooth bezier curve path, fully responsive via `preserveAspectRatio="none"`.

### Step 2: Integrate Waves into Gallery Section

Update `src/components/home/InteractiveGalleryPreview.tsx`:

**Top Wave** (before section content):
- Position: absolute, top-0
- Color: matches previous section background (white/cream)
- Creates illusion of previous section "flowing" into gallery

**Bottom Wave** (after section content):
- Position: absolute, bottom-0
- Color: matches gallery background (platinum gradient)
- Creates smooth transition to next section

### Step 3: Color Integration

The waves will use the brand palette:
- Top wave fill: `hsl(var(--background))` (white) - blends with Services section
- Bottom wave fill: `hsl(var(--platinum-light))` or semi-transparent platinum - transitions to About section

## File Changes

| File | Action |
|------|--------|
| `src/components/ui/wave-divider.tsx` | Create - new reusable component |
| `src/components/home/InteractiveGalleryPreview.tsx` | Edit - add wave dividers |

## Technical Details

### WaveDivider Component Structure

```tsx
interface WaveDividerProps {
  position?: 'top' | 'bottom';
  color?: string;
  height?: number;
  flip?: boolean;
  className?: string;
}

export const WaveDivider = ({
  position = 'bottom',
  color = 'hsl(var(--background))',
  height = 60,
  flip = false,
  className
}: WaveDividerProps) => {
  // Renders full-width SVG wave
  // Uses smooth bezier curve for organic shape
  // preserveAspectRatio="none" for responsive scaling
};
```

### SVG Wave Path

The wave uses a cubic bezier curve for a natural, flowing shape:

```svg
<path d="M0,0 C320,80 480,0 640,40 C800,80 960,0 1280,60 L1280,100 L0,100 Z" />
```

This creates gentle undulations rather than harsh geometric shapes.

### Gallery Section Integration

```tsx
<section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-pattern-b">
  {/* Top Wave - white flowing down from Services section */}
  <WaveDivider 
    position="top" 
    color="hsl(var(--background))" 
    height={50}
    className="text-background"
  />
  
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    {/* Existing gallery content */}
  </div>
  
  {/* Bottom Wave - platinum flowing into About section */}
  <WaveDivider 
    position="bottom" 
    color="hsl(var(--platinum-light))" 
    height={50}
    flip
  />
</section>
```

## Visual Result

```text
┌─────────────────────────────────────────┐
│         Services Section                │
│         (Pattern C - Gold)              │
└─────────────────────────────────────────┘
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ← Top wave (white)
┌─────────────────────────────────────────┐
│                                         │
│      Gallery of Flavor & Style          │
│         (Pattern B - Platinum)          │
│                                         │
└─────────────────────────────────────────┘
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ← Bottom wave (platinum)
┌─────────────────────────────────────────┐
│          About Section                  │
│         (Pattern D - Navy)              │
└─────────────────────────────────────────┘
```

## Accessibility

- Waves are purely decorative and include `aria-hidden="true"`
- No impact on screen readers or keyboard navigation
- Maintains all existing accessibility features

## Mobile Responsiveness

- Wave height scales proportionally on mobile (`h-[40px] sm:h-[50px] lg:h-[60px]`)
- Full-width coverage at all breakpoints
- Smooth transitions maintained on touch devices
