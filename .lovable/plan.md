

# Slow Down Scrolling Marquees + Ensure Responsiveness

## Current State Analysis

### Marquee Components on Home Page
| Component | Current Speed | pauseOnHover | Content Repetition |
|-----------|---------------|--------------|-------------------|
| **ServiceMarquee** | `normal` | false | 6x repeats |
| **TrustMarquee** | `normal` | true | 6x repeats |
| **BrandMarquee** | `slow` | false | 8x repeats |

### Current CSS Animation Speeds (in `src/index.css`)
| Class | Mobile | Tablet (768px+) | Desktop (1024px+) |
|-------|--------|-----------------|-------------------|
| `.marquee` (normal) | 70s | 60s | 50s |
| `.marquee-slow` | 100s | 80s | 70s |
| `.marquee-fast` | 55s | 48s | 38s |

**Issue**: While the speeds are already mobile-first (slower on mobile), users may find the current speeds too fast for comfortable reading.

---

## Proposed Changes

### 1. Slow Down All Animation Speeds
Increase animation durations by ~30-40% across all breakpoints for a more relaxed, elegant feel.

**New CSS Speeds:**
| Class | Mobile | Tablet (768px+) | Desktop (1024px+) |
|-------|--------|-----------------|-------------------|
| `.marquee` (normal) | 95s | 80s | 65s |
| `.marquee-slow` | 130s | 110s | 90s |
| `.marquee-fast` | 75s | 65s | 50s |

### 2. Update Component Speed Settings
Change marquee components to use slower speeds for better readability:

| Component | Current | Proposed |
|-----------|---------|----------|
| **ServiceMarquee** | `normal` | `slow` |
| **TrustMarquee** | `normal` | `slow` |
| **BrandMarquee** | `slow` | `slow` (no change) |

### 3. Responsiveness Verification

**Already Good (No Changes Needed):**
- Text sizing: `text-sm sm:text-base lg:text-lg` (ServiceMarquee, TrustMarquee)
- Gap scaling: `gap-6 sm:gap-8 lg:gap-12` or `gap-8 lg:gap-12`
- Icon sizing: `h-4 w-4` (consistent across breakpoints)
- Padding: `py-4 sm:py-5 lg:py-6` responsive vertical padding
- Container: `overflow-hidden` prevents horizontal scroll issues

**BrandMarquee Enhancement:**
- Current text: `text-lg sm:text-xl lg:text-2xl xl:text-3xl` - Good
- Current logo: `h-6 w-6 lg:h-8 lg:w-8` - Add `sm:h-7 sm:w-7` for smoother tablet transition

---

## Technical Implementation

### File 1: `src/index.css` (lines 662-702)

Update marquee animation speeds:

```css
/* Mobile: Slowest speeds for comfortable reading on smaller viewports */
.marquee {
  animation: marquee 95s linear infinite;
}

.marquee-slow {
  animation: marquee 130s linear infinite;
}

.marquee-fast {
  animation: marquee 75s linear infinite;
}

/* Tablet: Medium speeds */
@media (min-width: 768px) {
  .marquee {
    animation: marquee 80s linear infinite;
  }

  .marquee-slow {
    animation: marquee 110s linear infinite;
  }

  .marquee-fast {
    animation: marquee 65s linear infinite;
  }
}

/* Desktop: Comfortable speeds for visual rhythm */
@media (min-width: 1024px) {
  .marquee {
    animation: marquee 65s linear infinite;
  }

  .marquee-slow {
    animation: marquee 90s linear infinite;
  }

  .marquee-fast {
    animation: marquee 50s linear infinite;
  }
}
```

### File 2: `src/components/home/ServiceMarquee.tsx` (line 7)

```tsx
// Change from 'normal' to 'slow'
speed: 'slow',
```

### File 3: `src/components/home/TrustMarquee.tsx` (line 11)

```tsx
// Change from 'normal' to 'slow'
speed: 'slow',
```

### File 4: `src/components/home/BrandMarquee.tsx` (lines 19, 26, 33, 40, 47, 54)

Add tablet breakpoint for logo sizing (`sm:h-7 sm:w-7`):

```tsx
className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 flex-shrink-0"
```

---

## Speed Comparison Summary

| Before | After | Change |
|--------|-------|--------|
| Mobile normal: 70s | Mobile slow: 130s | ~85% slower |
| Tablet normal: 60s | Tablet slow: 110s | ~83% slower |
| Desktop normal: 50s | Desktop slow: 90s | ~80% slower |

This creates a much more relaxed, elegant scrolling experience that allows users to comfortably read the content.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Update all marquee animation durations (lines 662-702) |
| `src/components/home/ServiceMarquee.tsx` | Change speed to `'slow'` (line 7) |
| `src/components/home/TrustMarquee.tsx` | Change speed to `'slow'` (line 11) |
| `src/components/home/BrandMarquee.tsx` | Add `sm:h-7 sm:w-7` to logo images (6 occurrences) |

