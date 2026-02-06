

## Remove First Hero Image from Desktop View Only

### What Changes
The first slide (chef serving image) will be skipped on desktop. The carousel will start at what is currently the second slide (appetizers) and only cycle through slides 2-4. Mobile/tablet remains unchanged and continues to show all 4 slides.

### Technical Changes -- 1 file

**`src/components/home/SplitHero.tsx`**

1. **Create a desktop-specific image array**: Filter out the first image (index 0) for desktop, keeping all images for mobile.

2. **Use the filtered array in the desktop return block**: Replace references to `heroImages` with the filtered array (3 items instead of 4) for the desktop section only. This affects:
   - The carousel auto-advance (`heroImages.length`)
   - The progress indicator dots
   - The `currentImage` lookup
   - Navigation handlers (prev/next bounds)

3. **Remove the blurred background layer** from the desktop section (lines 307-309) since the chef image will no longer appear there.

4. **Keep mobile section unchanged**: It continues using the full `heroImages` array with all 4 slides, including the blurred background layer for the chef image.

### Implementation Detail

```text
// Desktop: slides 1-3 (appetizers, spread, event space)
const desktopImages = heroImages.slice(1);

// Mobile: all 4 slides unchanged
```

The `currentIndex` state and all carousel logic (auto-advance, swipe, keyboard nav) will reference `desktopImages` in the desktop block and `heroImages` in the mobile block. Since these are two separate return paths (early return for mobile), each can use its own array independently.

