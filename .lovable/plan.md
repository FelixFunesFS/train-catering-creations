

## Fix: Email Template Category Case Mismatch Dropping Line Item Details

### Problem

The email templates use **PascalCase** category names (`'Sides'`, `'Appetizers'`, `'Desserts'`) in their rendering order, but the database stores **lowercase** categories (`'sides'`, `'appetizers'`, `'desserts'`). This causes a mismatch where items don't match their intended category group and either:

1. Fall through to a generic "catch-all" renderer (losing proper icons, labels, and styling)
2. Display the generic title ("Additional Side Selection") without the actual food name being prominent

There are **two affected functions** in the same file, and two sub-issues:

---

### Issue 1: `generateMenuSection` (non-pricing menu display, line 405)

Used in: inquiry emails, admin notifications, and other non-estimate emails.

**Bug**: `categoryOrder` on line 435 uses `['Proteins', 'Sides', 'dietary', 'Appetizers', 'Desserts', 'Beverages', 'Service Items']` -- none of these match the actual lowercase database categories (`sides`, `appetizers`, `desserts`, `service`, `supplies`, `package`). So nearly ALL line items fall through to the catch-all renderer, losing their proper icons and category labels.

**Fix**: Normalize categories to lowercase throughout:
- Update `categoryOrder` to include lowercase variants: `['package', 'Proteins', 'sides', 'Sides', 'dietary', 'appetizers', 'Appetizers', 'desserts', 'Desserts', 'beverages', 'Beverages', 'service', 'supplies', 'food', 'Other Items']`
- Add lowercase entries to `categoryIcons` and `categoryLabels` maps
- Add deduplication so if both `'Sides'` and `'sides'` somehow exist, items aren't rendered twice

### Issue 2: `generateLineItemsTable` (pricing/estimate display, line ~780)

Used in: estimate emails, approval emails -- the main customer-facing emails.

**Bug**: `categoryOrder` on line 791 includes both cases for `appetizers`/`desserts` but is **missing lowercase `'sides'`**. So additional sides fall through to the catch-all, appearing at the bottom without proper styling.

**Fix**: Add `'sides'` to the `categoryOrder` array and ensure `categoryIcons` and `categoryLabels` include lowercase `'sides'`.

---

### Issue 3: Title vs. Description Display

Both email renderers show `item.title` as the bold heading and `item.description` as secondary text. For the "Additional Side Selection" line item, the title is the generic label and the description contains the actual food ("Rice Peas"). This technically works -- the food name IS shown -- but it's secondary and easy to miss.

**Fix**: For items in the `sides` category where the title is generic ("Additional Side Selection"), swap the display so the food name (description) is more prominent. This can be done by checking if the title contains "Selection" and the description exists, then using the description as the primary display text.

---

### Files Changed

**`supabase/functions/_shared/emailTemplates.ts`** (single file, two functions):

1. **`generateMenuSection` (~line 420-435)**: Add lowercase categories to `categoryIcons`, `categoryLabels`, and `categoryOrder`
2. **`generateLineItemsTable` (~line 781-791)**: Add `'sides'` to `categoryOrder`, add lowercase entries to icon/label maps
3. **Both functions (~line 487/890)**: Update item display logic so description-heavy items (like "Additional Side Selection" with description "Rice Peas") show the food name prominently

### What This Fixes

| Before | After |
|---|---|
| "Additional Side Selection" shown as title, "Rice Peas" buried in small text or missing | "Rice Peas" shown prominently as the side name |
| Sides, appetizers, desserts fall to catch-all in non-pricing emails | Properly grouped under correct category with icons |
| Missing "sides" in pricing email category order | Sides appear in correct position with proper styling |

### What Stays the Same

- Database categories unchanged (all lowercase) -- this is the correct source of truth
- Customer portal (flat list, no category grouping) -- unaffected
- Staff view -- already uses lowercase categories correctly
- Admin estimate editor -- unaffected
- PDF generation -- uses its own rendering path

