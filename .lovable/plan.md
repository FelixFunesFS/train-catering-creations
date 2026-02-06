

## Replace First Hero Image and Display with Minimal Cropping

### Problem
The current first hero image is being cropped too aggressively due to the `scale-[0.7]` transform combined with `object-cover`. You want this new chef image to fill the hero section with no more than ~5% cropping on any side.

### Changes (2 steps)

**Step 1: Replace the image file**
- Copy the uploaded image (`user-uploads://image000000_PhotoGrid-2.png`) to `public/lovable-uploads/hero-chef-serving.png`, replacing the existing file.

**Step 2: Update `src/components/home/SplitHero.tsx`**
- Change `getImageClasses` for index 0 from `"object-cover object-center scale-[0.7]"` back to `"object-cover object-center"` (remove the scale transform).
- This new image is portrait-oriented, which naturally fits the tall mobile hero container (85vh) with minimal cropping. On desktop (60% width split), the image will center on the chef with slight left/right cropping -- well within the 5% threshold since the subject is centered.

### Why This Works
- The previous image was landscape (wide), so it got heavily cropped in the tall container. This new image is portrait (tall), matching the container shape much better.
- No scale transform needed -- `object-cover object-center` will fill the space while keeping the chef and food centered with minimal cropping.

