

## Fix First Hero Image — Replace with Full Chef Photo

### Problem
The current `hero-chef-serving.png` is a cropped version that cuts off the chef's face and the roasted hog he is basting. You want both fully visible.

### Solution (2 steps)

**Step 1: Replace the image file**
Copy the uploaded full photo to `public/lovable-uploads/hero-chef-serving.png`. This new image is portrait-oriented and shows the complete scene: chef's face/hat, tongs, and the entire roasted hog spread below.

**Step 2: Keep `object-center` positioning**
In `src/components/home/SplitHero.tsx`, keep the current `object-cover object-center` for index 0 (no position shift needed).

### Why `object-center` works for both face and hog
- **Mobile** (portrait container, ~85vh tall): The container shape closely matches the portrait image. Both the chef at the top and the hog at the bottom will be visible with only minor left/right cropping. No vertical content is lost.
- **Desktop** (60% width, full height): The container is wider relative to height, so the image gets slight left/right cropping to fill, but the full vertical span (face through hog) remains visible since the container is full viewport height.

### What changed from the previous plan
- Removed `object-[center_30%]` -- that would have shifted focus upward, cropping the hog at the bottom. Standard `object-center` keeps both the face and hog in frame since the new source image is properly framed with both subjects centered vertically.

