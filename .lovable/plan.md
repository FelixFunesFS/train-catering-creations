

## Fix First Hero Image Zoom Level

### Problem
The first hero image (photo grid) appears overly zoomed in because it's a collage-style image being displayed with `object-cover` in a tall container. The `object-[center_40%]` positioning crops most of the image content.

### Solution
Adjust the object-fit and positioning for the first image (index 0) so more of the photo grid is visible, and compress/optimize the image for web delivery.

### Changes (1 file)

**`src/components/home/SplitHero.tsx`**

1. **Change object positioning for index 0** -- Switch from `object-[center_40%]` to `object-[center_center]` with a scale-down approach using a custom CSS class that combines `object-contain` behavior on mobile (where the tall viewport causes extreme cropping) and a gentler `object-cover object-center` on desktop.

2. **Practical approach** -- Since the image is a photo grid (not a single focal point), the best fix is:
   - Mobile: Change to `object-[center_50%]` so the image is centered rather than cropped to the top 40%
   - Add a `scale-[0.85]` transform so the image renders slightly smaller within its container, revealing more of the collage
   - This keeps the same layout system but "zooms out" visually

3. **Update `getImageObjectPosition`** to return both positioning and scale classes for index 0:
   ```
   if (index === 0) {
     return "object-center scale-[1.0]";  // no extra zoom, centered
   }
   ```
   Combined with changing the function name to `getImageClasses` to reflect it now returns multiple classes.

The net effect: the photo grid image will show more of its content instead of being heavily cropped, while all other slides remain unchanged.
