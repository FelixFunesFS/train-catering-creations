

# Fix: Emails Dropping Line Items with Unknown Categories

## Problem

Pryce Porter's email showed only "Delivery with Setup" ($50) but was missing the brunch menu item ($520) worth of food. The brunch line item has category `food`, which is not in the hardcoded `categoryOrder` array in `emailTemplates.ts`. Any line item with an unlisted category is silently dropped from all customer emails.

**Database categories in use:** `appetizers`, `desserts`, `dietary`, `food`, `package`, `service`, `supplies`

**Template's hardcoded list:** `package`, `Proteins`, `Sides`, `dietary`, `Appetizers`, `appetizers`, `Desserts`, `desserts`, `Beverages`, `Service Items`, `service`, `supplies`, `Other Items`

Missing from template: **`food`** (and any future categories admins might create)

## Fix

### `supabase/functions/_shared/emailTemplates.ts` (~line 791-827)

**Replace the fixed-list iteration with a catch-all approach:**

1. Keep `categoryOrder` for **sorting priority** (known categories render first, in a logical order)
2. After rendering known categories, iterate over **remaining categories** found in the data that weren't in the list
3. Add `food` to the known category list with an appropriate label and icon

```text
Before:
  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) { ... }
  });

After:
  // 1. Render known categories in preferred order
  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) { renderCategory(category); }
  });
  // 2. Render any remaining categories not in the list
  Object.keys(itemsByCategory).forEach(category => {
    if (!categoryOrder.includes(category)) { renderCategory(category); }
  });
```

Also add to the mappings:
- `categoryIcons`: `'food': '🍳'`
- `categoryLabels`: `'food': 'Menu Selections'`
- `categoryOrder`: Add `'food'` after `'package'`

## Status Question

Pryce and Felix already map to "Confirmed" from the previous code change (`awaiting_payment` mapped to "Confirmed" in `EventList.tsx`). If still showing otherwise in the browser, a hard refresh will pick up the new code.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/emailTemplates.ts` | Add `food` to category maps; add catch-all loop for unknown categories |

No frontend or database changes needed. After deploying the updated edge function, all future emails will include every line item regardless of category.
