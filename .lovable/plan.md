

## Goal
Remove the PWA Install Banner from all views (desktop and mobile).

## Current State
In `src/App.tsx` line 114:
```tsx
{!hideChrome && !isAdminRoute && !isMobile && <InstallBanner />}
```

The banner currently shows only on desktop (after the previous change). Now we'll remove it entirely.

## Implementation

### Single Change in `src/App.tsx`
Remove the `<InstallBanner />` rendering line completely.

**Before:**
```tsx
{!hideChrome && !isAdminRoute && <Footer />}
{!hideChrome && !isAdminRoute && !isMobile && <InstallBanner />}
{showMobileActionBar && <MobileActionBar />}
```

**After:**
```tsx
{!hideChrome && !isAdminRoute && <Footer />}
{showMobileActionBar && <MobileActionBar />}
```

### Optional Cleanup
- Remove the `InstallBanner` import from `App.tsx` since it's no longer used
- The `InstallBanner.tsx` component file can remain in the codebase for future use if PWA install prompts are desired later

## What Still Works
- PWA installation is still available via the browser's native "Add to Home Screen" option
- The `/install` page with manual install instructions remains accessible
- `PwaUpdateBanner` (for notifying users of app updates) is unaffected
- `OfflineIndicator` is unaffected

## Verification
1. Navigate to any page on desktop - no install banner appears
2. Navigate to any page on mobile - no install banner appears
3. PWA can still be installed via browser menu

