

## Zoom Out First Hero Image with No Empty Space

### Problem
The first hero image is too zoomed in, but using `object-contain` would leave empty black bars.

### Solution
Use `object-cover` (already the default) combined with `scale-[0.7]` to visually zoom out the image while keeping the container fully filled -- no letterboxing, no empty space.

### Changes (1 file)

**`src/components/home/SplitHero.tsx`** (line 201)

Update `getImageClasses` for index 0:

```tsx
// Before
return "object-[center_30%]";

// After
return "object-cover object-center scale-[0.7]";
```

This scales the image down to 70% within its container while `object-cover` ensures it still fills the entire area. The result: more of the image is visible without any empty space.

