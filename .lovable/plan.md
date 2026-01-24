
# Compact Regular Menu Layout

## Overview

Make the regular catering menu items more compact while maintaining 3 columns on desktop and reducing row spacing. Wedding mode remains unchanged with its elegant styling.

---

## Current State

**CompactMenuItem.tsx (line 19):**
- Padding: `p-4` (16px all sides)
- Min height: `min-h-[48px]`
- Font: `text-base` (16px)

**CollapsibleCategory.tsx (line 93):**
- Grid gap: `gap-3 lg:gap-4` (12px mobile, 16px desktop)
- Columns: `grid-cols-2 md:grid-cols-3` (already 3 columns on desktop)

---

## Changes

### 1. Reduce Item Padding (Regular Mode Only)

**File: `src/components/menu/CompactMenuItem.tsx`**

Apply smaller padding for regular mode, keep larger padding for wedding:

```tsx
<div className={cn(
  "group relative rounded-lg transition-all duration-200 touch-target-comfortable flex items-center",
  isWeddingMode
    ? "p-4 min-h-[48px] bg-accent/20 border border-primary/20 hover:border-primary/40 hover:bg-accent/30 shadow-sm"
    : "p-2.5 sm:p-3 min-h-[40px] bg-background/20 hover:bg-background/40 border border-border/10 hover:border-primary/30 hover:shadow-sm",
  className
)}>
```

**Changes:**
- Regular mode: `p-2.5 sm:p-3` (10px mobile, 12px desktop) instead of `p-4`
- Regular mode: `min-h-[40px]` instead of `min-h-[48px]`
- Wedding mode: keeps `p-4 min-h-[48px]`

### 2. Reduce Font Size for Regular Mode

**File: `src/components/menu/CompactMenuItem.tsx`**

Smaller text for regular items:

```tsx
<h4 className={cn(
  "font-medium transition-colors leading-snug",
  isWeddingMode 
    ? "text-base text-foreground font-elegant group-hover:text-primary" 
    : "text-sm text-foreground group-hover:text-primary"
)}>
```

**Changes:**
- Regular mode: `text-sm` (14px) instead of `text-base`
- Regular mode: `leading-snug` for tighter line height
- Wedding mode: keeps `text-base`

### 3. Reduce Grid Gap

**File: `src/components/menu/CollapsibleCategory.tsx`**

Tighter spacing for regular mode:

```tsx
<div className={cn(
  "grid grid-cols-2 md:grid-cols-3",
  isWeddingMode ? "gap-3 lg:gap-4" : "gap-2 lg:gap-2.5"
)}>
```

**Changes:**
- Regular mode: `gap-2 lg:gap-2.5` (8px mobile, 10px desktop)
- Wedding mode: keeps `gap-3 lg:gap-4`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/CompactMenuItem.tsx` | Conditional padding, min-height, and font size |
| `src/components/menu/CollapsibleCategory.tsx` | Conditional grid gap |

---

## Visual Comparison

### Before (Regular Menu)
```
+------------------+ +------------------+ +------------------+
|                  | |                  | |                  |
|  Charcuterie     | |  Fruit Platter   | |  Deviled Eggs    |
|  Board           | |                  | |                  |
+------------------+ +------------------+ +------------------+
       ↑ 16px gap ↑
```

### After (Regular Menu - Compact)
```
+----------------+ +----------------+ +----------------+
| Charcuterie    | | Fruit Platter  | | Deviled Eggs   |
+----------------+ +----------------+ +----------------+
      ↑ 8px gap ↑
```

### Wedding Menu (Unchanged)
```
+------------------+ +------------------+ +------------------+
|                  | |                  | |                  |
|  Signature       | |  Fresh Local     | |  Shrimp Cocktail |
|  Charcuterie     | |  Fruit Platter   | |                  |
|  "Artisan meats" | |  "Seasonal..."   | |  "Classic..."    |
+------------------+ +------------------+ +------------------+
```

---

## Responsiveness

- Mobile (2 columns): `gap-2`, `p-2.5`, `text-sm`
- Tablet/Desktop (3 columns): `gap-2.5`, `p-3`, `text-sm`
- Wedding mode: unchanged (`gap-3/4`, `p-4`, `text-base`)

Touch targets remain accessible with `min-h-[40px]` meeting WCAG 2.2 standards.
