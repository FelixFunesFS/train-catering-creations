

# Remove PWA + Clean Up Auth (Keep Email/Password Login)

## Summary

Strip out the PWA infrastructure so the admin page works as a normal website (bookmarkable to mobile home screens at any URL). Keep email/password + Google login. Remove `signUp` only. Keep the mobile admin nav bar at the bottom.

## Part 1: Remove PWA Infrastructure

### Files to delete (9 files)
- `src/hooks/useAdminPWA.ts` -- dynamic manifest swapping
- `src/hooks/usePWAInstall.ts` -- install prompt hook
- `src/components/pwa/InstallBanner.tsx` -- install banner UI
- `src/components/pwa/OfflineIndicator.tsx` -- offline indicator
- `src/components/pwa/PwaUpdateBanner.tsx` -- update banner
- `src/pages/Install.tsx` -- dedicated install page
- `public/sw.ts` -- service worker (caching layer)
- `public/admin.html` -- separate admin entry point
- `public/admin-manifest.json` -- admin standalone manifest
- `src/virtual-pwa-register.d.ts` -- PWA type definitions

### Files to edit

| File | Change |
|------|--------|
| `vite.config.ts` | Remove `VitePWA` import and plugin config (lines 5, 28-43). Remove `admin.html` from build inputs (lines 19-23, revert to default single entry) |
| `index.html` | Remove `<link rel="manifest" href="/manifest.json">` (line 18). Keep apple-touch-icon and theme-color (these help home screen bookmarks look nice without PWA) |
| `src/App.tsx` | Remove `useAdminPWA` import/call. Remove `OfflineIndicator`, `PwaUpdateBanner` lazy imports and `<Suspense>` renders. Remove `/install` route |
| `src/components/admin/AdminLayout.tsx` | Remove `InstallBanner` import and `<InstallBanner />` render |
| `public/manifest.json` | Keep but simplify -- remove `shortcuts`, keep just name/icons/theme for bookmark appearance. Set `display: "browser"` (already is) |

### What stays
- `public/sw-push.js` -- push notifications are independent, still needed
- `public/manifest.json` -- simplified, for bookmark icon/theme
- `MobileAdminNav.tsx` -- the bottom nav bar stays exactly as-is
- `vite-plugin-pwa` can be removed from `package.json` dependencies

## Part 2: Clean Up Auth (Keep Email/Password, Remove Sign Up)

### `src/hooks/useAuth.tsx`
- Remove `signUp` function (lines 154-170)
- Remove `signUp` from context type and provider value
- Keep: `signIn` (email/password), `signInWithGoogle`, `resetPassword`, `signOut`, `checkAdminAccess`

### `src/pages/AdminAuth.tsx`
- No structural changes needed -- the page already has email/password sign in + Google + password reset
- It has no sign-up UI, so removing `signUp` from the hook is purely a code cleanup

### Access control chain (stays as-is, nothing to remove)
The protection is a 3-layer system, all of which are necessary:

```text
Layer 1: useAuth (onAuthStateChange)
  - On any sign-in, calls checkAdminAccess(userId)
  - If user has no admin role -> immediate signOut + "Access denied" toast
  - This catches unauthorized users at login time

Layer 2: ProtectedRoute component
  - Wraps all /admin/* and /staff routes
  - While loading: shows spinner
  - No user: redirects to /admin/auth
  - Not admin (via usePermissions): redirects to /admin/auth
  - This is the backup gate for direct URL access

Layer 3: usePermissions hook
  - Calls has_role RPC (SECURITY DEFINER) to check admin role
  - Used by ProtectedRoute for the isAdmin() check
  - Also provides granular canAccess() for future role expansion

Layer 4: Database RLS
  - All tables use has_role(auth.uid(), 'admin') in RLS policies
  - Even if client-side checks were bypassed, data access is blocked
```

None of these layers should be removed -- they each serve a distinct purpose (login-time rejection, route-level gating, permission granularity, and database-level enforcement).

## What does NOT change
- Mobile admin nav bar (bottom nav with Events/Billing/Staff/Settings/Logout) -- stays exactly as-is
- All admin route protection (ProtectedRoute, usePermissions, has_role RPC, database RLS)
- Push notification support (sw-push.js)
- Email/password login + Google OAuth login
- Password reset functionality
- "Access denied" behavior for users without admin role
