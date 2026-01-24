
# Simplified Menu with Collapsible Categories

## Overview

Redesign the unified menu page to remove the Regular/Wedding toggle and replace it with a single, easy-to-scan menu featuring all categories as collapsible sections. The layout will use 2-3 columns on desktop for quick scanning, and the "Request Quote" CTA will be moved to after all menu sections.

---

## Design Philosophy

### User Experience Goals
- **Instant scanning**: All categories visible at a glance with expand/collapse
- **Clean hierarchy**: Category headers as accordion triggers, items in grid
- **Minimal friction**: No toggles or mode switching - one unified view
- **Clear conversion path**: CTA appears after users browse the full menu

### Layout Strategy

```text
MOBILE (1 column):
+---------------------------+
|    [Page Header]          |
|    (no CTA button)        |
+---------------------------+
| [v] Appetizers            |
|   Item  |  Item           |
|   Item  |  Item           |
+---------------------------+
| [v] Entrees               |
|   Item  |  Item           |
|   Item  |  Item           |
+---------------------------+
| [v] Sides                 |
+---------------------------+
| [v] Desserts              |
+---------------------------+
|    [Request Quote CTA]    |
+---------------------------+
```

```text
DESKTOP (3 columns):
+------------------------------------------+
|           [Page Header]                  |
|           (no CTA button)                |
+------------------------------------------+
| [v] Appetizers                           |
|  Item   |   Item   |   Item              |
|  Item   |   Item   |   Item              |
+------------------------------------------+
| [v] Entrees                              |
|  Item   |   Item   |   Item              |
+------------------------------------------+
| [v] Sides                                |
+------------------------------------------+
| [v] Desserts                             |
+------------------------------------------+
|         [Request Quote CTA]              |
+------------------------------------------+
```

---

## Component Architecture

### New/Modified Components

| Component | Status | Purpose |
|-----------|--------|---------|
| `SimplifiedMenu.tsx` | NEW | Main page replacing UnifiedMenu |
| `CollapsibleCategory.tsx` | NEW | Accordion category with grid items |
| `SimpleMenuHeader.tsx` | NEW | Simplified header without CTA |
| `MenuCTASection.tsx` | NEW | Bottom CTA after menu content |

### Components to Remove/Deprecate

| Component | Action |
|-----------|--------|
| `MenuStyleToggle.tsx` | Remove (no longer needed) |
| `UnifiedMenuHeader.tsx` | Replace with SimpleMenuHeader |
| `RegularMenuView.tsx` | Remove (consolidated) |
| `WeddingMenuView.tsx` | Remove (consolidated) |
| `UnifiedMenu.tsx` | Replace with SimplifiedMenu |

---

## Component Details

### 1. CollapsibleCategory (NEW)

A full-width accordion section for each menu category:

```text
+--------------------------------------------------+
| [Chevron] Appetizers (19 items)            [-/+] |
+--------------------------------------------------+
| When expanded:                                   |
| +------------+ +------------+ +------------+     |
| | Charcuterie| | Fruit      | | Cheese     |     |
| | Board    ★ | | Platter    | | Platter    |     |
| +------------+ +------------+ +------------+     |
| +------------+ +------------+ +------------+     |
| | Deviled    | | Bruschetta | | Sliders    |     |
| | Eggs       | |            | |          ★ |     |
| +------------+ +------------+ +------------+     |
|            [ Show 13 More Items ]                |
+--------------------------------------------------+
```

**Features:**
- Chevron icon rotates on expand/collapse
- Item count shown in header
- Grid layout: `grid-cols-2 sm:grid-cols-2 md:grid-cols-3`
- Show first 6-9 items, "Show More" button for rest
- Smooth height animation on expand/collapse
- Popular items marked with star badge

**Props:**
```tsx
interface CollapsibleCategoryProps {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  initialItemCount?: number; // Default 9
}
```

### 2. SimpleMenuHeader (NEW)

Streamlined header without the CTA button:

```tsx
<div className="text-center py-8 lg:py-12">
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant">
    Our Catering Menu
  </h1>
  <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
    Authentic Southern cuisine crafted with love for weddings, 
    corporate events, and special celebrations
  </p>
</div>
```

### 3. MenuCTASection (NEW)

Prominent CTA section appearing after all menu categories:

```text
+--------------------------------------------------+
|                                                  |
|     Ready to Plan Your Event?                    |
|                                                  |
|  Browse our menu and let us create a custom      |
|  quote for your special occasion.                |
|                                                  |
|     [ Request a Free Quote ]                     |
|                                                  |
+--------------------------------------------------+
```

**Features:**
- Warm background pattern (pattern-a or primary gradient)
- Large, prominent CTA button
- Optional secondary link to contact/FAQ
- Responsive padding

### 4. SimplifiedMenu (NEW - Main Page)

```tsx
const SimplifiedMenu = () => {
  // Combine all menu items from menuData
  const categories = [
    { id: 'appetizers', ...menuData.appetizers },
    { id: 'entrees', ...menuData.entrees },
    { id: 'sides', ...menuData.sides },
    { id: 'desserts', ...menuData.desserts },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <QuickActionButton />
      
      <SimpleMenuHeader />
      
      <section className="py-6 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 lg:space-y-6">
            {categories.map((category, index) => (
              <CollapsibleCategory
                key={category.id}
                id={category.id}
                title={category.title}
                subtitle={category.subtitle}
                items={flattenCategoryItems(category.sections)}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        </div>
      </section>
      
      <MenuCTASection />
      
      <MenuContact />
    </div>
  );
};
```

---

## Data Handling

### Flattening Menu Items

The current `menuData` has nested sections within categories. For the simplified view, flatten all section items into a single array per category:

```tsx
const flattenCategoryItems = (sections: MenuSection[]): MenuItem[] => {
  return sections.flatMap(section => 
    section.items.map(item => {
      if (typeof item === 'string') {
        return { id: item.toLowerCase().replace(/\s/g, '-'), name: item };
      }
      return item;
    })
  );
};
```

**Result:**
- Appetizers: ~19 items (combined from Platters, Signature Bites, Classic Starters)
- Entrees: ~29 items (combined from Poultry, Beef & Pork, Seafood, Plant-Based)
- Sides: ~20 items (combined from Comfort Classics, Fresh & Light)
- Desserts: ~10 items (combined from Signature Cakes, Specialty Treats)

---

## Grid Responsiveness

### Column Breakpoints

```css
/* Item grid within each category */
.menu-item-grid {
  grid-template-columns: repeat(2, 1fr);  /* Mobile: 2 columns */
}

@media (min-width: 768px) {
  .menu-item-grid {
    grid-template-columns: repeat(3, 1fr);  /* Tablet+: 3 columns */
  }
}
```

### Touch Targets
- Category headers: Full-width clickable area, min-height 48px
- Menu items: min-height 48px with comfortable padding
- Show More button: min-height 44px

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/SimplifiedMenu.tsx` | Main menu page |
| `src/components/menu/CollapsibleCategory.tsx` | Accordion category section |
| `src/components/menu/SimpleMenuHeader.tsx` | Simplified page header |
| `src/components/menu/MenuCTASection.tsx` | Bottom CTA section |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Update `/menu` route to use `SimplifiedMenu` |
| `src/components/Header.tsx` | Update "Wedding & Events" nav to just point to `/menu` (or remove if redundant) |

## Files to Remove (After Verification)

| File | Reason |
|------|--------|
| `src/pages/UnifiedMenu.tsx` | Replaced by SimplifiedMenu |
| `src/components/menu/MenuStyleToggle.tsx` | No longer needed |
| `src/components/menu/UnifiedMenuHeader.tsx` | Replaced by SimpleMenuHeader |
| `src/components/menu/RegularMenuView.tsx` | Consolidated into SimplifiedMenu |
| `src/components/menu/WeddingMenuView.tsx` | Consolidated into SimplifiedMenu |

---

## Implementation Steps

### Phase 1: Create Core Components

1. **Create `CollapsibleCategory.tsx`**
   - Accordion header with chevron animation
   - Item count badge
   - Grid layout for items (2-col mobile, 3-col desktop)
   - Show More/Less functionality
   - Reuse `CompactMenuItem` for individual items

2. **Create `SimpleMenuHeader.tsx`**
   - Clean header without CTA
   - Inclusive messaging for all event types

3. **Create `MenuCTASection.tsx`**
   - Warm background section
   - Prominent quote request button
   - Links to `/request-quote#page-header`

### Phase 2: Create Main Page

4. **Create `SimplifiedMenu.tsx`**
   - Import all categories from `menuData`
   - Flatten section items per category
   - Render CollapsibleCategory for each
   - First category expanded by default

### Phase 3: Update Routes & Navigation

5. **Update `App.tsx`**
   - Change `/menu` route to `SimplifiedMenu`
   - Keep `/wedding-menu` redirect to `/menu`

6. **Update `Header.tsx`**
   - Simplify navigation (optionally remove separate Wedding link)

### Phase 4: Cleanup

7. **Remove deprecated components**
   - After verifying the new menu works correctly

---

## Visual Styling

### Category Header Styling

```tsx
<button 
  className={cn(
    "w-full flex items-center justify-between",
    "p-4 sm:p-5 lg:p-6",
    "bg-card hover:bg-card/90",
    "border border-border/50 rounded-xl",
    "transition-all duration-200",
    "touch-target-comfortable"
  )}
>
  <div className="flex items-center gap-3">
    <ChevronDown className={cn(
      "h-5 w-5 text-primary transition-transform duration-200",
      isExpanded && "rotate-180"
    )} />
    <div className="text-left">
      <h2 className="text-lg sm:text-xl font-elegant">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
    {items.length} items
  </span>
</button>
```

### Expand/Collapse Animation

```tsx
<div className={cn(
  "grid transition-all duration-300 ease-out",
  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
)}>
  <div className="overflow-hidden">
    {/* Grid content */}
  </div>
</div>
```

---

## Summary

This simplified approach provides:

1. **Single unified view** - No toggle confusion, all items accessible
2. **Quick scanning** - 2-3 column grid with collapsible sections
3. **Clear hierarchy** - Category accordions make navigation intuitive
4. **Mobile-optimized** - 2 columns on mobile, touch-friendly targets
5. **Focused conversion** - CTA appears after browsing, not before
6. **Reduced complexity** - Fewer components, simpler architecture
