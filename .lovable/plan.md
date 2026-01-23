
Goal
- Make all user input fields (inputs, selects, date/time pickers, textareas) feel clearly “fillable” with stronger visual contrast, while staying accessible (WCAG-friendly) and consistent across mobile/desktop for both Regular and Wedding quote flows.

What’s causing the “blends in” issue (current state)
- Most form controls use `bg-background` (pure white) and `border-input`, where `--input` is currently set to a very light gray (`220 14% 96%`). On a vibrant white page, that border and fill are too close to the background.
- The current `.input-clean` utility explicitly removes shadows and only changes border color slightly on hover/focus. It doesn’t add a visible focus ring, so keyboard/touch focus states can feel subtle.
- Select triggers use Radix + `SelectTrigger` styling; in steps they also add `input-clean`, but the underlying trigger currently lacks a strong focus-visible ring and relies mainly on border changes.

Best way to think about it (design system approach)
1) Define a single “form control surface” style and apply it everywhere
   - Inputs/selects/textarea/date/time should share:
     - A slightly tinted background (not pure white) so the control is visually distinct.
     - A more visible default border.
     - A very clear focus state (ring + border) that works in light and dark modes.
2) Use tokens + 1 utility class to avoid chasing styles in every form step
   - Update the global CSS variables (`--input`, `--border`) and the `.input-clean` utility so every place that already uses `input-clean` improves instantly.
   - Add focus-visible ring styles to the shared UI primitives (`Input`, `Textarea`, `SelectTrigger`) so controls remain accessible even if a step forgets `input-clean`.
3) Validate on the toughest screens first
   - Test on mobile (small width) and in dark mode:
     - Are fields clearly visible without scrolling zoom issues?
     - Is focus state obvious?
     - Do dropdowns remain opaque with sufficient z-index?

Scope (what will change)
A) Strengthen design tokens for form borders/surfaces
- Update `src/index.css` tokens (light + dark):
  - Make `--input` darker than it is now (used for borders via `border-input`), so the outline reads against white.
  - Optionally nudge `--border` slightly darker as well to keep consistent hierarchy.
  - Ensure dark mode tokens remain balanced (don’t over-brighten borders).

B) Make `.input-clean` actually “prominent” (without looking heavy)
- Update `.input-clean` in `src/index.css` to:
  - Use a subtle tinted fill (e.g., `bg-secondary/40` or `bg-muted/30`) instead of pure white, so fields are distinct from the page.
  - Use a clearer default border (still `border-input` but now with improved token values).
  - Add an accessible focus ring using existing tokens:
    - `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`
  - Keep hover/focus transitions smooth and consistent.

C) Add consistent focus-visible styles directly to the UI primitives
Even with `.input-clean`, controls should be accessible by default.
- Update:
  - `src/components/ui/input.tsx`
  - `src/components/ui/textarea.tsx`
  - `src/components/ui/select.tsx` (at least `SelectTrigger`)
to include:
  - `focus-visible` ring styles (not just border color changes)
  - Consistent border treatment (avoid “invisible” outline)
This ensures any input used outside the quote flow still looks correct.

D) Align “picker” controls with the same field styling
- `src/components/ui/date-picker.tsx` currently uses `<Button variant="outline" ... input-clean>`.
  - Change to use a button variant intended for input-like appearance (your `Button` already has `variant="input"`).
  - Keep `input-clean` (or updated `.input-clean`) so DatePicker matches other fields.
- Ensure `TimeSelect` remains consistent (it uses `SelectTrigger` + `input-clean` already; it will benefit automatically once SelectTrigger + `.input-clean` are improved).

E) Quick audit pass over quote steps to remove any “one-off” field styling
- Verify these files don’t override new styles with extra `bg-background`/`border-muted` combos that reduce contrast:
  - `src/components/quote/steps/ContactInfoStep.tsx`
  - `src/components/quote/steps/EventDetailsStep.tsx`
  - `src/components/quote/steps/SuppliesStep.tsx`
  - `src/components/quote/alternative-form/ContactAndEventStep.tsx`
  - `src/components/quote/alternative-form/FinalStep.tsx`
  - `src/components/quote/alternative-form/ServiceSelectionStep.tsx`
  - `src/components/quote/alternative-form/MenuSelectionStep.tsx`
(Expectation: minimal/no changes needed because most already use `input-clean`; we’ll just ensure nothing is fighting it.)

Quality / acceptance checks
- Visual:
  - Inputs and textareas are visibly distinct from the page background (especially “Special Requests”).
  - Select triggers look like real fields, not flat text.
- Accessibility:
  - Focus states are clearly visible with keyboard navigation (Tab/Shift+Tab) on all field types.
  - Dropdown content remains opaque (not see-through) and above other UI (z-index).
- Responsiveness:
  - On small mobile screens, fields remain readable, with sufficient hit area and no clipped rings.
  - On desktop, the new contrast doesn’t look “too heavy (boxed in)”.

Files to be edited (implementation)
- Global tokens + shared utility class:
  - `src/index.css`
- Field primitives:
  - `src/components/ui/input.tsx`
  - `src/components/ui/textarea.tsx`
  - `src/components/ui/select.tsx`
- Picker alignment:
  - `src/components/ui/date-picker.tsx`

Implementation sequence (safe and fast)
1) Update `--input` / `--border` tokens in `src/index.css` (light + dark).
2) Update `.input-clean` styles to include subtle fill + strong focus ring.
3) Add focus-visible ring styling to `Input`, `Textarea`, and `SelectTrigger`.
4) Update `DatePicker` to use input-like button variant and ensure styling matches.
5) Manually verify on:
   - `/request-quote/regular`
   - `/request-quote/wedding`
   - mobile preview sizes + dark mode toggle

Notes (to keep brand polish)
- Keep the “vibrant white” theme by using a very subtle tinted fill (light gray) rather than a heavy border-only look.
- Use Ruby primary only for focus/active states (ring/border), not for default borders, so the page remains calm and premium.
