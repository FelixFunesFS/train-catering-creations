

# Menu Page Enhancements

## Overview

Add three polish elements to the menu page matching home page branding patterns:
1. Enhanced header with badge icon + script subtitle
2. Category stagger animations using existing hook
3. Toggle button icons for visual clarity

---

## Change 1: Enhanced Menu Header

**File: `src/components/menu/SimpleMenuHeader.tsx`**

Add the badge + icon pattern from home page sections, plus a script subtitle.

### Current (lines 16-23):
```tsx
<div className="text-center space-y-4">
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
    Our Catering Menu
  </h1>
  <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
    Authentic Southern cuisine crafted with love...
  </p>
</div>
```

### Updated:
```tsx
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

// Inside the render:
<div className="text-center space-y-3">
  {/* Badge + Icon (matching home page pattern) */}
  <div className="flex items-center justify-center space-x-2 mb-3">
    <Utensils className="h-5 w-5 text-ruby" />
    <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
      Our Menu
    </Badge>
  </div>
  
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
    Our Catering Menu
  </h1>
  
  {/* Script subtitle (matching home page sections) */}
  <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
    Crafted with Soul, Seasoned with Love
  </p>
  
  <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
    Authentic Southern cuisine for weddings, corporate events, and special celebrations
  </p>
</div>
```

---

## Change 2: Category Stagger Animations

**File: `src/pages/SimplifiedMenu.tsx`**

Use the existing `useStaggeredAnimation` hook to animate categories as they enter view.

### Add imports:
```tsx
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
```

### Add hook usage (after `const categories = getCategories();`):
```tsx
const staggered = useStaggeredAnimation({
  itemCount: categories.length,
  staggerDelay: 150,
  baseDelay: 100,
  variant: 'fade-up'
});
```

### Update the categories grid (lines 131-143):
```tsx
<div 
  ref={staggered.ref}
  className="space-y-4 lg:space-y-6"
>
  {categories.map((category, index) => (
    <div 
      key={`${menuStyle}-${category.id}`}
      className={staggered.getItemClassName(index)}
      style={staggered.getItemStyle(index)}
    >
      <CollapsibleCategory
        id={category.id}
        title={category.title}
        subtitle={category.subtitle}
        items={category.items}
        defaultExpanded={index === 0}
        isWeddingMode={menuStyle === 'wedding'}
      />
    </div>
  ))}
</div>
```

---

## Change 3: Toggle Button Icons

**File: `src/pages/SimplifiedMenu.tsx`**

Add icons to the toggle buttons for visual clarity.

### Add import:
```tsx
import { Utensils, Heart } from "lucide-react";
```

### Update toggle buttons (lines 101-124):
```tsx
<div className="inline-flex bg-muted rounded-full p-1 shadow-sm">
  <button
    onClick={() => setMenuStyle('regular')}
    className={cn(
      "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center gap-2",
      menuStyle === 'regular'
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
    )}
  >
    <Utensils className="h-4 w-4" />
    <span>Catering Menu</span>
  </button>
  <button
    onClick={() => setMenuStyle('wedding')}
    className={cn(
      "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center gap-2",
      menuStyle === 'wedding'
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
    )}
  >
    <Heart className="h-4 w-4" />
    <span>Wedding Menu</span>
  </button>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/SimpleMenuHeader.tsx` | Add Badge, Utensils icon, script subtitle |
| `src/pages/SimplifiedMenu.tsx` | Add stagger animation hook, toggle icons |

---

## Visual Result

### Header (Before):
```text
Our Catering Menu
Authentic Southern cuisine crafted with love...
```

### Header (After):
```text
    [🍴 Our Menu]          ← Badge with icon
    
  Our Catering Menu        ← Same elegant title
  
Crafted with Soul,         ← NEW script subtitle
  Seasoned with Love
  
Authentic Southern cuisine...  ← Same description
```

### Toggle Buttons (Before):
```text
[ Catering Menu ] [ Wedding Menu ]
```

### Toggle Buttons (After):
```text
[ 🍴 Catering Menu ] [ ❤️ Wedding Menu ]
```

### Category Animation:
Categories fade in one after another (150ms delay between each) as the user scrolls down, creating a polished reveal effect.

---

## Technical Notes

- Uses existing `useStaggeredAnimation` hook - no new dependencies
- Badge pattern copied from `AboutPreviewSection.tsx` and `ServiceCategoriesSection.tsx`
- Script subtitle matches home page sections (`font-script text-ruby`)
- Animation variant `fade-up` is smooth and unobtrusive
- Icons are small (h-4 w-4) to maintain toggle button proportions

