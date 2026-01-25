

# Service Cards Cleanup + Link Audit + Code Hygiene

## Summary

The home page currently displays **3 service cards** in `ServiceCategoriesSection.tsx` (Wedding, Corporate, Family Gatherings), but there's an **entirely unused** `ServicesSection.tsx` with 4 cards (1 featured + 3 supporting) that was never deleted. Additionally, the "Need Something Custom?" CTA at the bottom is redundant since all 3 cards already have "Get Quote" buttons.

---

## Part 1: Files to Delete (Unused Components)

### Service Section Components (4 files)

These components are NOT imported anywhere in the codebase:

| File | Status | Reason |
|------|--------|--------|
| `src/components/home/ServicesSection.tsx` | UNUSED | Not imported by HomePage or any other file |
| `src/components/home/FeaturedServiceCard.tsx` | UNUSED | Only used by ServicesSection.tsx (which is unused) |
| `src/components/home/SupportingServiceCard.tsx` | UNUSED | Only used by ServicesSection.tsx (which is unused) |

### Other Unused Home Components (10 files)

These components exist but have no imports:

| File | Status |
|------|--------|
| `src/components/home/HeroSection.tsx` | UNUSED |
| `src/components/home/ModernHero.tsx` | UNUSED |
| `src/components/home/SplitScreenHero.tsx` | UNUSED |
| `src/components/home/StoryHero.tsx` | UNUSED |
| `src/components/home/InteractiveGallerySection.tsx` | UNUSED |
| `src/components/home/SignatureDishesSection.tsx` | UNUSED |
| `src/components/home/ServiceMarquee.tsx` | UNUSED |
| `src/components/home/TestimonialsStatsSection.tsx` | UNUSED |
| `src/components/home/MobileTaglineSection.tsx` | UNUSED |
| `src/components/home/alternative/` directory (2 files) | UNUSED |

**Note**: `TrustMarquee.tsx` is used by `About.tsx` - keep it.

### Total: 14 files to delete

---

## Part 2: Remove Redundant CTA

The `ServiceCategoriesSection.tsx` has a "Need Something Custom?" CTA card at the bottom that duplicates what the 3 service card buttons already do.

**Current flow**:
```text
Wedding Card → "Get Quote" → /request-quote/wedding
Corporate Card → "Get Quote" → /request-quote/regular  
Family Card → "Get Quote" → /request-quote/regular
────────────────────────────────────────────────────
"Need Something Custom?" → /request-quote ← REDUNDANT
```

**Recommendation**: Remove the bottom CTA card (lines 182-199 in ServiceCategoriesSection.tsx) since all three service cards already provide clear quote paths.

---

## Part 3: Broken Links to Fix

### Footer Link Issue

| Link | Problem | Fix |
|------|---------|-----|
| `/menu?style=wedding` | SimplifiedMenu.tsx does NOT read URL query params | Either add URL param support OR change link to `/menu` |

**Recommended Fix**: Update SimplifiedMenu.tsx to read the `style` query param and set initial state accordingly. This allows deep-linking to the wedding menu from any external source.

### Instagram Link Placeholder

| Current | Issue |
|---------|-------|
| `href="#"` in Footer.tsx | Non-functional Instagram link |

**Fix**: Either add real Instagram URL or remove the icon until available.

---

## Part 4: Routing Verification

### Active Routes (Keep)

| Route | Component | Status |
|-------|-----------|--------|
| `/` | Index → HomePage | Active, correct |
| `/about` | About | Active |
| `/menu` | SimplifiedMenu | Active |
| `/wedding-menu` | Redirect → `/menu` | Legacy support, keep |
| `/gallery` | AlternativeGallery | Active |
| `/reviews` | Reviews | Active |
| `/faq` | FAQ | Active |
| `/request-quote` | RequestQuote | Active |
| `/request-quote/regular` | RegularEventQuote | Active |
| `/request-quote/wedding` | WeddingEventQuote | Active |
| `/request-quote/thank-you` | QuoteThankYou | Active |
| `/privacy-policy` | PrivacyPolicy | Active |
| `/terms-conditions` | TermsConditions | Active |
| `/install` | Install | Active |

### Home Page Confirmation

There is only ONE home page:
- `src/pages/Index.tsx` renders `HomePage` component
- `src/pages/HomePage.tsx` is the actual home page content
- Route `/` correctly maps to Index

---

## Part 5: Sitemap & Robots.txt Updates

### Sitemap Issues

| URL | Status | Action |
|-----|--------|--------|
| `/wedding-menu` | Redirects to `/menu` | Remove from sitemap (redundant) |
| `/faq` | Active route | Add to sitemap (missing) |
| `/gallery` | Listed | Keep |
| `/install` | PWA route | Do not index |

### Robots.txt Enhancement

Current robots.txt lacks sitemap reference:

```text
# Current
User-agent: *
Allow: /

# Recommended addition
Sitemap: https://soultrainseatery.com/sitemap.xml

# Disallow patterns
Disallow: /admin
Disallow: /admin/*
Disallow: /customer-portal
Disallow: /customer/*
Disallow: /estimate
Disallow: /estimate-preview
Disallow: /invoice/*
Disallow: /approve
Disallow: /approve-estimate
Disallow: /payment-success
Disallow: /payment-canceled
Disallow: /install
```

---

## Implementation Steps

### Step 1: Delete Unused Components (14 files)

```text
src/components/home/ServicesSection.tsx
src/components/home/FeaturedServiceCard.tsx
src/components/home/SupportingServiceCard.tsx
src/components/home/HeroSection.tsx
src/components/home/ModernHero.tsx
src/components/home/SplitScreenHero.tsx
src/components/home/StoryHero.tsx
src/components/home/InteractiveGallerySection.tsx
src/components/home/SignatureDishesSection.tsx
src/components/home/ServiceMarquee.tsx
src/components/home/TestimonialsStatsSection.tsx
src/components/home/MobileTaglineSection.tsx
src/components/home/alternative/MobileFirstHero.tsx
src/components/home/alternative/VisualStoryGallery.tsx
```

### Step 2: Update ServiceCategoriesSection.tsx

Remove the redundant "Need Something Custom?" CTA card (lines 182-199).

### Step 3: Fix Footer Wedding Link

Update line 16 in Footer.tsx:
```tsx
// Change from:
href: "/menu?style=wedding"
// To:
href: "/menu"
// OR add query param support to SimplifiedMenu.tsx
```

### Step 4: Add URL Param Support to SimplifiedMenu

Add `useSearchParams` hook to read initial menu style from URL:

```tsx
import { useSearchParams } from "react-router-dom";

const SimplifiedMenu = () => {
  const [searchParams] = useSearchParams();
  const initialStyle = searchParams.get('style') === 'wedding' ? 'wedding' : 'regular';
  const [menuStyle, setMenuStyle] = useState<'regular' | 'wedding'>(initialStyle);
  // ...
};
```

### Step 5: Update Sitemap

- Remove `/wedding-menu` entry
- Add `/faq` entry
- Update `lastmod` dates to current

### Step 6: Update Robots.txt

Add sitemap reference and disallow patterns for admin/customer routes.

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Delete unused components | Low | No imports found, no runtime impact |
| Remove bottom CTA | Low | Tested that 3 card buttons provide full coverage |
| Fix footer link | Low | Simple href update |
| Update robots.txt | Low | Only affects crawlers, not users |
| Update sitemap | Low | Improves SEO, no functional impact |

---

## Summary of Changes

| Category | Count | Action |
|----------|-------|--------|
| Files to delete | 14 | Remove unused home components |
| Files to edit | 4 | ServiceCategoriesSection, Footer, SimplifiedMenu, robots.txt |
| Sitemap entries | 2 | Remove 1, add 1 |

This cleanup reduces bundle size, eliminates dead code, and fixes broken links without affecting current functionality.

