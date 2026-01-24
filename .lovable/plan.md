
# Menu Page Improvements

## Overview

This plan addresses four key issues with the current menu page:
1. Add a toggle to switch between Regular and Wedding menus
2. Remove asterisks and red-highlighted "popular" item cards
3. Remove the duplicate "Custom Menu Planning" CTA section
4. Fix the crimson red background to match the footer's solid color

---

## Current Issues Identified

### Issue 1: No Wedding Menu Toggle
The simplified menu currently only displays regular menu items with no way to access the wedding menu data (`weddingMenuItems` from `menuData.ts`).

### Issue 2: Asterisks and Red Card Styling
`CompactMenuItem.tsx` shows popular items with:
- A star icon in the top-right corner
- Red-tinted card background (`ring-1 ring-primary/20 bg-primary/5`)

### Issue 3: Duplicate CTA Sections
The page has two CTA sections:
- `MenuCTASection`: "Ready to Plan Your Event?" with Request Quote + Call buttons
- `MenuContact`: "Custom Menu Planning" with Call + Email buttons

### Issue 4: Faded Crimson Background
The CTA sections use `bg-gradient-primary` which appears lighter/faded compared to the footer's solid `bg-gradient-to-r from-primary to-primary-dark`.

---

## Solution Design

### Change 1: Add Menu Style Toggle

Add a simple toggle above the menu categories to switch between "Catering Menu" and "Wedding Menu":

```text
+------------------------------------------+
|  [ Catering Menu ]  [ Wedding Menu ]     |
+------------------------------------------+
```

**Implementation:**
- Add state to `SimplifiedMenu.tsx` to track active menu style
- Conditionally load either `menuData` (regular) or `weddingMenuItems` (wedding)
- Create a simple pill-toggle component inline (no separate file needed)

### Change 2: Remove Popular Item Highlighting

**File:** `src/components/menu/CompactMenuItem.tsx`

Remove:
- The `isPopular` prop handling
- Star icon display
- Red ring/background styling for popular items

**After:** All menu items will have the same clean, neutral appearance.

### Change 3: Consolidate CTAs

**Remove:** `MenuContact.tsx` import and usage from `SimplifiedMenu.tsx`

**Keep:** `MenuCTASection` with "Ready to Plan Your Event?" content

This eliminates the redundant second CTA at the bottom.

### Change 4: Fix Crimson Background Color

**File:** `src/components/menu/MenuCTASection.tsx`

Update the background class from pattern/gradient to use the solid crimson gradient matching the footer:

```tsx
// FROM (faded):
<PageSection pattern="a" withBorder>

// TO (solid crimson):
<section className="bg-gradient-to-r from-primary to-primary-dark ...">
```

Also update `src/components/ui/cta-section.tsx` to ensure consistent solid crimson backgrounds across all CTA sections.

---

## Detailed File Changes

### File 1: `src/pages/SimplifiedMenu.tsx`

1. **Add state for menu style toggle:**
```tsx
const [menuStyle, setMenuStyle] = useState<'regular' | 'wedding'>('regular');
```

2. **Import wedding menu data:**
```tsx
import { menuData, weddingMenuItems, MenuItem, MenuSection } from "@/data/menuData";
```

3. **Add toggle UI below the header:**
```tsx
<div className="flex justify-center mb-6">
  <div className="inline-flex bg-muted rounded-full p-1">
    <button
      onClick={() => setMenuStyle('regular')}
      className={cn(
        "px-6 py-2 rounded-full text-sm font-medium transition-all",
        menuStyle === 'regular'
          ? "bg-primary text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Catering Menu
    </button>
    <button
      onClick={() => setMenuStyle('wedding')}
      className={cn(
        "px-6 py-2 rounded-full text-sm font-medium transition-all",
        menuStyle === 'wedding'
          ? "bg-primary text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Wedding Menu
    </button>
  </div>
</div>
```

4. **Conditionally select menu data based on style:**
```tsx
const getCategories = () => {
  if (menuStyle === 'wedding') {
    return [
      { id: "appetizers", title: "Appetizers", subtitle: "Elegant starters", items: weddingMenuItems.appetizers },
      { id: "entrees", title: "Entrées", subtitle: "Signature main courses", items: weddingMenuItems.entrees },
      { id: "sides", title: "Sides", subtitle: "Perfect accompaniments", items: weddingMenuItems.sides },
      { id: "desserts", title: "Desserts", subtitle: "Sweet finales", items: weddingMenuItems.desserts },
    ];
  }
  return [ /* existing regular menu categories */ ];
};
```

5. **Remove `MenuContact` import and usage** (line 5 and line 101)

### File 2: `src/components/menu/CompactMenuItem.tsx`

**Remove:**
- `isPopular` prop from interface
- Star icon import and rendering
- Conditional red styling (`ring-1 ring-primary/20 bg-primary/5`)

**Result:** Clean, uniform item cards without highlighting.

### File 3: `src/components/menu/MenuCTASection.tsx`

**Replace the entire component** to use solid crimson background matching the footer:

```tsx
export const MenuCTASection = () => {
  const { ref, isVisible, variant } = useScrollAnimation({...});

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark py-10 lg:py-14">
          <div ref={ref} className={useAnimationClass(variant, isVisible)}>
            <div className="text-center space-y-6 max-w-3xl mx-auto px-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-white">
                Ready to Plan Your Event?
              </h2>
              <p className="text-white/90 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                Browse our menu and let us create a custom quote for your special
                occasion. We'll work with you to craft the perfect menu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                <Button asChild variant="cta-white" size="responsive-lg">
                  <Link to="/request-quote#page-header">Request a Free Quote</Link>
                </Button>
                <Button asChild variant="outline" size="responsive-lg" className="border-white text-white hover:bg-white hover:text-primary">
                  <a href="tel:8439700265">Call (843) 970-0265</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

### File 4: `src/components/ui/cta-section.tsx` (Optional - for consistency)

Update the background from `bg-gradient-primary` to `bg-gradient-to-r from-primary to-primary-dark` for consistent solid crimson across all CTA sections site-wide.

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/SimplifiedMenu.tsx` | Modify | Add toggle state, wedding data, remove MenuContact |
| `src/components/menu/CompactMenuItem.tsx` | Modify | Remove isPopular prop and styling |
| `src/components/menu/MenuCTASection.tsx` | Modify | Use solid crimson gradient background |
| `src/components/ui/cta-section.tsx` | Modify | Update to solid crimson gradient |
| `src/components/menu/MenuContact.tsx` | Remove | No longer needed (consolidated into MenuCTASection) |

---

## Visual Result

**Before:**
- Single menu view (regular only)
- Some items highlighted with red cards and stars
- Two CTA sections at bottom
- Faded/pinkish crimson backgrounds

**After:**
- Toggle between Catering and Wedding menus
- Clean, uniform item cards
- Single consolidated CTA section
- Solid, vibrant crimson red matching the footer

---

## Mobile Considerations

- Toggle buttons will be touch-friendly (min 44px height)
- Toggle uses pill design that works well on mobile
- CTA section remains fully responsive
