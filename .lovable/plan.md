

# CTA Accessibility, Our Story Background Sizing, and Spacing Fixes

## Overview
This plan addresses three issues affecting mobile and tablet experience:
1. Our Story section background image sizing (logo too large/cropped on mobile)
2. CTA button text color inheritance for accessibility
3. Excessive spacing between CTA sections and footers

---

## Issue 1: Our Story Background Image Sizing

### Current State
The `AboutPreviewSection` background uses:
```tsx
<div 
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${homeStoryBg})` }}
/>
```

`bg-cover` scales the image to fill the entire container, which can make the logo within the background image appear too large and cropped on smaller screens.

### Solution
Use responsive background sizing - smaller on mobile/tablet, full cover on desktop:

**File: `src/components/home/AboutPreviewSection.tsx`**

Change line 49-53:
```tsx
// From:
<div 
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${homeStoryBg})` }}
  aria-hidden="true"
/>

// To:
<div 
  className="absolute inset-0 bg-contain lg:bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${homeStoryBg})` }}
  aria-hidden="true"
/>
```

This uses `bg-contain` on mobile/tablet (image fits within container, showing the full logo) and `bg-cover` on desktop (image fills container as currently designed).

---

## Issue 2: CTA-to-Footer Spacing

### Current State
Both CTA sections use equal top/bottom padding:
- `cta-section.tsx`: `py-10 sm:py-12 lg:py-16`
- `MenuCTASection.tsx`: `py-12 lg:py-16`

This creates excessive whitespace before the footer on mobile.

### Solution
Reduce bottom padding while maintaining top padding:

**File: `src/components/ui/cta-section.tsx`**

Change line 32:
```tsx
// From:
<section className="py-10 sm:py-12 lg:py-16">

// To:
<section className="pt-10 pb-6 sm:pt-12 sm:pb-8 lg:py-16">
```

**File: `src/components/menu/MenuCTASection.tsx`**

Change line 15:
```tsx
// From:
<section className="py-12 lg:py-16">

// To:
<section className="pt-12 pb-6 sm:pb-8 lg:py-16">
```

---

## Issue 3: CTA Button Text Inheritance

### Problem
The `cta-white` button variant uses `text-navy`, but nested anchor tags may inherit conflicting link styles.

### Solution
Add `text-inherit` to anchor tags inside buttons:

**File: `src/components/ui/cta-section.tsx`**

Change line 72:
```tsx
// From:
<a href={button.href} className="flex items-center justify-center gap-2">

// To:
<a href={button.href} className="flex items-center justify-center gap-2 text-inherit">
```

---

## Visual Impact

```text
Our Story Background (Mobile/Tablet):
BEFORE: bg-cover - logo cropped/too large
AFTER:  bg-contain - full logo visible, properly sized

CTA to Footer (Mobile):
BEFORE: 40px bottom padding
AFTER:  24px bottom padding - tighter layout
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/AboutPreviewSection.tsx` | Change `bg-cover` to `bg-contain lg:bg-cover` |
| `src/components/ui/cta-section.tsx` | Section padding, anchor text inheritance |
| `src/components/menu/MenuCTASection.tsx` | Section padding adjustment |

---

## What's NOT Changing

- CTA section watermark logo (no changes per user clarification)
- Our Story overlay opacity (remains at 85%)
- Desktop background behavior (still uses `bg-cover`)

