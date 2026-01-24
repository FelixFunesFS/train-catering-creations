
Goal
- Fix the 3 “stats” cards under “What Our Clients Say” so their content (“500+”, “★ 4.9”, “98%”) is clearly readable and not “white on white”.

What’s happening (root cause)
- The shared <Card /> component always includes the class `neumorphic-card-2` (see `src/components/ui/card.tsx`).
- `neumorphic-card-2` applies `bg-gradient-to-br from-card to-muted`, which is a background-image gradient (light/white).
- Our earlier fix only set `background-color` (`!bg-white/10`), but it did not remove the existing background-image gradient, so the card still renders as a light/white surface.
- Because the numbers/labels inside the cards are `text-white`, they disappear on that light background.

Fix approach (minimal, localized)
- Keep using <Card /> but explicitly disable the neumorphic gradient background-image on those 3 stats cards.
- Add Tailwind `bg-none` (background-image: none) with `!` so it wins.
- Then apply a darker translucent background (recommended: `!bg-black/35` or `!bg-black/40`) so white text remains readable regardless of the background photo brightness.
- Keep the blur + border, and remove neumorphic shadow.

Exact file to change
- `src/components/home/TestimonialsCarousel.tsx`

Implementation details (what will be edited)
1) Update the 3 stats Card classNames (lines ~284–295)
- Current:
  - `!bg-white/10` … (but gradient still shows)
- Updated (example):
  - Add: `!bg-none` (removes gradient background-image)
  - Change background color to: `!bg-black/35` (stronger contrast)
  - Keep: `!backdrop-blur-sm !border-white/20 !shadow-none`
  - Optionally add: `ring-1 ring-white/10` for crisp separation on busy parts of the photo

Example className for each stats card
- Replace each stats card with something like:
  - `className="p-3 text-center !bg-none !bg-black/35 !backdrop-blur-md !border-white/20 !shadow-none ring-1 ring-white/10"`

2) (Optional but recommended) Add subtle text clarity helpers
- Add `drop-shadow` to the numbers and labels so they stay readable even if the background gets brighter:
  - Number: `drop-shadow-sm`
  - Label: `drop-shadow-sm`
- This is optional because the darker card background should already solve it, but it’s a safe accessibility boost.

Why this solves it
- `!bg-none` removes the neumorphic gradient (background-image) that was making the cards look white.
- A dark translucent background ensures the white text is visible in all scenarios (desktop/mobile, bright parts of the photo, etc.).

Testing checklist (after implementation)
- Home page: confirm the 3 stats cards show:
  - “500+ Events Catered”
  - “★ 4.9 Average Rating”
  - “98% Would Recommend”
- Verify on:
  - Mobile width (stack stays 3-across, readable)
  - Desktop width
- Confirm the main testimonial quote card still looks correct (white glass card) and the stats cards remain glassy/dark below it.
