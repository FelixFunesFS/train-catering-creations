
# About Page Team Section Updates

## Overview

Three visual updates to the "Meet Our Team" section on the About page:
1. Remove the watermark logo behind the team cards
2. Remove the square container background from profile images
3. Double the size of profile images (100% increase)

---

## Changes Summary

### 1. Remove Watermark Logo

**Current**: A faded logo sits behind the team cards as a decorative watermark (10% opacity)

**Action**: Remove the entire watermark container (lines 182-190)

```text
Before:                          After:
┌────────────────────┐           ┌────────────────────┐
│    [Team Cards]    │           │    [Team Cards]    │
│   ░░░ LOGO ░░░     │    →      │                    │
│    [Team Cards]    │           │    [Team Cards]    │
└────────────────────┘           └────────────────────┘
```

---

### 2. Remove Square Background from Profile Images

**Current**: Profile images have a container with `relative w-32 h-32` wrapper creating a visible boundary

**Action**: Remove the wrapper div and apply sizing directly to the OptimizedImage component. The images already have `rounded-full` applied, so they display as circles

---

### 3. Increase Profile Image Size by 100%

**Current size**: `w-32 h-32` (128px x 128px)

**New size**: `w-64 h-64` (256px x 256px) - doubled

| Dimension | Before | After |
|-----------|--------|-------|
| Width | 128px (w-32) | 256px (w-64) |
| Height | 128px (h-32) | 256px (h-64) |

---

## Technical Changes

### File: `src/pages/About.tsx`

**Change 1 - Remove logo watermark (lines 182-190)**

Delete this block:
```tsx
{/* Watermark Logo - centered behind team cards */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 object-contain opacity-[0.10]"
  />
</div>
```

**Change 2 & 3 - Update Chef Train's profile image (lines 206-213)**

Before:
```tsx
<div className="relative w-32 h-32 mx-auto mb-4">
  <OptimizedImage 
    src="/lovable-uploads/ca9f1bb5-3b58-46fc-a5e4-cf2359a610ed.png" 
    alt="Chef Dominick 'Train' Ward"
    aspectRatio="aspect-square"
    className="rounded-full object-cover"
  />
</div>
```

After:
```tsx
<OptimizedImage 
  src="/lovable-uploads/ca9f1bb5-3b58-46fc-a5e4-cf2359a610ed.png" 
  alt="Chef Dominick 'Train' Ward"
  aspectRatio="aspect-square"
  className="w-64 h-64 mx-auto mb-4 rounded-full object-cover"
/>
```

**Change 2 & 3 - Update Tanya's profile image (lines 229-236)**

Before:
```tsx
<div className="relative w-32 h-32 mx-auto mb-4">
  <OptimizedImage 
    src="/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png" 
    alt="Pastry Chef Tanya Ward" 
    aspectRatio="aspect-square"
    className="rounded-full object-cover"
  />
</div>
```

After:
```tsx
<OptimizedImage 
  src="/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png" 
  alt="Pastry Chef Tanya Ward" 
  aspectRatio="aspect-square"
  className="w-64 h-64 mx-auto mb-4 rounded-full object-cover"
/>
```

---

## Visual Result

```text
Before:                              After:
┌─────────────────────┐              ┌─────────────────────┐
│   ┌───┐   ┌───┐     │              │  ┌─────┐  ┌─────┐   │
│   │ ○ │   │ ○ │     │  (small)     │  │     │  │     │   │  (large)
│   └───┘   └───┘     │              │  │  ○  │  │  ○  │   │
│      [LOGO]         │              │  │     │  │     │   │
│     (faded)         │              │  └─────┘  └─────┘   │
│                     │              │                     │
└─────────────────────┘              └─────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/About.tsx` | Remove watermark logo, update both profile image components |
