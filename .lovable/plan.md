

# Wedding Menu Elegance & Layout Fixes

## Overview

This plan addresses four improvements to the menu page:
1. Remove descriptions from regular catering menu items (keep only on wedding)
2. Keep category title fonts consistent between both menus (remove script font)
3. Add elegant styling to wedding menu sections while maintaining 3-column layout
4. Remove the decorative red dot separator under the toggle

---

## Issue Analysis

### Issue 1: Descriptions Showing on Both Menus
Currently `CompactMenuItem` always displays the `description` prop when provided. Regular menu items from `menuData` don't have descriptions (just names), but passing the prop unconditionally is problematic. Need to conditionally pass descriptions only when in wedding mode.

### Issue 2: Different Title Fonts
Lines 57-60 in `CollapsibleCategory.tsx` apply `font-script` for wedding mode:
```tsx
isWeddingMode ? "font-script text-xl sm:text-2xl" : "font-elegant"
```
User wants both to use `font-elegant` consistently.

### Issue 3: Wedding Menu Needs More Elegance
Current wedding items look identical to regular items. Need to add:
- Subtle decorative ornaments in the category header
- Enhanced item cards with elegant borders/styling
- Possibly a cream/pearl background tint for wedding sections

### Issue 4: Red Circle Dot
Lines 127-139 in `SimplifiedMenu.tsx` create a decorative separator with a centered red dot:
```tsx
<div className="w-8 h-8 bg-primary/8 rounded-full flex items-center justify-center">
  <div className="w-2 h-2 bg-primary rounded-full" />
</div>
```
User wants this removed.

---

## Solution Design

### Change 1: Conditional Description Display

**File: `src/components/menu/CollapsibleCategory.tsx`**

Only pass `description` to `CompactMenuItem` when in wedding mode:

```tsx
<CompactMenuItem
  key={item.id}
  name={item.name}
  description={isWeddingMode ? item.description : undefined}
  isWeddingMode={isWeddingMode}
/>
```

### Change 2: Consistent Category Title Font

**File: `src/components/menu/CollapsibleCategory.tsx`**

Remove the conditional font styling, use `font-elegant` for both:

```tsx
// BEFORE:
isWeddingMode ? "font-script text-xl sm:text-2xl" : "font-elegant"

// AFTER:
"font-elegant"  // Same for both modes
```

### Change 3: Elegant Wedding Item Styling

**File: `src/components/menu/CompactMenuItem.tsx`**

Add `isWeddingMode` prop to apply elegant styling:

```tsx
interface CompactMenuItemProps {
  name: string;
  description?: string;
  isWeddingMode?: boolean;  // NEW
  className?: string;
}
```

When `isWeddingMode` is true, apply:
- Cream/pearl background tint
- Elegant gold/primary border accent
- Decorative flourish element
- Refined typography styling for descriptions

```tsx
<div className={cn(
  "group relative rounded-lg p-4 transition-all duration-200",
  "touch-target-comfortable min-h-[48px]",
  isWeddingMode
    ? "bg-cream/30 border border-primary/20 hover:border-primary/40 hover:bg-cream/50 shadow-sm"
    : "bg-background/20 hover:bg-background/40 border border-border/10 hover:border-primary/30",
  className
)}>
  {/* Wedding mode decorative corner */}
  {isWeddingMode && (
    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary/20 rounded-tr-lg" />
  )}
  
  <div className="flex-1">
    <h4 className={cn(
      "font-medium transition-colors text-base leading-relaxed",
      isWeddingMode 
        ? "text-foreground font-elegant group-hover:text-primary" 
        : "text-foreground group-hover:text-primary"
    )}>
      {name}
    </h4>
    {description && (
      <p className={cn(
        "mt-1 leading-relaxed",
        isWeddingMode 
          ? "text-sm text-muted-foreground italic font-light"
          : "text-xs text-muted-foreground"
      )}>
        {description}
      </p>
    )}
  </div>
</div>
```

**File: `src/components/menu/CollapsibleCategory.tsx`**

Add elegant styling to the category wrapper when in wedding mode:

```tsx
<div className={cn(
  "rounded-xl overflow-hidden border bg-card/50 backdrop-blur-sm",
  isWeddingMode 
    ? "border-primary/20 shadow-md" 
    : "border-border/50"
)}>
```

Add decorative ornament after the category header for wedding mode:

```tsx
{/* Wedding mode decorative divider */}
{isWeddingMode && isExpanded && (
  <div className="flex items-center justify-center py-2 bg-cream/10">
    <div className="flex items-center gap-2">
      <div className="w-8 h-px bg-primary/30" />
      <span className="text-primary/40 text-xs">✦</span>
      <div className="w-8 h-px bg-primary/30" />
    </div>
  </div>
)}
```

### Change 4: Remove Red Dot Separator

**File: `src/pages/SimplifiedMenu.tsx`**

Remove the entire visual separator block (lines 127-139):

```tsx
// DELETE THIS ENTIRE BLOCK:
{/* Visual separator */}
<div className="relative">
  <div className="absolute inset-0 flex items-center" aria-hidden="true">
    <div className="w-full border-t border-muted/40" />
  </div>
  <div className="relative flex justify-center">
    <span className="px-6 bg-gradient-hero text-muted-foreground">
      <div className="w-8 h-8 bg-primary/8 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full" />
      </div>
    </span>
  </div>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/CompactMenuItem.tsx` | Add `isWeddingMode` prop for elegant styling |
| `src/components/menu/CollapsibleCategory.tsx` | Remove script font, add elegant wrapper/divider for wedding mode, pass `isWeddingMode` to items |
| `src/pages/SimplifiedMenu.tsx` | Remove red dot separator |

---

## Visual Comparison

### Regular Catering Menu Item
```text
+-------------------------+
| Charcuterie Board       |
+-------------------------+
(Simple, clean, no description)
```

### Wedding Menu Item
```text
+-------------------------+
|  ┌─ decorative corner ─┐
| Signature Charcuterie   |
| Board                   |
| "Artisan meats and      |
|  cheeses elegantly      |
|  presented"             |
+-------------------------+
(Cream background, gold accents, italic description)
```

### Wedding Category Header
```text
+----------------------------------------+
| ▾ Appetizers      (12 items)           |
|         ——— ✦ ———                      |
|  [Item] [Item] [Item]                  |
|  [Item] [Item] [Item]                  |
+----------------------------------------+
```

---

## Responsiveness

The 3-column layout is preserved:
- Mobile: 2 columns (`grid-cols-2`)
- Desktop: 3 columns (`md:grid-cols-3`)

Wedding styling adjustments for mobile:
- Smaller decorative corner (4px instead of 6px)
- Slightly reduced padding on cream background
- Description text stays at `text-sm` for readability

---

## Red Dot Answer

The red circle dot underneath the toggle (lines 127-139 in `SimplifiedMenu.tsx`) is a **decorative visual separator**. It consists of:
- A horizontal line across the full width
- A centered container with a soft red circular background
- A small solid red dot in the center

It was added as a visual break between the toggle and the menu content, but will be removed as requested.

