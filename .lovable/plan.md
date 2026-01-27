

# Category Cards Tablet Layout Update

## Problem

Currently, the category cards in the gallery use this grid layout for non-mobile devices:
```tsx
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

This means:
- **Mobile (<640px)**: 1 column (but uses separate mobile layout)
- **Small tablets (640px-1023px)**: 2 columns
- **Desktop (1024px+)**: 3 columns

Since there are exactly 3 category cards, showing 2 columns on tablets creates an unbalanced layout with 2 cards on one row and 1 orphan card below.

---

## Solution

Change the grid breakpoint so tablets show all 3 cards in a single row:

```tsx
// Before
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// After  
grid-cols-1 sm:grid-cols-3
```

This simplifies the layout:
- **Mobile (<640px)**: Uses the dedicated mobile stacked layout
- **Tablet & Desktop (640px+)**: 3 columns

---

## Implementation

### File: `src/components/gallery/CategoryCards.tsx`

**Line 113 - Update grid classes:**

| Before | After |
|--------|-------|
| `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` | `grid-cols-1 sm:grid-cols-3` |

**Code change:**
```tsx
// Before (line 113)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// After
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
```

---

## Visual Result

### Before (Tablet ~768px)
```text
┌─────────────┐  ┌─────────────┐
│  Weddings   │  │   Buffet    │
└─────────────┘  └─────────────┘
┌─────────────┐
│  Desserts   │  (orphan card)
└─────────────┘
```

### After (Tablet ~768px)
```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Weddings   │ │   Buffet    │ │  Desserts   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/gallery/CategoryCards.tsx` | Update grid classes on line 113 |

---

## Technical Notes

- The `sm:` breakpoint is 640px in Tailwind, which covers most tablets
- This change is minimal and maintains existing mobile/desktop distinction
- Card heights and styling remain unchanged
- The gap between cards (`gap-6`) stays the same for consistent spacing

