

## Fix Grey Space Around First Hero Image

### Root Cause
CSS `scale-[0.5]` shrinks the entire `<img>` element to 50% of its rendered size. While `object-cover` fills the image element itself, the element is now only half the size of its parent container -- leaving grey/background gaps on all sides. `scale` does not "zoom out" the image content within its frame; it shrinks the whole frame.

### Solution
Remove `scale-[0.5]` entirely. The uploaded image is portrait-oriented, which naturally fits the tall hero containers (85vh on mobile, full-height on desktop) with minimal cropping when using `object-cover object-center`.

### Changes (1 file)

**`src/components/home/SplitHero.tsx`** -- line 203

Change:
```tsx
return "object-cover object-center scale-[0.5]";
```
To:
```tsx
return "object-cover object-center";
```

### Why This Is Correct
- The image is portrait (tall) and the hero container is also tall -- `object-cover` will fill it with only slight left/right cropping on desktop (where the container is wider than tall).
- On mobile, the container is also portrait, so cropping will be minimal on all sides.
- There is no CSS-only way to "zoom out" an `object-cover` image without leaving empty space -- `object-cover` by definition crops to fill. The only way to show more of the image is to better match the container's aspect ratio to the image's aspect ratio, which is already the case here.

