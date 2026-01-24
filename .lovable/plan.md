

# Remove Marquee & Adjust Hero Spacing

## Overview
A simple cleanup to remove the ServiceMarquee from the gallery page and ensure the hero section has proper spacing from the navigation bar.

---

## Changes

### 1. Remove ServiceMarquee

**File: `src/pages/AlternativeGallery.tsx`**

- Remove the `ServiceMarquee` import (line 11)
- Remove the `<ServiceMarquee />` component usage (lines 96-97)

---

### 2. Adjust Hero Margin from Navigation

**File: `src/components/gallery/ImmersiveMobileHero.tsx`**

Add top padding to account for the fixed navigation bar:

**Current (line 80):**
```tsx
<div className="relative h-[85vh] lg:h-screen overflow-hidden bg-gradient-primary">
```

**Updated:**
```tsx
<div className="relative h-[85vh] lg:h-screen overflow-hidden bg-gradient-primary pt-16 lg:pt-20">
```

The `pt-16` (64px) on mobile and `pt-20` (80px) on desktop provides appropriate clearance below the fixed navigation, ensuring the hero content and progress indicators don't get hidden behind the navbar.

---

## Visual Result

```
Before:
+----------------------------------+
| Navigation                       |
+----------------------------------+
| ServiceMarquee                   |
+----------------------------------+
| Hero (85vh, no top padding)      |
+----------------------------------+

After:
+----------------------------------+
| Navigation                       |
+----------------------------------+
| Hero (85vh, with top padding)    |
| - Progress bars visible          |
| - Clean transition from nav      |
+----------------------------------+
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/pages/AlternativeGallery.tsx` | Remove ServiceMarquee import and usage |
| `src/components/gallery/ImmersiveMobileHero.tsx` | Add responsive top padding (pt-16 lg:pt-20) |

