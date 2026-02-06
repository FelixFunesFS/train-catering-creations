

## Fix First Hero Image — No Crop, No Gaps

### The Core Problem
The chef photo is portrait (~3:4). The desktop hero container is nearly square/landscape (~1.07:1). CSS can either crop the image to fill (`object-cover`) or show the full image with side gaps (`object-contain`). There is no CSS setting that does both simultaneously.

### Recommended Solution: Blurred Background Fill
Show the full image at its natural size with a blurred, darkened copy of itself behind it filling the container edges. This is the same technique used by YouTube, Instagram, and TikTok for vertical content in horizontal frames.

- Full chef + hog scene is visible, no cropping
- No black bars or background color showing
- Looks intentional and polished
- Only applies to the first slide; other slides keep `object-cover`

### Technical Changes

**`src/components/home/SplitHero.tsx`**

1. Update `getImageClasses` for index 0 to return `"object-contain object-center relative z-10"` (layered above the blurred background).

2. For both mobile and desktop `OptimizedImage` blocks, wrap the first slide in a container that includes a second `<img>` behind it acting as the blurred fill:

```text
+------------------------------------------+
|  [Blurred + darkened copy of image]      |  <-- fills entire container
|     +----------------------------+       |
|     | [Sharp, full image]        |       |  <-- object-contain, centered
|     |  Chef face visible         |       |
|     |  Hog visible               |       |
|     +----------------------------+       |
+------------------------------------------+
```

3. The blurred background layer uses: `object-cover`, `filter: blur(20px)`, `scale(1.1)` (to avoid blur edge artifacts), and `brightness(0.4)` to darken.

4. This only activates for `currentIndex === 0`. All other slides remain unchanged.

### Alternative: Container Resize (simpler but changes layout)
If the blurred-fill approach feels too complex, we can instead make the first slide's image area taller (full viewport height with a narrower width constraint) so the container aspect ratio matches the portrait image. This avoids both cropping and gaps but slightly alters the desktop hero layout for the first slide only.

### Mobile Impact
On mobile, the container is already portrait-shaped (85vh tall, full width), so the image naturally fills with minimal or no visible background. The blurred fill layer would still be present but essentially invisible since there are no gaps to fill.

