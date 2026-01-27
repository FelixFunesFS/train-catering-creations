

# Service Cards Section Update

## Overview

This plan modifies the ServiceCategoriesSection to remove individual card buttons, add a "See Menu" CTA alongside the existing "Get Your Quote" button, and reduce the service card image heights by 20%.

---

## Changes Summary

| Change | Description |
|--------|-------------|
| Remove card CTAs | Delete the individual CTA buttons from each service card |
| Add "See Menu" button | Place next to "Get Your Quote" after the cards grid |
| Reduce image height | Change aspect ratio from 4:3 to approximately 5:3 (20% reduction) |

---

## Implementation Details

### 1. Remove Individual Card CTA Buttons

**File:** `src/components/home/ServiceCategoriesSection.tsx`

Remove lines 159-167 (the Individual CTA Button section) from the `renderCardContent` function.

**Before:**
```tsx
{/* Individual CTA Button */}
<div className="pt-3">
  <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-ruby group-hover:text-white transition-all duration-300">
    <Link to={service.ctaHref} className="flex items-center justify-center gap-2">
      <span>{service.ctaText}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  </Button>
</div>
```

**After:** (removed entirely)

---

### 2. Add "See Menu" Button Next to "Get Your Quote"

**File:** `src/components/home/ServiceCategoriesSection.tsx`

Update the Section CTA area (lines 231-239) to include two buttons side by side with responsive layout.

**Before:**
```tsx
<div className="flex justify-center mt-6 sm:mt-8">
  <Button variant="cta" size="responsive-md" asChild>
    <a href="/request-quote" className="flex items-center gap-2">
      <span>Get Your Quote</span>
      <ArrowRight className="h-4 w-4" />
    </a>
  </Button>
</div>
```

**After:**
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
  <Button variant="cta" size="responsive-md" asChild>
    <Link to="/request-quote" className="flex items-center gap-2">
      <span>Get Your Quote</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  </Button>
  <Button variant="outline" size="responsive-md" asChild className="border-ruby text-ruby hover:bg-ruby hover:text-white">
    <Link to="/menu" className="flex items-center gap-2">
      <Utensils className="h-4 w-4" />
      <span>See Menu</span>
    </Link>
  </Button>
</div>
```

**Import:** Add `Utensils` to the lucide-react imports.

---

### 3. Reduce Image Height by 20%

**File:** `src/components/home/ServiceCategoriesSection.tsx`

The current aspect ratio is `aspect-[4/3]` which equals 1.33:1.

To reduce height by 20%:
- Original height factor: 3 (from 4:3)
- 20% reduction: 3 * 0.8 = 2.4
- New ratio: 4:2.4 = 5:3 = `aspect-[5/3]`

**Before (line 102):**
```tsx
<div className="relative aspect-[4/3] overflow-hidden">
```

**After:**
```tsx
<div className="relative aspect-[5/3] overflow-hidden">
```

---

## Visual Summary

### Button Layout (After)

**Mobile (stacked):**
```text
┌─────────────────────────────────┐
│     [ Get Your Quote → ]        │
├─────────────────────────────────┤
│     [ 🍴 See Menu ]             │
└─────────────────────────────────┘
```

**Desktop (side by side):**
```text
[ Get Your Quote → ]  [ 🍴 See Menu ]
```

### Service Card (After - No Individual CTA)
```text
┌─────────────────────────────────┐
│  [Image - 20% shorter height]   │
├─────────────────────────────────┤
│  Wedding Catering               │
│  Your Dream Day                 │
│                                 │
│  Description text...            │
│                                 │
│  ✓ Custom Menu Planning         │
│  ✓ Professional Service         │
│  ✓ Elegant Presentation         │
└─────────────────────────────────┘
       (no button here)
```

---

## Technical Details

### Responsive Behavior

| Breakpoint | Button Layout | Image Aspect Ratio |
|------------|---------------|-------------------|
| Mobile (<640px) | Stacked vertically | 5:3 (wider/shorter) |
| Tablet (640px+) | Side by side | 5:3 (wider/shorter) |
| Desktop (1024px+) | Side by side | 5:3 (wider/shorter) |

### Files Modified

| File | Changes |
|------|---------|
| `src/components/home/ServiceCategoriesSection.tsx` | Remove card CTAs, add dual buttons, update aspect ratio, add Utensils import |

---

## Cleanup

The `ctaText` and `ctaHref` properties in the `ServiceCategory` interface and data objects can optionally be removed since they are no longer used. This keeps the code clean and removes unused properties.

