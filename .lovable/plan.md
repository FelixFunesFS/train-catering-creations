

# Fix Category Cards Tablet Layout

## Problem

The `CategoryCards` component uses the `useIsMobile()` hook which has a **1024px breakpoint**. This means:
- Screens below 1024px → Mobile stacked layout (what you're seeing)
- Screens 1024px and above → Desktop 3-column grid

Tablets (640px-1023px) are being treated as "mobile" and showing the vertically stacked cards instead of the 3-column row layout.

---

## Solution

Replace the JavaScript-based `isMobile` conditional with **CSS-only responsive classes**. This allows the layout to respond at the correct Tailwind breakpoints:

- **Mobile (<640px)**: Stacked vertical cards
- **Tablet/Desktop (640px+)**: 3-column grid

---

## Implementation

### File: `src/components/gallery/CategoryCards.tsx`

**Approach**: Remove the `isMobile` conditional and use CSS `hidden`/`block` classes with responsive breakpoints.

**Changes:**

1. Remove the `useIsMobile` import and usage
2. Render BOTH layouts, using CSS to show/hide:
   - Mobile layout: `block sm:hidden`
   - Desktop/Tablet layout: `hidden sm:grid`

```tsx
return (
  <div ref={categoriesRef} className={...}>
    {/* Mobile: Vertical stacked cards (shown <640px) */}
    <div className="block sm:hidden flex flex-col gap-4">
      {/* Mobile card markup... */}
    </div>
    
    {/* Tablet & Desktop: 3-column grid (shown 640px+) */}
    <div className="hidden sm:grid grid-cols-3 gap-6">
      {/* Desktop card markup... */}
    </div>
  </div>
);
```

---

## Visual Result

### Before (Tablet ~768px)
```text
┌─────────────────────────────────┐
│  Weddings & Black Tie           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Buffet Service                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Artisan Desserts               │
└─────────────────────────────────┘
```

### After (Tablet ~768px)
```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Weddings │ │  Buffet  │ │ Desserts │
└──────────┘ └──────────┘ └──────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/gallery/CategoryCards.tsx` | Replace JS conditional with CSS responsive classes |

---

## Technical Notes

- Uses Tailwind's `sm:` breakpoint (640px) which is standard for tablet detection
- Both layouts are rendered in the DOM but only one is visible via CSS `hidden`/`block`
- This is a common pattern when JavaScript breakpoints don't match CSS breakpoints
- No changes to the card styling or functionality - only visibility control
- The `useIsMobile` hook can be removed from this component entirely

