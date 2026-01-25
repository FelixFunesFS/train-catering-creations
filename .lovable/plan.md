
# Background Images & Menu Gallery Implementation Plan

## Overview

This plan implements four changes:
1. Add the first uploaded image as background to the "Our Story" section on the homepage
2. Add the second uploaded image as hero background on the About page
3. Add the third uploaded image as hero background on the Menu page
4. Add a new food/catering gallery section after the menu options

---

## Part 1: Copy Uploaded Images to Project

### Files to Create

| Source | Destination | Purpose |
|--------|-------------|---------|
| `user-uploads://image-gen_2.jpg` | `src/assets/home-story-bg.jpg` | Homepage "Our Story" section background |
| `user-uploads://image-gen_1.jpg` | `src/assets/about-hero-bg.jpg` | About page hero section background |
| `user-uploads://image-gen-2.png` | `src/assets/menu-hero-bg.png` | Menu page hero section background |

---

## Part 2: Homepage "Our Story" Section Background

### File: `src/components/home/AboutPreviewSection.tsx`

**Current State**: Uses `bg-gradient-pattern-d` class for background

**Changes**:
- Import the new background image asset
- Replace the gradient class with a relative container
- Add the background image with proper positioning
- Add a white overlay (85-90%) for text readability
- Add top/bottom gradient fades for smooth transitions to adjacent sections

**Visual Structure**:
```text
┌─────────────────────────────────────────────┐
│ ░░░░░ Top gradient fade ░░░░░░░░░░░░░░░░░░ │
│                                             │
│  [Ruby wave background image]               │
│  [White overlay 85%]                        │
│                                             │
│      "Meet the Soul Behind the Train"       │
│      Chef Train & Tanya content             │
│                                             │
│ ░░░░░ Bottom gradient fade ░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────┘
```

---

## Part 3: About Page Hero Background

### File: `src/pages/About.tsx`

**Current State**: PageHeader uses default styling without a background image

**Changes**:
- Import the new hero background image asset
- Modify the header section to include a background image container
- Add the ruby wave image (image-gen_1.jpg - bottom waves) as background
- Ensure proper overlay for text contrast
- Maintain all existing header content and animations

---

## Part 4: Menu Page Hero Background

### File: `src/components/menu/SimpleMenuHeader.tsx`

**Current State**: Plain background with subtle ruby corner accents

**Changes**:
- Import the new menu hero background image
- Add the ruby ribbon wave (image-gen-2.png) as a decorative background
- Position image appropriately (likely covering the section)
- Add semi-transparent overlay for readability
- Keep existing header content, badge, and text styling

---

## Part 5: New Food Gallery Section for Menu Page

### New File: `src/components/menu/MenuFoodGallery.tsx`

**Purpose**: Display 4-5 curated food and catering images after the menu options

**Design Specifications**:
- Responsive grid layout: 2 columns on mobile, 3-5 on desktop
- Use high-quality images from existing gallery data
- Staggered scroll animations matching the rest of the site
- Simple, clean design that complements the menu content
- Ruby accent styling consistent with brand

**Selected Images** (from existing gallery assets - high quality scores):

| Image | Source | Quality |
|-------|--------|---------|
| Golden Baked Mac & Cheese | `foodMacCheese` | 9 |
| Cajun-Spiced Salmon Fillets | `foodSalmon` | 9 |
| Herb-Roasted Chicken Drumsticks | `foodJerkChicken` | 8 |
| Outdoor Tent Service | `buffetOutdoorTent` | 9 |
| Holiday Cupcake Collection | `dessertHolidayCupcakes` | 9 |

**Component Structure**:
```tsx
<section className="py-12 relative overflow-hidden">
  {/* Section header */}
  <div className="text-center mb-8">
    <Badge>Our Signature Dishes</Badge>
    <h2>A Taste of What We Serve</h2>
  </div>
  
  {/* Image grid - responsive */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {images.map((img, i) => (
      <Card key={i} className="group overflow-hidden">
        <OptimizedImage 
          src={img.src}
          alt={img.title}
          className="aspect-square object-cover group-hover:scale-105"
        />
        <div className="p-3">
          <h3>{img.title}</h3>
        </div>
      </Card>
    ))}
  </div>
</section>
```

### File: `src/pages/SimplifiedMenu.tsx`

**Changes**:
- Import the new `MenuFoodGallery` component
- Add it between the menu categories section and the CTA section

---

## Summary of Files to Modify/Create

| File | Action |
|------|--------|
| `src/assets/home-story-bg.jpg` | Copy from uploads |
| `src/assets/about-hero-bg.jpg` | Copy from uploads |
| `src/assets/menu-hero-bg.png` | Copy from uploads |
| `src/components/home/AboutPreviewSection.tsx` | Add background image with overlay |
| `src/pages/About.tsx` | Add hero background image |
| `src/components/menu/SimpleMenuHeader.tsx` | Add hero background image |
| `src/components/menu/MenuFoodGallery.tsx` | Create new component |
| `src/pages/SimplifiedMenu.tsx` | Import and add food gallery section |

---

## Technical Implementation Details

### Background Image Pattern (consistent across all sections)

```tsx
<section className="relative overflow-hidden">
  {/* Background image */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${importedImage})` }}
    aria-hidden="true"
  />
  
  {/* Overlay for readability */}
  <div className="absolute inset-0 bg-background/85" />
  
  {/* Edge gradient fades */}
  <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
  
  {/* Content */}
  <div className="relative z-20">
    {/* ... */}
  </div>
</section>
```

### Mobile Responsiveness

- All background images use `bg-cover` and `bg-center` for proper scaling
- Overlay opacity may be slightly higher on mobile (90%) for better text readability
- Food gallery uses responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Image aspect ratios maintained with `aspect-square` on gallery items
