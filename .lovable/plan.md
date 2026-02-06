

## Remove Public Navbar Spacing from Admin/Staff Portal

### Problem
The public website has a fixed navigation bar, so `App.tsx` adds top padding (`pt-16 lg:pt-[72px]`) to the main content area. This padding is applied to admin and staff routes too, even though the public header already returns `null` on those routes. This creates the extra space you're seeing above the admin title.

### Fix (1 file)

**`src/App.tsx`** (line 70)
- Add `isAdminRoute` to the `hideChrome` condition so that admin and staff pages skip the top padding entirely

```
// Before
const hideChrome = isEventFullView || isEventMenuEdit || isEstimatePrint || isQuoteWizardRoute;

// After
const hideChrome = isAdminRoute || isEventFullView || isEventMenuEdit || isEstimatePrint || isQuoteWizardRoute;
```

This single change removes the extra top padding for all `/admin` and `/staff` routes. The Header and Footer already handle their own hiding for admin routes, so adding `isAdminRoute` here just aligns the padding logic with what's already happening.

No other files need changes. Mobile bottom nav and all other functionality remain unaffected.

