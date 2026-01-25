

# Service Cards CTA Optimization + Code Cleanup Plan

## Part 1: Service Cards CTA Strategy

### Analysis of Current Links

The service cards currently link to menu pages:
- `FeaturedServiceCard` (Wedding) → `/wedding-menu#page-header`
- Black Tie Events → `/wedding-menu#page-header`
- Corporate Events → `/menu#page-header`
- Military Functions → `/wedding-menu#page-header`

### Recommendation: Conversion-Focused CTAs (No Menu Links)

After reviewing the user journey, linking directly to quote forms is the **better approach**:

| Service Card | Current Link | Recommended Link | Reasoning |
|--------------|--------------|------------------|-----------|
| **Wedding Catering** | `/wedding-menu` | `/request-quote/wedding` | Direct conversion path |
| **Black Tie Events** | `/wedding-menu` | `/request-quote/wedding` | Formal event = wedding form |
| **Corporate Events** | `/menu` | `/request-quote/regular` | Business event = regular form |
| **Military Functions** | `/wedding-menu` | `/request-quote/wedding` | Formal event = wedding form |

**Why not include menu links?**
1. The unified menu page (`/menu`) already has a Catering/Wedding toggle - users can find it via main navigation
2. Service cards should drive conversions, not browsing
3. Adding secondary "View Menu" links creates decision paralysis
4. Menu navigation is already accessible via Header

---

## Part 2: Files Safe to Delete

### Unused Pages (Not in App.tsx Routes)

| File | Status | Safe to Delete |
|------|--------|----------------|
| `src/pages/Menu.tsx` | NOT ROUTED (replaced by SimplifiedMenu) | Yes |
| `src/pages/WeddingMenu.tsx` | NOT ROUTED (`/wedding-menu` redirects to `/menu`) | Yes |
| `src/pages/HomePage.tsx` | USED by Index.tsx | No - Keep |
| `src/pages/QuoteDetails.tsx` | NOT ROUTED anywhere | Yes |

### Unused Component Directories

| Directory | Usage | Safe to Delete |
|-----------|-------|----------------|
| `src/components/home/alternative-third/` | Not imported anywhere | Yes (6 files) |
| `src/components/wedding/` | Only used by WeddingMenu.tsx | Yes (11 files) |

### Individual Unused Components

| File | Reason Unused | Safe to Delete |
|------|---------------|----------------|
| `src/components/WeddingMenuCard.tsx` | Only used by wedding/CollapsibleMenuSection.tsx | Yes |
| `src/components/menu/AppetizersCard.tsx` | Old standalone cards, not imported | Yes |
| `src/components/menu/EntreesCard.tsx` | Old standalone cards, not imported | Yes |
| `src/components/menu/SideDishesCard.tsx` | Old standalone cards, not imported | Yes |
| `src/components/menu/DessertsCard.tsx` | Old standalone cards, not imported | Yes |
| `src/components/menu/CollapsibleMenuSection.tsx` | Replaced by CollapsibleCategory.tsx | Yes |
| `src/components/menu/EnhancedCollapsibleMenuSection.tsx` | Not imported anywhere | Yes |
| `src/components/menu/EnhancedMenuItemCard.tsx` | Not imported anywhere | Yes |
| `src/components/menu/ImageMenuCard.tsx` | Not imported anywhere | Yes |
| `src/components/menu/MenuNavigation.tsx` | Not imported anywhere | Yes |
| `src/components/menu/MenuSectionFilter.tsx` | Not imported anywhere | Yes |
| `src/components/menu/MobileMenuNavigation.tsx` | Only used by deleted Menu.tsx | Yes |

---

## Part 3: Routes to Clean Up

### Current App.tsx Route Status

```text
Route                         | Status      | Action
------------------------------|-------------|--------
/wedding-menu                 | Redirect    | Keep (legacy URL support)
/menu                         | Active      | Keep (SimplifiedMenu)
```

The `/wedding-menu` redirect should be kept for backwards compatibility with any external links.

---

## Part 4: Implementation Summary

### Step 1: Update Service Card CTAs

**Files to modify:**
- `src/components/home/SupportingServiceCard.tsx` - Add `ctaText` prop
- `src/components/home/ServicesSection.tsx` - Update links and add ctaText
- `src/components/home/FeaturedServiceCard.tsx` - Update link and CTA text
- `src/components/home/ServiceCategoriesSection.tsx` - Update href to quote form

### Step 2: Delete Unused Files

**Pages (3 files):**
```
src/pages/Menu.tsx
src/pages/WeddingMenu.tsx
src/pages/QuoteDetails.tsx
```

**Component Directories (17 files):**
```
src/components/home/alternative-third/CinematicRubyHero.tsx
src/components/home/alternative-third/ElegantRubyFooter.tsx
src/components/home/alternative-third/ElegantTestimonials.tsx
src/components/home/alternative-third/LuxuryBookingSection.tsx
src/components/home/alternative-third/RubyEleganceServices.tsx
src/components/home/alternative-third/RubyGalleryShowcase.tsx

src/components/wedding/CollapsibleMenuSection.tsx
src/components/wedding/ElegantMenuItem.tsx
src/components/wedding/ElegantMenuSection.tsx
src/components/wedding/ElegantServiceCard.tsx
src/components/wedding/MenuDivider.tsx
src/components/wedding/MenuOrnament.tsx
src/components/wedding/MobileMenuNavigation.tsx
src/components/wedding/MobileWeddingTaglineSection.tsx
src/components/wedding/QuickActionButton.tsx
src/components/wedding/WeddingMenuSplitHero.tsx
src/components/wedding/WeddingQuoteSplitHero.tsx
```

**Individual Components (13 files):**
```
src/components/WeddingMenuCard.tsx
src/components/menu/AppetizersCard.tsx
src/components/menu/EntreesCard.tsx
src/components/menu/SideDishesCard.tsx
src/components/menu/DessertsCard.tsx
src/components/menu/CollapsibleMenuSection.tsx
src/components/menu/EnhancedCollapsibleMenuSection.tsx
src/components/menu/EnhancedMenuItemCard.tsx
src/components/menu/ImageMenuCard.tsx
src/components/menu/MenuNavigation.tsx
src/components/menu/MenuSectionFilter.tsx
src/components/menu/MobileMenuNavigation.tsx
src/components/menu/CompactMenuItem.tsx
```

**Total: 33 files to delete**

---

## Part 5: Updated Service Cards Flow

```text
User sees Services Section
        │
        ├── Wedding Catering (Featured) ──→ /request-quote/wedding
        │   └── CTA: "Start Your Wedding Quote"
        │
        ├── Black Tie Events ──→ /request-quote/wedding
        │   └── CTA: "Get Quote"
        │
        ├── Corporate Events ──→ /request-quote/regular
        │   └── CTA: "Get Quote"
        │
        ├── Military Functions ──→ /request-quote/wedding
        │   └── CTA: "Get Quote"
        │
        └── "View All Event Options" ──→ /request-quote
            └── For users who want to explore options first
```

---

## Technical Notes

### Files Being Kept (Active Components)

The simplified menu system uses these components that remain:
- `src/pages/SimplifiedMenu.tsx` - Main unified menu page
- `src/components/menu/SimpleMenuHeader.tsx` - Header component
- `src/components/menu/CollapsibleCategory.tsx` - Category accordion
- `src/components/menu/MenuCTASection.tsx` - Call to action
- `src/components/menu/QuickActionButton.tsx` - Mobile quick action
- `src/components/menu/HorizontalCategoryNav.tsx` - Desktop nav
- `src/components/menu/CompactMenuLayout.tsx` - Layout wrapper
- `src/components/menu/FilterQuickTags.tsx` - Filter pills

### Backwards Compatibility

The `/wedding-menu` route in App.tsx already redirects to `/menu`:
```tsx
<Route path="/wedding-menu" element={<Navigate to="/menu" replace />} />
```

This should remain to support any existing external links or bookmarks.

