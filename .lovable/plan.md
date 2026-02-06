

## Remove Gap Between Title and Nav Bar on Desktop

### Problem
The admin header (title) and the navigation bar (`MobileAdminNav`) are rendered as separate elements with visual separation between them, creating unnecessary vertical space on desktop.

### Solution
Merge the navigation into the header on desktop by moving `MobileAdminNav` inside the header element. On desktop, the title and nav links will share the same row -- title on the left, nav items on the right (alongside the Sign Out button). On mobile, the nav remains as a fixed bottom bar (unchanged).

### Changes (2 files)

**`src/components/admin/AdminLayout.tsx`**
- Move `<MobileAdminNav />` inside the `<header>` element, within the flex row alongside the title
- On desktop (lg:), the nav items will appear inline next to the Sign Out button
- Remove the standalone `<MobileAdminNav />` below the header

**`src/components/admin/mobile/MobileAdminNav.tsx`**
- No logic changes needed -- the existing `lg:static lg:border-b` classes will be adjusted to `lg:border-0` since it's now inside the header
- Remove redundant desktop border styling since the header already provides the border

### Result
- Desktop: Single header bar with title on left, nav links + Sign Out on right -- no gap
- Mobile: Unchanged -- bottom fixed nav bar

