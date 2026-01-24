
# Unified Menu Page with Regular/Wedding Toggle

## Overview

This plan consolidates the separate `/menu` and `/wedding-menu` pages into a single unified menu experience at `/menu`. Users will toggle between "Catering Menu" (regular events) and "Wedding & Events" (elegant weddings) using a prominent toggle at the top, while each mode maintains its distinct visual aesthetic.

---

## Design Philosophy

### User Experience Goals
- **Quick scanning**: Both modes present items in clean, scannable lists
- **Clear differentiation**: Visual cues distinguish regular vs. wedding menus
- **Easy quote access**: Context-aware CTA button adapts to selected menu type
- **Mobile-first**: Toggle is thumb-friendly; menu sections scroll smoothly

### Visual Distinction

| Aspect | Catering Menu | Wedding Menu |
|--------|---------------|--------------|
| Typography | Clean sans-serif headers | Elegant script headers |
| Layout | Compact grid cards | Flowing list with descriptions |
| Items shown | Name only | Name + description + featured badges |
| Sections | Category tabs (Appetizers, Entrees...) | All categories stacked with dividers |
| Background | Gradient with hero images | Paper texture with ornamental dividers |

---

## Architecture

### Route Changes

```text
BEFORE:
  /menu         → Menu.tsx (regular)
  /wedding-menu → WeddingMenu.tsx (wedding)

AFTER:
  /menu                  → UnifiedMenu.tsx (default: regular)
  /menu?style=wedding    → UnifiedMenu.tsx (wedding mode)
  /wedding-menu          → Redirect to /menu?style=wedding
```

### Component Structure

```text
src/pages/
  └── UnifiedMenu.tsx (NEW - main unified page)

src/components/menu/
  ├── MenuStyleToggle.tsx (NEW - Regular/Wedding toggle)
  ├── RegularMenuView.tsx (NEW - extracted from Menu.tsx)
  ├── WeddingMenuView.tsx (NEW - extracted from WeddingMenu.tsx)
  ├── UnifiedMenuHeader.tsx (NEW - adapts title to style)
  └── [existing components remain]
```

---

## Component Details

### 1. MenuStyleToggle (NEW)

A prominent toggle component at the top of the menu page:

**Desktop Layout:**
```text
+------------------------------------------------------------+
|  [  Catering Menu  ]    [  Wedding & Events  ]             |
|       (active)                                              |
+------------------------------------------------------------+
```

**Mobile Layout:**
```text
+----------------------------------+
|   [ Catering ]  [ Weddings ]     |
+----------------------------------+
```

**Features:**
- Pill-style toggle with smooth animation
- Active state uses primary color with subtle shadow
- URL updates to include `?style=wedding` when toggled
- Preserves scroll position on toggle

### 2. UnifiedMenuHeader (NEW)

Adapts the page header based on selected style:

**Catering Mode:**
- Title: "Crafted with Soul, Seasoned with Love"
- Description: Current MenuHeader description
- CTA: "Request Quote" → `/request-quote/regular#page-header`

**Wedding Mode:**
- Title: "Elegant Wedding Catering with Southern Soul"
- Description: Refined wedding description
- CTA: "Plan Your Wedding" → `/request-quote/wedding#page-header`

### 3. RegularMenuView (NEW)

Extracted from current `Menu.tsx`:
- `HorizontalCategoryNav` for category tabs
- Category hero image with overlay
- `CompactMenuLayout` sections with `CompactMenuItem` grid
- Clean, scannable format

### 4. WeddingMenuView (NEW)

Extracted from current `WeddingMenu.tsx`:
- All sections visible (stacked, no tabs)
- `ElegantMenuSection` with `ElegantMenuItem` components
- `MenuDivider` between sections
- Script typography and ornamental elements
- Service cards section at bottom

### 5. UnifiedMenu (NEW)

Main page component:

```tsx
const UnifiedMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuStyle = searchParams.get('style') === 'wedding' ? 'wedding' : 'regular';
  
  const handleStyleChange = (style: 'regular' | 'wedding') => {
    if (style === 'wedding') {
      setSearchParams({ style: 'wedding' });
    } else {
      setSearchParams({});
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <QuickActionButton style={menuStyle} />
      
      <section className="py-6 lg:py-12">
        <UnifiedMenuHeader style={menuStyle} />
      </section>
      
      <MenuStyleToggle 
        activeStyle={menuStyle} 
        onStyleChange={handleStyleChange} 
      />
      
      {menuStyle === 'regular' ? (
        <RegularMenuView />
      ) : (
        <WeddingMenuView />
      )}
      
      <MenuContact style={menuStyle} />
    </div>
  );
};
```

---

## Data Flow

### Existing Data (No Changes Needed)

The `menuData.ts` file already has both data structures:

```tsx
// Regular menu (nested with sections)
export const menuData = {
  appetizers: { sections: [...] },
  entrees: { sections: [...] },
  sides: { sections: [...] },
  desserts: { sections: [...] }
};

// Wedding menu (flat premium items)
export const weddingMenuItems = {
  appetizers: [...],
  entrees: [...],
  sides: [...],
  desserts: [...]
};
```

---

## Navigation Updates

### Header.tsx

Update navigation link:
```tsx
// FROM:
{ name: "Wedding & Events", href: "/wedding-menu" }

// TO:
{ name: "Wedding Menu", href: "/menu?style=wedding" }
```

### App.tsx Route Changes

```tsx
// Add redirect for old wedding-menu URL
<Route path="/wedding-menu" element={<Navigate to="/menu?style=wedding" replace />} />

// Update menu route
<Route path="/menu" element={<UnifiedMenu />} />
```

### CTA Links Throughout Site

Update links in:
- `WeddingMenuSplitHero.tsx` - Link to `/menu?style=wedding`
- `SplitHero.tsx` - Keep regular menu link
- Footer links - Update if present

---

## Mobile Considerations

### Toggle Behavior
- Fixed position below sticky header when scrolling
- Large touch targets (44px minimum)
- Smooth fade transition between views

### Menu Sections
- Regular: Category tabs scroll horizontally
- Wedding: All sections stacked vertically with collapse/expand

### Quick Action Button
- Adapts CTA based on current menu style
- "Request Quote" for regular, "Plan Wedding" for wedding

---

## Implementation Steps

### Phase 1: Create New Components

1. **Create `MenuStyleToggle.tsx`**
   - Pill-style toggle with animation
   - URL parameter management
   - Mobile-responsive design

2. **Create `UnifiedMenuHeader.tsx`**
   - Dynamic title/description based on style
   - Context-aware CTA button

3. **Create `RegularMenuView.tsx`**
   - Extract render logic from `Menu.tsx`
   - Keep all existing animations and interactions

4. **Create `WeddingMenuView.tsx`**
   - Extract menu sections from `WeddingMenu.tsx`
   - Include service cards section

### Phase 2: Create Main Page

5. **Create `UnifiedMenu.tsx`**
   - Import and compose all components
   - URL parameter handling with `useSearchParams`
   - Smooth transition between views

### Phase 3: Update Routes & Navigation

6. **Update `App.tsx`**
   - Change `/menu` route to `UnifiedMenu`
   - Add redirect from `/wedding-menu` to `/menu?style=wedding`
   - Remove old `WeddingMenu` route

7. **Update `Header.tsx`**
   - Change "Wedding & Events" nav link

8. **Update CTA links site-wide**
   - Update any hardcoded `/wedding-menu` links

### Phase 4: Cleanup (Optional)

9. **Archive old pages** (keep for reference initially)
   - `Menu.tsx` → functionality extracted
   - `WeddingMenu.tsx` → functionality extracted

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/menu/MenuStyleToggle.tsx` | Toggle component |
| `src/components/menu/UnifiedMenuHeader.tsx` | Dynamic header |
| `src/components/menu/RegularMenuView.tsx` | Regular menu content |
| `src/components/menu/WeddingMenuView.tsx` | Wedding menu content |
| `src/pages/UnifiedMenu.tsx` | Main unified page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Update routes, add redirect |
| `src/components/Header.tsx` | Update nav link |
| `src/components/menu/QuickActionButton.tsx` | Add style prop for context-aware CTA |
| `src/components/menu/MenuContact.tsx` | Add style prop for context-aware content |

## Files to Archive (After Verification)

| File | Status |
|------|--------|
| `src/pages/Menu.tsx` | Can be removed after extraction |
| `src/pages/WeddingMenu.tsx` | Can be removed after extraction |

---

## Technical Notes

### URL Parameter Strategy

Using `?style=wedding` instead of a separate route:
- Enables deep linking to specific menu style
- Allows browser back/forward to work naturally
- Can easily share links to specific menu type

### Animation Transitions

When toggling between styles:
```tsx
<motion.div
  key={menuStyle}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {menuStyle === 'regular' ? <RegularMenuView /> : <WeddingMenuView />}
</motion.div>
```

Note: If motion library is not available, use CSS transitions with key-based re-rendering.

### SEO Considerations

- Keep `/menu` as the canonical URL
- Add meta description that mentions both catering and wedding services
- Ensure both views are indexable (no JavaScript-only rendering issues)

---

## Summary

This unified approach provides:
1. **Simpler navigation** - One menu page instead of two
2. **Easy comparison** - Users can toggle to see different options
3. **Maintained aesthetics** - Each style keeps its distinct visual identity
4. **Context-aware CTAs** - Quote requests route to the appropriate form
5. **SEO benefits** - Single authoritative menu page
6. **Mobile-friendly** - Large toggle targets, smooth transitions
