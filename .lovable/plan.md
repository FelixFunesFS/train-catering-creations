

# Fix Scroll-Past-Navbar Issue on Non-Quote Pages

## Problem Identified

The site is incorrectly scrolling past the navigation bar directly to the main content on About, Menu, Reviews, Quote selector, and FAQ pages. This behavior should only occur on the quote wizard pages (`/request-quote/regular` and `/request-quote/wedding`).

## Root Cause Analysis

### How the Current System Works:

1. **Navigation links include `#page-header` hash:**
   - Header.tsx navigation uses links like `/about#page-header`, `/menu#page-header`
   - CTA buttons across the site link to `/request-quote#page-header`

2. **`useScrollToAnchor` hook triggers on every page:**
   - Located in `src/hooks/useScrollToAnchor.tsx`
   - Detects the `#page-header` hash and scrolls to that element
   - Runs on `location.pathname` and `location.hash` changes

3. **`PageHeader` component has `id="page-header"`:**
   - Located in `src/components/ui/page-header.tsx` (line 28)
   - Every page using this component gets scrolled to when `#page-header` is in the URL

### Result:
When users navigate to any page with `#page-header` in the URL, they skip the top of the page (including any visual hero or spacing) and jump directly to the page header content.

---

## Solution

Remove the `#page-header` hash from all navigation links EXCEPT for the quote pages. The hash-based scrolling should only be used intentionally for:
- Deep linking within a page
- Quote forms where focused entry is desired

### Affected Files:

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Remove `#page-header` from nav links |
| `src/pages/About.tsx` | Remove `#page-header` from CTA links |
| `src/pages/Reviews.tsx` | Remove `#page-header` from button links |
| `src/pages/FAQ.tsx` | Remove `#page-header` from button links |
| `src/components/home/SplitHero.tsx` | Remove `#page-header` from non-quote links |
| `src/components/home/StoryHero.tsx` | Remove `#page-header` from non-quote links |
| `src/components/home/ModernHero.tsx` | Remove `#page-header` from non-quote links |
| `src/components/wedding/WeddingMenuSplitHero.tsx` | Remove `#page-header` from non-quote links |
| `src/components/wedding/QuickActionButton.tsx` | Keep for quote link |
| Various other components | Audit and update |

---

## Detailed Changes

### Change 1: Header.tsx - Navigation Links

**Current (lines 18-35):**
```tsx
href: "/about#page-header"
href: "/menu#page-header"
href: "/wedding-menu#page-header"
href: "/reviews#page-header"
```

**Proposed:**
```tsx
href: "/about"
href: "/menu"
href: "/wedding-menu"
href: "/reviews"
```

**Keep as-is:**
```tsx
href: "/request-quote#page-header"  // This one stays - intentional focus
```

### Change 2: About.tsx - CTA Links

**Current (line 46):**
```tsx
<Link to="/gallery#page-header">
```

**Current (lines 169-175):**
```tsx
href: "/request-quote#page-header"  // Keep - intentional
href: "/menu#page-header"           // Remove hash
```

**Proposed:**
```tsx
<Link to="/gallery">
href: "/menu"
```

### Change 3: Reviews.tsx - Button Links

**Current (line 89):**
```tsx
href: "/about#page-header"
```

**Proposed:**
```tsx
href: "/about"
```

### Change 4: FAQ.tsx - Links

**Current (lines 60, 120):**
```tsx
href: "/request-quote#page-header"  // Keep - intentional quote focus
```

These can stay as they link to the quote page.

### Change 5: Home Page Hero Components

Update gallery, menu, and about links to remove hash. Keep `/request-quote#page-header`.

**Files:**
- `src/components/home/SplitHero.tsx`
- `src/components/home/StoryHero.tsx`
- `src/components/home/ModernHero.tsx`

### Change 6: Wedding Components

**File:** `src/components/wedding/WeddingMenuSplitHero.tsx`

**Current (line 101):**
```tsx
<Link to="/gallery#page-header">
```

**Proposed:**
```tsx
<Link to="/gallery">
```

---

## Links to Keep `#page-header`

The following links should RETAIN the `#page-header` hash for intentional focused navigation:

| Link | Reason |
|------|--------|
| `/request-quote#page-header` | Quote form should start focused |
| Any deep-link to a specific section | Intentional anchor navigation |

---

## Summary of Pattern

**Remove `#page-header` from:**
- All main navigation links in Header
- All gallery, about, menu, reviews, FAQ links across CTAs
- Any link going to a page where users should see the full page from top

**Keep `#page-header` on:**
- Links to `/request-quote` (intentional focus on form)
- Any link that should deep-link to a specific section within a page

---

## Testing Checklist

After implementation, verify:

1. **About page**: Loads at top, header visible, no scroll jump
2. **Menu page**: Loads at top, header visible, no scroll jump
3. **Reviews page**: Loads at top, header visible, no scroll jump
4. **FAQ page**: Loads at top, header visible, no scroll jump
5. **Gallery page**: Loads at top, header visible, no scroll jump
6. **Request Quote page**: Still focuses on form header (intentional)
7. **Wedding Menu page**: Loads at top, hero visible
8. **All CTA buttons**: Navigate correctly without unwanted scrolling
9. **Quote form entry**: From any CTA still focuses properly

