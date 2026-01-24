
# Fix Hero Section Spacing Gap

## The Issue

The extra space between the navbar and the hero story is caused by the `PageSection` wrapper around the hero in `AlternativeGallery.tsx`.

The `PageSection` component has default padding: `py-6 sm:py-8 lg:py-12` which adds vertical padding even though `className="py-0"` is passed. Tailwind's class merging doesn't guarantee the override wins.

---

## Solution

Remove the `PageSection` wrapper from around the hero section. The hero is a full-bleed visual component that should not have any wrapper padding.

---

## Changes

**File: `src/pages/AlternativeGallery.tsx`**

**Before (lines 95-105):**
```tsx
{/* Mobile-First Hero Section */}
<PageSection pattern="a" skipToContentId="gallery-hero" className="py-0">
  <div ref={heroRef} className={useAnimationClass(heroVariant, heroVisible)}>
    <ImmersiveMobileHero 
      onScrollToGallery={() => {
        const gallerySection = document.querySelector('[data-section="discovery"]');
        gallerySection?.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  </div>
</PageSection>
```

**After:**
```tsx
{/* Mobile-First Hero Section - Full bleed, no wrapper padding */}
<div id="gallery-hero" ref={heroRef} className={useAnimationClass(heroVariant, heroVisible)}>
  <ImmersiveMobileHero 
    onScrollToGallery={() => {
      const gallerySection = document.querySelector('[data-section="discovery"]');
      gallerySection?.scrollIntoView({ behavior: 'smooth' });
    }}
  />
</div>
```

---

## Why This Works

| Before | After |
|--------|-------|
| `PageSection` adds `py-6 sm:py-8 lg:py-12` padding | No wrapper padding - hero is full-bleed |
| Class override `py-0` may not win | No conflict - clean structure |
| Extra visual gap between nav and hero image | Hero image starts immediately below nav |

---

## Visual Result

```
Before:
+----------------------------------+
| Navigation Bar                   |
+----------------------------------+
|   (PageSection padding gap)      |  <-- REMOVED
+----------------------------------+
| Hero Story Image                 |
+----------------------------------+

After:
+----------------------------------+
| Navigation Bar                   |
+----------------------------------+
| Hero Story Image                 |  <-- Immediate transition
+----------------------------------+
```

---

## File Modified

| File | Change |
|------|--------|
| `src/pages/AlternativeGallery.tsx` | Remove `PageSection` wrapper from hero, use plain `div` with accessibility ID |
