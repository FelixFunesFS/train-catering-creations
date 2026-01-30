

# Option C Implementation Plan: Admin-Only PWA

## Overview
This plan removes the PWA functionality from the public website while creating an admin-only PWA experience. Public visitors will get a standard mobile browser experience even when saving to their home screen, while admins will have a dedicated installable app.

---

## Strategy

The key insight is that the PWA behavior is controlled by:
1. **manifest.json** - Defines the app metadata and `start_url`
2. **index.html** - Contains PWA meta tags like `apple-mobile-web-app-capable`
3. **Service Worker** (via Vite PWA plugin) - Handles caching/offline
4. **React components** - Install banners and prompts

To make the public site behave as a normal website while keeping PWA for admin:
- Create a separate admin manifest (`/admin-manifest.json`)
- Dynamically swap the manifest link based on the current route
- Remove `apple-mobile-web-app-capable` from the base HTML and inject it only on admin routes
- Update install banner to only show on admin routes
- Add safe area padding to AdminLayout for proper PWA display

---

## File Changes

### 1. Create `/public/admin-manifest.json` (New File)
Admin-specific PWA manifest with:
- `name`: "Soul Train's Admin Portal"
- `short_name`: "ST Admin"
- `description`: "Admin dashboard for Soul Train's Eatery catering management"
- `start_url`: "/admin"
- `display`: "standalone"
- Updated shortcuts for admin actions (Events, Billing)

### 2. Modify `/public/manifest.json`
Change to a "non-PWA" manifest for public site:
- Change `display` from `"standalone"` to `"browser"` - this makes the public site open in normal browser mode even when saved to home screen
- Keep other metadata for SEO/social purposes

### 3. Modify `/index.html`
Remove PWA-specific meta tags that apply site-wide:
- Remove `apple-mobile-web-app-capable` (will be injected by React for admin)
- Remove `apple-mobile-web-app-status-bar-style`
- Remove `mobile-web-app-capable`
- Keep the manifest link but it will be swapped dynamically

### 4. Create `/src/hooks/useAdminPWA.ts` (New File)
A custom hook that:
- Detects if the current route is an admin route
- Dynamically swaps the manifest link to `/admin-manifest.json`
- Injects `apple-mobile-web-app-capable` meta tag for admin routes only
- Cleans up when navigating away from admin

### 5. Modify `/src/components/pwa/InstallBanner.tsx`
- Add route check to only show on admin routes (`location.pathname.startsWith('/admin')`)
- Update messaging to say "Install Admin Portal" instead of "Install Soul Train's"
- Add logic to not show on `/admin/auth` (login page)

### 6. Modify `/src/pages/Install.tsx`
- Update all copy to focus on admin portal installation
- Update benefits list to admin-specific features:
  - Quick access to event management
  - View and manage quotes on the go
  - Receive notifications (future)
  - Full-screen admin dashboard experience
- Update button text and icons for admin context

### 7. Modify `/src/components/admin/AdminLayout.tsx`
Add safe area padding for proper PWA display:
- Add `pt-[env(safe-area-inset-top)]` to the root container
- Add safe area consideration to the sticky header
- Ensure bottom content respects `pb-[env(safe-area-inset-bottom)]`

### 8. Modify `/src/App.tsx`
- Import and use the new `useAdminPWA` hook in `AppContent`
- This will handle the dynamic manifest/meta swapping

---

## Technical Details

### Public Site Behavior After Changes
- `manifest.json` with `display: "browser"` means iOS "Add to Home Screen" creates a bookmark that opens Safari
- Android Chrome "Add to Home Screen" will create a shortcut that opens in browser (not standalone mode)
- Service worker still works for caching/offline but won't trigger standalone mode
- No install prompts shown to public visitors

### Admin Site Behavior After Changes
- When on `/admin/*` routes, manifest switches to `/admin-manifest.json`
- `apple-mobile-web-app-capable` meta tag is injected for iOS
- Install banner appears after 2 page views (existing logic)
- Installing creates a standalone app that opens to `/admin`
- Proper safe area padding ensures no overlap with notch/home indicator

### Service Worker Considerations
- The service worker from vite-plugin-pwa will continue to work for all routes
- Caching and offline support remain intact
- `OfflineIndicator` and `PwaUpdateBanner` will still function on admin routes

---

## Rollback Safety
All changes are additive or modifiable. If issues arise:
- Revert `manifest.json` `display` back to `"standalone"`
- Remove the dynamic manifest swapping hook
- Restore the removed meta tags in `index.html`

---

## Summary of Files

| File | Action | Purpose |
|------|--------|---------|
| `public/admin-manifest.json` | Create | Admin-specific PWA manifest |
| `public/manifest.json` | Modify | Change display to "browser" for public |
| `index.html` | Modify | Remove PWA meta tags (injected dynamically for admin) |
| `src/hooks/useAdminPWA.ts` | Create | Dynamic manifest/meta swapping for admin routes |
| `src/components/pwa/InstallBanner.tsx` | Modify | Only show on admin routes, update messaging |
| `src/pages/Install.tsx` | Modify | Admin-focused installation instructions |
| `src/components/admin/AdminLayout.tsx` | Modify | Add safe area padding for PWA display |
| `src/App.tsx` | Modify | Use useAdminPWA hook |

