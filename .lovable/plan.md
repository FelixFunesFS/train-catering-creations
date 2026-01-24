
# Wedding Menu Descriptions, Elegant Typography, and Color Fixes

## Overview

This plan addresses four issues on the menu page:
1. Display descriptions for wedding menu items
2. Use elegant script font for wedding menu section titles
3. Remove faded overlay affecting page visibility
4. Fix the CTA "Call" button visibility to match other pages

---

## Issue Analysis

### Issue 1: Wedding Descriptions Not Showing
The `CompactMenuItem` component only displays `name`. Wedding menu items in `weddingMenuItems` have rich `description` fields that should be shown for the elegant wedding experience.

### Issue 2: Wedding Section Titles Need Elegant Font
When viewing the wedding menu, section headers like "Appetizers", "Entrées" should use `font-script` (Dancing Script) for an elegant, wedding-invitation feel.

### Issue 3: Decorative Overlays Fading Content
Lines 94-96 in `SimplifiedMenu.tsx` contain:
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
<div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />
```
These create a subtle wash over the entire page that makes the crimson CTA appear faded compared to the footer.

### Issue 4: Call Button Nearly Invisible
The menu CTA uses `border-primary-foreground/50` for the outline button, but the home page CTA uses `cta-white` variant which provides much better contrast.

---

## Solution Design

### Change 1: Add Description to CompactMenuItem

**File: `src/components/menu/CompactMenuItem.tsx`**

Add optional `description` prop and display it below the name when provided:

```tsx
interface CompactMenuItemProps {
  name: string;
  description?: string;  // NEW
  className?: string;
}

export const CompactMenuItem = ({ 
  name, 
  description,  // NEW
  className 
}: CompactMenuItemProps) => {
  return (
    <div className={cn(...)}>
      <div className="flex-1">
        <h4 className="font-medium text-foreground ...">
          {name}
        </h4>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
```

### Change 2: Pass Description from CollapsibleCategory

**File: `src/components/menu/CollapsibleCategory.tsx`**

Update the `CompactMenuItem` usage to pass the description:

```tsx
{visibleItems.map((item) => (
  <CompactMenuItem
    key={item.id}
    name={item.name}
    description={item.description}  // NEW
  />
))}
```

### Change 3: Add Elegant Font for Wedding Mode

**File: `src/components/menu/CollapsibleCategory.tsx`**

Add a prop to indicate wedding mode and apply `font-script` to titles:

```tsx
interface CollapsibleCategoryProps {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  initialItemCount?: number;
  isWeddingMode?: boolean;  // NEW
}

// In the component:
<h2 className={cn(
  "text-lg sm:text-xl font-semibold text-foreground",
  isWeddingMode ? "font-script text-xl sm:text-2xl" : "font-elegant"
)}>
  {title}
</h2>
```

**File: `src/pages/SimplifiedMenu.tsx`**

Pass the wedding mode prop:

```tsx
<CollapsibleCategory
  key={`${menuStyle}-${category.id}`}
  id={category.id}
  title={category.title}
  subtitle={category.subtitle}
  items={category.items}
  defaultExpanded={index === 0}
  isWeddingMode={menuStyle === 'wedding'}  // NEW
/>
```

### Change 4: Remove Decorative Overlays

**File: `src/pages/SimplifiedMenu.tsx`**

Remove or significantly reduce the faded overlay elements (lines 94-96):

**BEFORE:**
```tsx
{/* Decorative background elements */}
<div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
<div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />
```

**AFTER:**
Remove these entirely, or make them extremely subtle so they don't affect the CTA:
```tsx
{/* Subtle background accent - does not affect content visibility */}
<div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />
```

### Change 5: Fix Call Button Visibility

**File: `src/components/menu/MenuCTASection.tsx`**

Change the outline button to use full white border like the home page:

**BEFORE:**
```tsx
<Button 
  asChild 
  variant="outline" 
  size="responsive-lg" 
  className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
>
```

**AFTER:**
```tsx
<Button 
  asChild 
  variant="outline" 
  size="responsive-lg" 
  className="border-white border-2 text-white bg-transparent hover:bg-white hover:text-primary"
>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/CompactMenuItem.tsx` | Add description prop and render it |
| `src/components/menu/CollapsibleCategory.tsx` | Pass description to items, add isWeddingMode prop for elegant font |
| `src/pages/SimplifiedMenu.tsx` | Remove faded overlays, pass isWeddingMode prop |
| `src/components/menu/MenuCTASection.tsx` | Fix Call button border visibility |

---

## Visual Result

### Before
- Wedding items show name only
- Section titles use same font for both menus
- Page has subtle faded overlay affecting colors
- Call button outline is nearly invisible

### After
- Wedding items show name + description for premium feel
- Wedding section titles use elegant script font (Dancing Script)
- Clean background without color-washing overlays
- Call button has visible white border matching home page

---

## Typography Preview

**Catering Menu Mode:**
```text
Appetizers (font-elegant, sans-serif)
├── Charcuterie Board
├── Fruit Platter
└── ...
```

**Wedding Menu Mode:**
```text
𝒜𝓅𝓅𝑒𝓉𝒾𝓏𝑒𝓇𝓈 (font-script, elegant cursive)
├── Fresh Local Fruit Platter
│   "Beautifully arranged seasonal fruits"
├── Signature Charcuterie Board
│   "Artisan meats, cheeses, and accompaniments"
└── ...
```

---

## Mobile Considerations

- Descriptions on wedding items will be smaller text (text-xs) to maintain compact grid
- Script font will be slightly larger on wedding mode (text-xl vs text-lg) for readability
- All touch targets remain 44px minimum
