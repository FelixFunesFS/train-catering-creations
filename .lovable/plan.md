

## Mobile Hero Image Adjustments

Three targeted changes to the `getImageClasses` function and related markup in `SplitHero.tsx`, all scoped to mobile only.

### Changes

**1. Last image (event space) -- left-align on mobile**
Currently uses `object-cover object-center`. Will change to `object-cover object-left` when on mobile so the left side of the elegant dining setup is prioritized.

**2. 3rd image (spread with flowers) -- shift right 10% on mobile**
Currently uses `object-cover object-left-center`. Will change to `object-cover object-[40%_center]` on mobile to pan the focal point rightward, revealing more of the floral arrangements.

**3. 1st image (chef portrait) -- remove zoom effect on mobile**
The chef slide has a blurred background layer with `scale-110` that creates a zoom-in effect. This `scale-110` class will be removed so the background sits flat. The foreground `object-contain` image stays unchanged.

### Technical Detail

**File: `src/components/home/SplitHero.tsx`**

- Modify `getImageClasses` to accept a second parameter (`isMobileView: boolean`) so it can return mobile-specific object-position values:
  - `heroSpread` on mobile: `"object-cover object-[40%_center]"` (instead of `object-left-center`)
  - Last image on mobile: `"object-cover object-left"` (instead of `object-center`)
  - Chef image stays the same (`object-contain object-center`)

- In the mobile layout JSX (around line 248), remove `scale-110` from the blurred background `<img>` tag for the chef slide, changing it from `scale-110 blur-xl` to just `blur-xl`.

- Pass `isMobile` into `getImageClasses` calls in both the mobile and desktop render paths (desktop always passes `false`).

No other files are affected. Desktop rendering is completely unchanged.
