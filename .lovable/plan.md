
Goal (what you’ll get)
- A site-wide, mobile-only sticky action bar that makes “Request Quote” the primary action.
- A secondary “Text / Message” action for immediate contact.
- No conflicts with the mobile quote wizard (which already has its own sticky navigation) and no overlap with admin pages.

What “best way to think about mobile features” means in this codebase
1) Treat mobile actions as a reusable system component (not page-by-page tweaks)
   - If we add call/text/top/email in 10 places, it will drift and break consistency.
   - Instead: one Mobile Action Bar component that:
     - Knows when it should show (route + device)
     - Reserves space so it never covers content
     - Uses the same phone/email values everywhere
2) Prioritize by user intent
   - On mobile, the main user intent is usually “start the quote” (conversion).
   - Secondary intent is “quick contact” (text).
   - Everything else (scroll-to-top, email) can be optional later or behind a menu if needed.
3) Avoid UI collisions
   - Your quote wizard on mobile already has a sticky bottom navigation (`SinglePageQuoteForm`).
   - So we must hide the site-wide action bar on those “fullscreen wizard” routes to prevent double sticky bars.

Decisions you already made (we’ll implement exactly this)
- Placement: Site-wide mobile
- UI: Sticky bottom bar
- Primary: Request Quote
- Secondary: Text / Message

Implementation design

A) Add a dedicated component: `MobileActionBar`
Responsibilities:
- Show only on mobile (`useIsMobile()`).
- Hide on:
  - Admin routes (`/admin...`)
  - Mobile quote wizard routes (`/request-quote/regular` and `/request-quote/wedding` when the wizard runs fullscreen on mobile)
  - Any other full-viewport routes you don’t want covered (we’ll start with the above; can extend later).
- Render two large, thumb-friendly buttons:
  - Primary: “Request Quote” → navigates to `/request-quote`
  - Secondary: “Text Us” → `sms:8439700265`
- Use safe-area padding for iPhone bottom inset:
  - `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`
- Use strong contrast and minimum tap size (≥ 44px height).

Where it will be rendered:
- In `AppContent` (in `src/App.tsx`), near the bottom of the app layout so it’s truly site-wide:
  - Ideally after `<main>` and before footer/install banner, or just above them.
  - Important: it should still show on pages that have a footer; it will float above the footer when you scroll to the bottom.

B) Reserve space so content isn’t covered
- When the action bar is visible, we’ll add bottom padding to the main content container.
- Best practice in this app (you already use safe-area math in the wizard):
  - Add `pb-[calc(5rem+env(safe-area-inset-bottom))]` (tunable) to the `<main>` element only when the bar is visible.
- This prevents “Submit” buttons, text areas, and bottom content from being hidden behind the sticky bar.

C) Make “Request Quote” the main CTA consistently (small CTA hierarchy fix)
Even with a site-wide bar, it’s worth making the Thank You screen align with the same priority:
- In `src/components/quote/alternative-form/SuccessStep.tsx`, update the final button row so:
  - Primary button: “Request Quote” (goes to `/request-quote`) with the strongest variant.
  - Secondary: “Return to Home” (outline/secondary).
- Rename “Submit Another Quote” to “Request Quote” (simpler, clearer, consistent with your site-wide CTA language).

(We will keep the existing email/phone links inside the “Need to Reach Us?” section as informational, since the sticky bar is now the fast action area.)

D) Accessibility + UX details (mobile-first)
- Buttons:
  - Must remain keyboard accessible (tab order) and screen-reader clear labels.
  - Use explicit text (not icon-only) to avoid ambiguity.
- Visual:
  - Use a slightly translucent background with blur (like other sticky surfaces in your app) but keep enough opacity to meet contrast.
  - Add `border-t` so it reads as a separate layer.
- Behavior:
  - The bar is always visible while scrolling (sticky fixed).
  - It does not animate excessively (avoid distracting “bouncing” CTAs).

Files we will read/update (expected)
- Add new:
  - `src/components/mobile/MobileActionBar.tsx` (or similar existing components folder pattern; we’ll match your conventions)
- Update:
  - `src/App.tsx` (render the bar + add conditional bottom padding)
  - `src/components/quote/alternative-form/SuccessStep.tsx` (CTA priority change at the bottom)

Route/visibility logic (clear rules)
- Show MobileActionBar when:
  - `useIsMobile() === true`
  - `pathname` does NOT start with `/admin`
  - `pathname` is NOT `/request-quote/regular` or `/request-quote/wedding` (mobile wizard routes)
- Optional follow-up (not required now): hide on `/install` if you prefer that screen to stay clean.

Acceptance checklist (what you’ll verify in preview1)
1) On any normal page on mobile (Home, About, Menu, Request Quote landing, Thank You):
   - Sticky bar shows at bottom with “Request Quote” + “Text Us”.
   - Content can scroll fully without being covered.
2) On mobile quote wizard pages (`/request-quote/regular`, `/request-quote/wedding`):
   - Sticky bar does NOT show (no double sticky footers).
3) On admin pages:
   - Sticky bar does NOT show.
4) On the Thank You page:
   - The primary on-page CTA becomes “Request Quote”, aligning with your conversion goal.

Optional phase 2 (if you want the “scroll to top or email” later)
- Convert the secondary button into a small “More” menu (bottom sheet using your existing Radix/Vaul stack) with:
  - Text Us
  - Email Us
  - Scroll to Top
This keeps the main bar simple while still supporting all actions.

Implementation order (safe sequencing)
1) Create `MobileActionBar` component with correct styling + links.
2) Wire it into `App.tsx` with visibility logic and main padding adjustment.
3) Update `SuccessStep` CTA buttons to prioritize “Request Quote”.
4) Quick mobile verification on:
   - `/request-quote/thank-you?...`
   - `/request-quote`
   - `/request-quote/regular` (ensure hidden)
   - `/` and `/menu`
