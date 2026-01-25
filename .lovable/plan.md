

# Crop Top 20% of Hero Background Image

## Current State

The hero section background image (lines 80-84) uses:
- `bg-cover` - scales image to cover container
- `bg-center` - positions image at center
- `bg-no-repeat` - prevents tiling

## Solution

Use CSS `background-position` to shift the image up by 20%, effectively "cropping" the top portion out of view.

---

## Implementation

### File to Modify
`src/pages/About.tsx` (Lines 80-84)

### Change

Replace `bg-center` with a custom background position that starts 20% from the top:

```tsx
{/* Background image - cropped top 20% */}
<div 
  className="absolute inset-0 bg-cover bg-no-repeat"
  style={{ 
    backgroundImage: `url(${teamWesternGroup})`,
    backgroundPosition: 'center 20%'
  }}
  aria-hidden="true"
/>
```

### How It Works

- `backgroundPosition: 'center 20%'` positions the image:
  - **Horizontally**: centered
  - **Vertically**: 20% from the top (effectively hiding the top 20%)

---

## Visual Comparison

```text
ORIGINAL IMAGE:
┌────────────────────────────────────────┐
│  ░░░░░░░░░ TOP 20% ░░░░░░░░░░░░░░░░░░  │  ← Currently visible
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓ TEAM FACES ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└────────────────────────────────────────┘

AFTER CROP (backgroundPosition: 'center 20%'):
┌────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Top 20% hidden
│  ▓▓▓▓▓▓▓▓ TEAM FACES ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Now more visible
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└────────────────────────────────────────┘
```

---

## Technical Notes

1. **No image file changes needed** - this is purely CSS positioning
2. **Responsive** - works across all breakpoints
3. **Adjustable** - can fine-tune the percentage (e.g., `25%` or `30%`) if 20% isn't quite right

