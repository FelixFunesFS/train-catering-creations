
Goal
- Streamline `/request-quote` so customers make the “Regular vs Wedding/Black Tie” choice quickly with minimal scrolling and no duplicate messaging.
- Per your choices: use a shorter, single hero at the top; keep the one bottom “Questions?” CTASection.

What “simple UX” looks like for this page
- One clear headline + 1–2 sentence intro that explains what happens next.
- Immediately followed by the two choice cards (no second header competing for attention).
- Each card answers:
  - “Is this for my type of event?”
  - “What happens when I click?” (clear CTA button text)
- One consistent support CTA at the bottom (already present via CTASection), not repeated inside the selector area.

Recommended structure (final page flow)
1) Single consolidated hero (top)
   - Headline: short, confident, action-oriented.
   - Intro text: 1–2 sentences that includes “Choose your event type to start your quote.”
   - Optional tiny “Step 1” helper line (small text) to set expectation.
2) Event type choice cards (immediately below hero)
   - No additional “Choose Your Event Type” H2 (remove it to eliminate duplication).
   - Keep the two cards as-is (they’re already strong).
3) Bottom CTASection (keep)
   - Your existing “Questions About Your Quote?” CTASection remains the only call/email block on this page.

Implementation approach (minimal, low-risk refactor)
We’ll avoid creating new components and instead adjust the two existing ones to consolidate cleanly.

A) Update QuoteFormSelector to be “cards-only” on the RequestQuote landing page
- Change `src/components/quote/QuoteFormSelector.tsx`:
  1. Remove the top title/description block (“Choose Your Event Type” + paragraph) OR make it optional via a prop.
     - Best pattern: add a prop `showHeader?: boolean` defaulting to `true`.
     - For `/request-quote`, we’ll render it with `showHeader={false}`.
  2. Keep spacing tight and intentional:
     - When header is hidden, the selector should start with the grid and a top margin of `mt-6` (or `mt-8` on desktop) so it breathes but doesn’t feel like a second section.
  3. Clean up unused imports:
     - `Sparkles` is no longer used (already removed UI), so we’ll remove it from imports.

B) Replace the two separate stacked sections on RequestQuote with one consolidated “hero + cards” section
- Change `src/pages/RequestQuote.tsx`:
  1. Combine the current “Header Section” and “Form Selector Section” into a single section wrapper so it feels like one coherent block.
     - Example layout structure (conceptually):
       - `<section>` with max-width container
         - Hero (QuoteHeader, updated copy for “shorter hero”)
         - Selector cards directly below (QuoteFormSelector with header hidden)
  2. Keep animations but reduce “two separate section” feel:
     - Option 1 (cleanest): one animation wrapper for the combined hero+selector block.
     - Option 2 (still fine): keep separate animations but remove the separate section padding blocks; use internal spacing instead.
  3. Adjust vertical spacing:
     - Replace two `py-8 lg:py-12` sections with one `py-10 lg:py-14` (or similar) and internal spacing like `mt-8`.
     - This reduces scroll length and visually communicates a single task: choose event type.
  4. Leave the bottom `CTASection` intact (per your preference).

C) Shorten and align hero copy to the decision task
- Change `src/components/quote/QuoteHeader.tsx` (copy only; structure stays the same):
  - Keep the strong brand tone, but make it shorter and decision-forward.
  - Ensure the description explicitly points to the next action:
    - “Choose your event type to start your quote…”
  - Keep icons cluster (it’s a nice brand cue and doesn’t add cognitive load).

UX copy example (for alignment; we’ll implement after you approve)
- Title: “Request a Catering Quote”
- Description: “Tell us a few details and we’ll build a custom catering quote for your event. Start by choosing your event type below.”

Edge cases / details we’ll watch
- Mobile-first spacing:
  - Ensure headline doesn’t push cards too far down on small phones.
  - Keep the cards’ CTAs above the fold when possible.
- Accessibility:
  - Maintain a single clear H1 (PageHeader already renders H1).
  - Avoid a redundant H2 immediately after; if we keep any label like “Choose your event type,” we’ll render it as a smaller paragraph or visually subtle heading, not a competing hero.
- Consistency:
  - No duplicate call/email cards inside the selector area (already removed).
  - One support CTA at bottom (CTASection).

Files that will be edited
- `src/pages/RequestQuote.tsx`
- `src/components/quote/QuoteFormSelector.tsx`
- `src/components/quote/QuoteHeader.tsx`

Acceptance criteria (what you’ll see in the preview)
- On `/request-quote`, the top reads as one unified section (not two stacked “headers”).
- The “Choose Your Event Type” header is no longer duplicated; customers go from intro directly into the two choice cards.
- The bottom “Questions About Your Quote?” CTASection remains (single instance).
- Spacing looks intentional on mobile and desktop (no awkward gap where the removed header used to be).
