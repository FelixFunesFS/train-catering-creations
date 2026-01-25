

# About Page Hero Image Positioning Adjustment

## Current Issue

The hero section background image (`teamWesternGroup`) is set to `bg-center`, which centers the image both horizontally and vertically. Since the text content overlays the center of the section, the team members' faces in the photo are partially obscured by the 85% white overlay and content.

## Solution

Adjust the background position to show the faces **above** the content area. This involves:

1. **Change background position** from `bg-center` to `bg-top` or a custom `object-position` value
2. **Increase section height** slightly to give more vertical space for the image to display above the content
3. **Add top padding** to push content down, creating a "window" where faces are visible at the top

---

## Implementation Details

### File to Modify
`src/pages/About.tsx` (Lines 78-110)

### Changes

**A. Restructure Hero with Visible Image Area Above Content**

```tsx
{/* Header Section - With Team Group Background Image */}
<section className="relative overflow-hidden">
  {/* Image Display Area - Visible faces above content */}
  <div className="relative h-48 sm:h-56 lg:h-64">
    {/* Background image - positioned at top */}
    <div 
      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: `url(${teamWesternGroup})` }}
      aria-hidden="true"
    />
    
    {/* Lighter overlay on image area - 60% to show faces clearly */}
    <div className="absolute inset-0 bg-background/60" />
    
    {/* Top gradient fade */}
    <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
    
    {/* Bottom gradient fade into content */}
    <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-t from-background to-transparent z-10" />
  </div>
  
  {/* Content Area - Below the visible image */}
  <div className="relative z-20 bg-background py-8 sm:py-10 lg:py-12">
    <PageHeader
      badge={{
        icon: <Heart className="h-5 w-5" />,
        text: "Our Story"
      }}
      title="Meet the Heart Behind Soul Train's Eatery"
      subtitle="A Family Legacy of Flavor"
      description="From family traditions to professional excellence, discover the passionate team that brings authentic Southern flavors and warm hospitality to every event across Charleston's beautiful Lowcountry."
      buttons={[
        { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
      ]}
      animated={true}
    />
  </div>
</section>
```

### Visual Comparison

```text
BEFORE:
┌────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Gradient fade (top)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← 85% overlay hides faces
│      "Meet the Heart Behind..."         │  ← Content in center
│      [Request Quote]                    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Gradient fade (bottom)
└────────────────────────────────────────┘

AFTER:
┌────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Gradient fade (top)
│  ▒▒▒▒▒▒ TEAM FACES VISIBLE ▒▒▒▒▒▒▒▒▒▒  │  ← 60% overlay - faces show
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Gradient fade into content
├────────────────────────────────────────┤
│      "Meet the Heart Behind..."         │  ← Content below image
│      A Family Legacy of Flavor          │
│      [Request Quote]                    │
└────────────────────────────────────────┘
```

---

## Technical Notes

1. **Two-Zone Layout**: The hero is split into an image display zone (top) and content zone (bottom)
2. **Lighter Overlay**: The image area uses `bg-background/60` instead of 85% to show faces more clearly
3. **Background Position**: Changed from `bg-center` to `bg-top` to prioritize showing faces
4. **Responsive Heights**: Image area scales from `h-48` (mobile) to `h-64` (desktop)
5. **Smooth Transition**: The bottom gradient of the image zone fades seamlessly into the content area

---

## Alternative Approach (Simpler)

If a simpler change is preferred, we can just adjust the background position without restructuring:

```tsx
{/* Background image - positioned at top to show faces */}
<div 
  className="absolute inset-0 bg-cover bg-top bg-no-repeat"
  style={{ backgroundImage: `url(${teamWesternGroup})` }}
  aria-hidden="true"
/>
```

This keeps the current structure but positions the image from the top, making faces more visible within the existing overlay.

