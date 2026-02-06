

## Zoom Out First Hero Image by 50%

### Problem
The first hero image needs to be zoomed out to show more of the image content while still filling the container.

### Solution
Add `scale-[0.5]` to the first image's classes. This scales the image to 50% of its rendered size, effectively "zooming out" by 50%. Combined with `object-cover`, the container remains fully filled with no empty space.

### Changes (1 file)

**`src/components/home/SplitHero.tsx`** (line 202)

```tsx
// Before
return "object-cover object-center";

// After
return "object-cover object-center scale-[0.5]";
```

This only affects the first hero slide; all other images remain unchanged.

