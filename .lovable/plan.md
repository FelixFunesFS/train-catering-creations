

## Remove Extra Space Above Admin Portal Title

### Problem
The admin header has generous vertical padding (`py-3`) creating unnecessary whitespace above the "Soul Train's Eatery" title, especially on desktop.

### Fix (1 file)

**`src/components/admin/AdminLayout.tsx`**
- Reduce the header's inner padding from `py-3` to `py-2` to tighten the spacing above and below the title

This is a single class change -- no functionality affected.

