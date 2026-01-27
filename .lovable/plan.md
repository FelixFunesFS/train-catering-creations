

# Tablet Responsiveness Audit and Fix Plan

## Executive Summary

After thoroughly reviewing the codebase, I've identified **8 specific tablet responsiveness issues** across the site. These issues primarily stem from the `useIsMobile()` hook using a 1024px breakpoint, which causes tablets (640px-1023px) to be incorrectly treated as "mobile" in certain components, while CSS/Tailwind uses standard breakpoints (`sm:640px`, `md:768px`, `lg:1024px`).

---

## Issues Identified

### Issue 1: SplitHero Black Strip (Previously Discussed)
**Location:** `src/components/home/SplitHero.tsx`
**Problem:** Black vertical strip on the right edge of the hero on tablet portrait due to `OptimizedImage` defaulting to `aspect-square`
**Solution:** Add `w-full` to visual container and override aspect ratio on OptimizedImage

---

### Issue 2: TestimonialsCarousel Navigation Buttons Hidden on Tablet
**Location:** `src/components/home/TestimonialsCarousel.tsx` (lines 204-226)
**Problem:** Navigation arrows (prev/next) are hidden on tablets because they rely on `!isMobile` which is false for screens under 1024px
**Current Code:**
```tsx
{!isMobile && (
  <>
    <Button ... onClick={goToPrevious}>
    <Button ... onClick={goToNext}>
  </>
)}
```
**Solution:** Use CSS breakpoints instead of JS conditional to show navigation on tablets (768px+)

---

### Issue 3: ImmersiveMobileHero Touch Areas Shown on Tablet
**Location:** `src/components/gallery/ImmersiveMobileHero.tsx` (lines 118-125)
**Problem:** Touch navigation areas are shown on tablets, but tablets may use mouse interaction
**Current Code:**
```tsx
{isMobile && (
  <div className="absolute inset-0 z-10 flex">
    {/* Touch areas */}
  </div>
)}
```
**Solution:** Either extend to tablets (sensible for tablet touch) or use CSS media queries for true mobile-only

---

### Issue 4: ImmersiveMobileHero Touch Instruction Overlay
**Location:** `src/components/gallery/ImmersiveMobileHero.tsx` (lines 174-191)
**Problem:** Touch instruction modal only shows for `isMobile`, excluding touch-enabled tablets
**Solution:** Update to include tablets or use touch detection instead

---

### Issue 5: FeaturedVenueSection Unused isMobile Import
**Location:** `src/components/home/FeaturedVenueSection.tsx` (line 8, 11)
**Problem:** `useIsMobile` is imported and called but never used in the component
**Solution:** Remove unused import to clean up code

---

### Issue 6: MobileActionBar Visible on Tablets
**Location:** `src/components/mobile/MobileActionBar.tsx` and `src/App.tsx` (line 69)
**Problem:** The mobile action bar shows on tablets (under 1024px) which may be undesirable for larger tablet views
**Current Code (App.tsx):**
```tsx
const showMobileActionBar = isMobile && !isAdminRoute && !isQuoteWizardRoute;
```
**Solution:** Consider hiding on tablets (md breakpoint) or keep as-is if touch CTAs are desired on tablets

---

### Issue 7: SinglePageQuoteForm Review Split Layout
**Location:** `src/components/quote/SinglePageQuoteForm.tsx` (lines 75-76)
**Problem:** The review step's split layout only shows on desktop (1024px+), meaning tablets get the stacked mobile layout
**Current Code:**
```tsx
const isReviewStep = currentStep === 5;
const showReviewSplitLayout = isReviewStep && !isMobile;
```
**Solution:** Consider showing split layout on larger tablets (768px+) or keep stacked for simplicity

---

### Issue 8: ServiceCategoriesSection Third Card Layout
**Location:** `src/components/home/ServiceCategoriesSection.tsx` (lines 89, 92, 94, 125)
**Problem:** The third card spans 2 columns on tablets (`md:col-span-2`) creating an asymmetric layout, then reverts to 1 column on desktop
**Current Code:**
```tsx
className={`... ${isThirdCard ? 'md:col-span-2 lg:col-span-1' : ''}`}
```
**Solution:** This is intentional responsive design - the third card fills remaining space on tablet 2-col grid. No fix needed unless unwanted.

---

## Implementation Plan

### Priority 1: Critical Visual Bug

| File | Issue | Change |
|------|-------|--------|
| `src/components/home/SplitHero.tsx` | Black strip on tablet | Add `w-full` to visual container (line 204), add `aspectRatio={undefined}` and `containerClassName="h-full w-full"` to OptimizedImage (line 233) |

### Priority 2: UX Improvements

| File | Issue | Change |
|------|-------|--------|
| `src/components/home/TestimonialsCarousel.tsx` | Nav buttons hidden on tablet | Replace `{!isMobile && ...}` with CSS `hidden md:flex` on the buttons container to show on 768px+ |
| `src/components/gallery/ImmersiveMobileHero.tsx` | Touch areas/instructions | Update conditional to include tablets since they're touch devices: use `useMediaQuery('(max-width: 1023px)')` for both touch areas |

### Priority 3: Code Cleanup

| File | Issue | Change |
|------|-------|--------|
| `src/components/home/FeaturedVenueSection.tsx` | Unused import | Remove `useIsMobile` import and usage on lines 8 and 11 |

### Priority 4: Design Decisions (Optional)

| File | Issue | Recommendation |
|------|-------|----------------|
| `src/components/mobile/MobileActionBar.tsx` | Visible on tablets | **Keep as-is** - touch CTAs are useful on tablets |
| `src/components/quote/SinglePageQuoteForm.tsx` | Mobile layout on tablet review step | **Keep as-is** - stacked layout is cleaner on portrait tablets |
| `src/components/home/ServiceCategoriesSection.tsx` | Third card spans 2 cols on tablet | **Keep as-is** - intentional responsive design |

---

## Detailed Code Changes

### Change 1: SplitHero.tsx - Fix Black Strip

**Line 204 - Add w-full to visual container:**
```tsx
// Before
<div ref={visualRef} className={`relative h-full overflow-hidden hero-vignette ${visualAnimationClass}`}

// After
<div ref={visualRef} className={`relative h-full w-full overflow-hidden hero-vignette ${visualAnimationClass}`}
```

**Lines 226-234 - Override OptimizedImage aspect ratio:**
```tsx
// Before
<OptimizedImage 
  src={currentImage.src} 
  alt={currentImage.alt} 
  className={`w-full h-full object-cover ${getImageObjectPosition(currentIndex)} transition-transform duration-700`} 
  containerClassName="h-full" 
  priority 
  enableVignette={false} 
/>

// After
<OptimizedImage 
  src={currentImage.src} 
  alt={currentImage.alt} 
  aspectRatio={undefined}
  className={`w-full h-full object-cover ${getImageObjectPosition(currentIndex)} transition-transform duration-700`} 
  containerClassName="h-full w-full" 
  priority 
  enableVignette={false} 
/>
```

### Change 2: TestimonialsCarousel.tsx - Show Nav on Tablets

**Lines 204-226 - Use CSS instead of JS conditional:**
```tsx
// Before
{!isMobile && (
  <>
    <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 ..." onClick={goToPrevious}>
      <ChevronLeft className="h-4 w-4 text-white" />
    </Button>
    <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 ..." onClick={goToNext}>
      <ChevronRight className="h-4 w-4 text-white" />
    </Button>
  </>
)}

// After - Use CSS to hide on mobile, show on tablets and up
<div className="hidden md:block">
  <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 ..." onClick={goToPrevious}>
    <ChevronLeft className="h-4 w-4 text-white" />
  </Button>
  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 ..." onClick={goToNext}>
    <ChevronRight className="h-4 w-4 text-white" />
  </Button>
</div>
```

Also update the swipe instruction to only show on true mobile (phones):
```tsx
// Before (line 249)
{isMobile && (

// After
<p className="text-center text-xs text-white/60 mt-4 md:hidden">
  Swipe left or right to see more testimonials
</p>
```

### Change 3: ImmersiveMobileHero.tsx - Include Tablets for Touch

**Update to use a dedicated media query hook that captures all touch devices (under 1024px):**

```tsx
// Line 22 - Keep existing hook or use media query directly
const isTouchDevice = useMediaQuery("(max-width: 1023px)");

// Line 119 - Update touch areas conditional
{isTouchDevice && (
  <div className="absolute inset-0 z-10 flex">
    ...
  </div>
)}

// Line 175 - Update touch instruction conditional
{isTouchDevice && showDetails && (
  ...
)}
```

### Change 4: FeaturedVenueSection.tsx - Remove Unused Import

```tsx
// Line 8 - Remove import
// import { useIsMobile } from "@/hooks/use-mobile";

// Line 11 - Remove usage
// const isMobile = useIsMobile();
```

---

## Files to Modify Summary

| File | Priority | Changes |
|------|----------|---------|
| `src/components/home/SplitHero.tsx` | High | Add w-full, override aspect ratio |
| `src/components/home/TestimonialsCarousel.tsx` | Medium | CSS-based nav visibility |
| `src/components/gallery/ImmersiveMobileHero.tsx` | Medium | Include tablets for touch areas |
| `src/components/home/FeaturedVenueSection.tsx` | Low | Remove unused import |

---

## Technical Notes

- The core issue is the mismatch between the JS `useIsMobile()` hook (1024px breakpoint) and Tailwind CSS breakpoints (`md:768px`, `lg:1024px`)
- Tablets (640px-1023px) fall into a gap where JS treats them as mobile but CSS treats them as mid-size
- The recommended approach is to use **CSS-only responsive classes** wherever possible, reserving JS hooks for functionality that truly differs (like touch vs. mouse interaction)
- For touch-related features (swipe, tap areas), including tablets makes sense since they're touch devices
- For layout decisions, CSS breakpoints should be preferred for consistency

