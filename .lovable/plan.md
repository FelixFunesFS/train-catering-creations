## Problem

The 8 local SEO pages (`/catering/weddings`, `/catering/corporate`, `/catering/military`, `/catering/private-events`, `/catering/holidays`, `/catering-charleston/mount-pleasant`, `/catering-charleston/daniel-island`, `/catering-charleston/downtown-charleston`) currently have **zero imagery**. The hero is a flat gradient, the highlights are icon-only cards, and there is no food/event photography anywhere.

For a catering brand that sells on visual appetite appeal, this is a major UX and SEO miss:

- No visual proof of food quality or event execution
- Hero feels generic and template-like, hurts time-on-page and bounce rate
- Missing `og:image` for social shares (Facebook, LinkedIn, iMessage previews look broken)
- Missing image alt text and `ImageObject` structured data for image SEO
- No emotional pull — copy alone cannot sell a wedding caterer

## What we already have

Plenty of high-quality imagery exists in the project (gallery system):
- `weddingImages` — reception tables, garden weddings, barn venues, sweets
- `buffetImages` — buffet setups, chefs in action, team service, holiday spreads
- `formalImages` — gold/white reception, orchid buffet, ballroom service
- `dessertImages`, plus team photos (`tanya-ward.png`, `team-western-buffet.jpg`)

We can reuse these directly — no new uploads needed.

## Plan: add a complete visual layer to `LocalSEOPage`

### 1. Hero gets a real photo with overlay

Replace the empty gradient hero with a full-bleed background image + dark gradient scrim so headline stays readable.
- Each page picks 1 hero image relevant to its topic (wedding photo for weddings, corporate buffet for corporate, etc.)
- Mobile-first: image stays sharp, headline is high-contrast, CTAs above the fold
- Add `loading="eager"` + `fetchpriority="high"` only on hero (LCP optimization)

### 2. Add a "Visual proof" gallery strip

New section between **Highlights** and **Local Proof**:
- 3-image asymmetric grid (1 large + 2 stacked on desktop, single column on mobile)
- Pulls 3 curated images per page from existing gallery data
- Subtle hover zoom, rounded corners, captions hidden visually but present in `alt` for SEO

### 3. Highlights cards get optional accent imagery

Keep icon design, but add a small thumbnail option for the first card (the "hero highlight") to break up the icon grid visually. Optional per page so location pages can stay text-dense.

### 4. Testimonials get author avatar/photo placeholder

Small circular photo (or initials badge fallback) next to author name — adds human warmth.

### 5. Final CTA section gets a soft food image background

Subtle background photo at low opacity behind the "Let's Plan Something Unforgettable" CTA — keeps the warm Southern hospitality vibe through to the bottom of the page.

### 6. SEO image hardening

- Every image gets descriptive, keyword-aware `alt` text (e.g. "Soul-food buffet served at a Mount Pleasant wedding")
- Add `og:image` to `useDocumentHead` per page (uses the hero image)
- Add `ImageObject` entries to the `buildSeoSchema` JSON-LD output
- Add `width`/`height` attributes to prevent CLS

## Technical changes

**Type updates** (`src/data/seoPages/types.ts`):
- Add `heroImage: string` (required), `heroImageAlt: string`
- Add `gallery: { src: string; alt: string }[]` (3 items each)
- Add optional `ctaBackgroundImage?: string`
- Add optional `avatar?: string` to `SeoTestimonial`

**Data updates** (`src/data/seoPages/pages.ts`):
- Import the relevant gallery images
- Wire each of the 8 pages to topic-appropriate photography:
  - **weddings** → wedding reception + garden wedding + sweets
  - **corporate** → buffet line + team service + boxed-style spread
  - **military** → formal/ceremonial buffet + team service + sides
  - **private-events** → family buffet + outdoor tent + dessert
  - **holidays** → holiday wings + holiday sides + breakfast/family spread
  - **mount-pleasant** → wedding/outdoor tent imagery
  - **daniel-island** → formal reception + buffet
  - **downtown-charleston** → formal/elegant downtown-feel imagery

**Component updates** (`src/components/seo/LocalSEOPage.tsx`):
- Hero: full-bleed `<img>` with gradient overlay (`bg-gradient-to-r from-background/95 via-background/80 to-background/40`)
- New `<GalleryStrip>` section between highlights and local proof
- Testimonial figure gets avatar/initials circle
- Final CTA gets background image at `opacity-10`
- All images use `loading="lazy"` except hero

**Hook update** (`src/hooks/useDocumentHead.ts`):
- Add `ogImage` prop, render `<meta property="og:image">` and `<meta name="twitter:image">`

**Schema update** (`src/data/seoPages/schema.ts`):
- Include `image` field in the JSON-LD using hero + gallery URLs

## Visual style / brand alignment

- Stays consistent with existing brand: warm tones, `font-elegant` headings, primary red accents
- No new colors or new components — reuses existing tokens
- Image treatment is editorial (rounded-xl, subtle shadows, overlay scrims) — not stocky/templated
- Mobile-first: hero image scales properly, gallery collapses to single column, no horizontal scroll

## Out of scope

- No new image uploads or photo shoots
- No carousel/lightbox JS (keeps pages light and fast)
- No changes to existing gallery pages, FAQ page, or other routes

Reply **approved** to implement.