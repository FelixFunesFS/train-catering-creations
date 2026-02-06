

## Move Admin Nav to Top on Desktop

### Problem
The admin navigation bar is fixed to the bottom on all screen sizes. On desktop, a top navigation bar is more conventional and provides better UX.

### Approach
Modify `MobileAdminNav` to render as a **top horizontal bar on desktop** (lg: 1024px+) and keep the existing **bottom bar on mobile/tablet**. The same component, same nav items, same logic -- just repositioned via CSS.

### Changes (2 files)

**`src/components/admin/mobile/MobileAdminNav.tsx`**
- Change the outer `<nav>` classes to:
  - Mobile: `fixed bottom-0` with `border-t` (unchanged)
  - Desktop (lg:): `sticky lg:top-0` with `lg:border-b lg:border-t-0`
- Switch inner layout from vertical icon+label stacking to horizontal icon+label on desktop (`lg:flex-row lg:gap-2`)
- Hide the Logout button from this nav on desktop (`lg:hidden`) since it already exists in the AdminLayout header

**`src/components/admin/AdminLayout.tsx`**
- Move `<MobileAdminNav />` from below `<main>` to **above** `<main>` so it can sit under the header on desktop
- On desktop, remove the bottom padding on `<main>` (already handled: `lg:pb-[env(safe-area-inset-bottom)]`)
- The existing header Sign Out button (already `hidden lg:flex`) covers logout on desktop

### Technical Details

The key CSS trick is using responsive classes so the same component renders differently:

```text
Mobile:  fixed bottom-0 border-t  (bottom bar)
Desktop: sticky top-[header-height] border-b  (top bar, below header)
```

No routing, state, or functionality changes -- purely a CSS layout shift using Tailwind responsive prefixes.

