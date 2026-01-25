

# Revert Background Position & Reduce Hero Padding

## Issue

The last change (`backgroundPosition: 'center 20%'`) moved the image the wrong direction. Additionally, the About page hero has more vertical padding than other pages, causing the content to appear lower.

## Changes

### File: `src/pages/About.tsx` (Lines 78-86)

**1. Revert background position back to center:**

```tsx
{/* Background image - now using team western group */}
<div 
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${teamWesternGroup})` }}
  aria-hidden="true"
/>
```

**2. Reduce section padding to match other pages:**

Change line 78 from:
```tsx
<section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
```

To:
```tsx
<section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
```

## Comparison

| Page | Current Padding | Standard |
|------|-----------------|----------|
| About Hero | `py-12 sm:py-16 lg:py-20` | Too much |
| FAQ | Uses `PageSection pattern="a"` | Standard |
| Reviews | Uses `PageSection pattern="a"` | Standard |

The reduced padding (`py-8 sm:py-10 lg:py-12`) will move the content higher, closer to the navbar, matching the spacing on other pages.

## Summary

- Revert `backgroundPosition: 'center 20%'` back to `bg-center`
- Reduce vertical padding from `py-12/16/20` to `py-8/10/12`

