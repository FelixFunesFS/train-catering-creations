

## Goal
Remove the PWA Install Banner on mobile views and ensure the mobile action bar (Request Quote/Text Us) is properly sized and responsive.

## Current State Analysis

### PWA Install Banner (`src/components/pwa/InstallBanner.tsx`)
- Positioned at `fixed bottom-0 left-0 right-0 z-50`
- Shows after 2 page views on devices where PWA install is available
- **Problem**: Conflicts with `MobileActionBar` which is also at `bottom-0 z-40`
- When both show, they overlap and create a poor mobile experience

### Mobile Action Bar (`src/components/mobile/MobileActionBar.tsx`)
- Contains: "Request Quote" (primary CTA) and "Text Us" buttons
- Uses `size="responsive-xl"` = `min-h-[52px] px-12 py-4 text-lg`
- Already mobile-first with good touch targets (52px minimum height)

### App.tsx Integration
- Line 114: `{!hideChrome && !isAdminRoute && <InstallBanner />}` - shows on all public pages
- Line 115: `{showMobileActionBar && <MobileActionBar />}` - shows on mobile only

## Solution

### A) Hide Install Banner on Mobile
Update `App.tsx` to only show `<InstallBanner />` on desktop devices. This removes the PWA download prompt from mobile views entirely, eliminating the overlap with the action bar.

**Change in App.tsx:**
```tsx
// Before:
{!hideChrome && !isAdminRoute && <InstallBanner />}

// After:
{!hideChrome && !isAdminRoute && !isMobile && <InstallBanner />}
```

### B) Refine Mobile Action Bar Button Sizing
The current `responsive-xl` size may be too large on small phones. Adjust to a more balanced sizing that works well across all mobile device widths:

**Changes in MobileActionBar.tsx:**
1. Change button size from `responsive-xl` to `responsive-lg` for better fit on smaller phones
2. Adjust icon sizing to be proportional
3. Ensure proper touch target minimums (48px) while not being overly large

**Updated button styling:**
```tsx
<Button
  asChild
  variant="cta"
  size="responsive-lg"  // Changed from responsive-xl
  className="flex-1"
>
```

### C) Optional: Add Call Button
Since the user mentioned "get quote/send text/call", consider whether a third "Call" button should be added. However, this may crowd the mobile bar.

**Recommendation**: Keep the two-button layout (Request Quote + Text Us) for simplicity. The phone number is accessible via the Text Us flow or footer.

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `!isMobile` condition to InstallBanner rendering |
| `src/components/mobile/MobileActionBar.tsx` | Adjust button sizes from `responsive-xl` to `responsive-lg` |

## What Will NOT Change
- PWA functionality (install still works from browser menu)
- Desktop PWA banner behavior (will continue to show)
- Form submission flows
- Text message (sms:) protocol handling
- Mobile action bar visibility logic (admin/quote wizard exclusions)

## Technical Details

### Button Size Comparison
```text
responsive-xl: min-h-[52px] px-12 py-4 text-lg  (current)
responsive-lg: min-h-[48px] px-10 py-3 text-base (proposed)
```

The `responsive-lg` size provides:
- 48px minimum height (meets Apple/Google touch target guidelines)
- Slightly smaller horizontal padding for better fit on narrow phones
- Base text size that's still readable

### Z-Index Stack
After changes:
- Mobile Action Bar: `z-40` at bottom (only element at bottom on mobile)
- Offline Indicator / PWA Update Banner: `z-50` at top (for critical notifications)

## Verification
1. Open site on mobile device or mobile emulator
2. Verify PWA Install Banner does NOT appear
3. Verify Mobile Action Bar shows with properly sized buttons
4. Test "Request Quote" navigates to `/request-quote`
5. Test "Text Us" opens SMS app with correct number
6. Verify buttons are easily tappable on both small and large phones

