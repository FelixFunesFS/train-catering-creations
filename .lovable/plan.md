

# Fix: Restore Normal Font Size, Use Compact Column Widths Instead

## Problem
The `lg:text-xs` class on the Table makes all text noticeably smaller than the rest of the admin UI. The user wants normal font size with columns that simply fit without scrolling.

## Approach
Instead of shrinking font size globally, we keep the default `text-sm` and only slightly reduce horizontal padding. The key insight is that 11 columns at `text-sm` can fit at 1024px if we use tighter padding (`px-2` instead of `px-4`) — we don't need to shrink the text.

### Changes to `EventList.tsx` (single file)

**Line 556** — Remove `lg:text-xs`, keep only reduced padding:
```
<Table className="[&_th]:lg:px-2 [&_td]:lg:px-2">
```

This keeps the default `text-sm` font size (matching the rest of the admin), while the reduced horizontal padding (`px-2` vs default `px-4`) saves ~22px per column × 11 columns = ~242px — enough to fit all columns at 1024px without horizontal scroll.

No other changes needed. All breakpoints, logic, and workflows remain untouched.

