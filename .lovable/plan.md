
# Remove Dessert Images from Hero Section

## Overview
Remove two dessert images from the curated hero rotation as requested.

---

## Images to Remove

| Image | Lines | Reason |
|-------|-------|--------|
| Multi-Tier Dessert Display | 36-42 | User requested removal |
| Layered Dessert Cups | 43-49 | User requested removal |

---

## File Change

**File: `src/data/heroImages.ts`**

Remove both image objects from the array, leaving 6 curated hero images:

**Remaining Images After Change:**
1. Rustic Wedding Venue (wedding)
2. Elegant Outdoor Wedding Tent (wedding)
3. Grand Banquet Hall (formal)
4. Fresh Berry Tart Display (desserts)
5. Military Formal Ceremony (formal)
6. Wedding Venue Dining (wedding)

---

## Result

The hero section will cycle through 6 images instead of 8, with only one dessert image remaining (Fresh Berry Tart Display) for category diversity.
