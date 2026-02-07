

## Adjust Last Hero Image Position (Mobile)

### Change

Shift the last image (event space) focal point 20% to the right on mobile by changing `object-left` to `object-[20%_center]`.

### Technical Detail

**File: `src/components/home/SplitHero.tsx`**

In the `getImageClasses` function, update the mobile-specific case for the last image (around line 215):

- **From**: `"object-cover object-left"`
- **To**: `"object-cover object-[20%_center]"`

This shifts the visible portion 20% rightward from the left edge while keeping desktop rendering unchanged.

