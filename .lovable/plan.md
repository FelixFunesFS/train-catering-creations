
# Date Parsing Fix: Complete Implementation Plan

## Problem Summary

When dates like `2026-02-14` are stored in the database and parsed with `new Date("2026-02-14")`, JavaScript interprets them as UTC midnight, shifting the displayed date backwards by one day for Eastern Time users.

**Example:** Database stores `2026-02-14` -> Displays as `February 13, 2026`

## Root Cause

```
Database: "2026-02-14" (pure calendar date)
           ↓
new Date("2026-02-14") → February 14, 2026 00:00:00 UTC
           ↓
toLocaleDateString({timeZone: 'America/New_York'})
           ↓
Display: "February 13, 2026" (shifted backwards!)
```

## Solution: Use Local Date Parsing

The codebase already has the correct utility in `src/utils/dateHelpers.ts`:

```typescript
export function parseDateFromLocalString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);  // Local midnight, not UTC
}
```

This parses the date components directly, creating a Date at local midnight instead of UTC midnight.

---

## Files to Modify

### Phase 1: Central Formatters (2 files)

**1. `src/utils/formatters.ts`** - Fix frontend date formatters

| Line | Current | Fix |
|------|---------|-----|
| 19-27 | `new Date(dateString)` | Use `parseDateFromLocalString()` |
| 32-40 | `new Date(dateString)` | Use `parseDateFromLocalString()` |

Changes:
- Import `parseDateFromLocalString` from `./dateHelpers`
- Update `formatDate()` to parse locally before formatting
- Update `formatDateShort()` to parse locally before formatting
- Remove `timeZone` option since dates are now local

**2. `src/utils/dateHelpers.ts`** - Add display formatters

Add new helper functions:
- `formatDateForDisplay(dateStr, format)` - Centralized display formatting
- Reuse `parseDateFromLocalString()` internally

---

### Phase 2: Admin Frontend Components (7 files)

**3. `src/components/admin/events/EventDetailsPanelContent.tsx`**
- Line 10: Import `parseDateFromLocalString` from dateHelpers
- Line 58: Change `new Date(quote.event_date)` to `parseDateFromLocalString(quote.event_date)`
- Line 164: Already uses `formatDate()` from formatters (fixed by Phase 1)

**4. `src/components/admin/events/EventList.tsx`**
- Line 2: Keep `parseISO` from date-fns for sorting (works correctly for comparisons)
- Line 373: Change `format(new Date(event.event_date), ...)` to use local parsing
- Line 605: Same fix

**5. `src/components/admin/events/EventDetail.tsx`**
- Line 219: Change `format(new Date(quote.event_date), ...)` to use local parsing

**6. `src/components/admin/events/SubmissionsCard.tsx`**
- Lines 133, 183, 188: Change `format(new Date(event.event_date), ...)` to use local parsing

**7. `src/components/admin/billing/PaymentList.tsx`**
- Line 201: Change `format(new Date(invoice.event_date), ...)` to use local parsing

**8. `src/components/admin/settings/EmailTemplatePreview.tsx`**
- Line 300: Change `new Date(selectedQuote.event_date).toLocaleDateString()` to use shared formatter

**9. `src/components/quote/ReviewSummaryCard.tsx`**
- Lines 15-25: Replace local `formatDate()` function with import from `@/utils/formatters`

---

### Phase 3: Edge Functions (4 files)

**10. `supabase/functions/_shared/dateHelpers.ts`** - Add display formatter

Add new function:
```typescript
export function formatDateForDisplay(dateStr: string | null, format: 'long' | 'short' = 'long'): string {
  if (!dateStr) return 'TBD';
  const date = parseDateString(dateStr);  // Uses local parsing
  // Format without timeZone option (already local)
}
```

**11. `supabase/functions/_shared/emailTemplates.ts`**
- Line 179-188: Update `formatDate()` to use local parsing via `parseDateString()`
- Line 263-269: Update `fmtDate()` inside `generateEventDetailsCard()` to use local parsing

**12. `supabase/functions/generate-invoice-pdf/index.ts`**
- Lines 117-126: Update `formatDate()` to use local parsing
- Lines 129-137: Update `formatShortDate()` to use local parsing

**13. `supabase/functions/preview-email/index.ts`**
- Lines 29, 78, 86-87: Update sample date generation to use `formatDateToString()` instead of `toISOString().split('T')[0]`

---

## Technical Details

### Frontend Pattern (after fix)

```typescript
// src/utils/formatters.ts
import { parseDateFromLocalString } from './dateHelpers';

export function formatDate(dateString: string): string {
  const date = parseDateFromLocalString(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### Edge Function Pattern (after fix)

```typescript
// supabase/functions/_shared/emailTemplates.ts
import { parseDateString } from './dateHelpers.ts';

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'TBD';
  const date = parseDateString(dateStr);  // Local parsing
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};
```

### date-fns `format()` Pattern (after fix)

```typescript
// Components using date-fns
import { format } from 'date-fns';
import { parseDateFromLocalString } from '@/utils/dateHelpers';

// Before: format(new Date(event.event_date), 'MMM d, yyyy')
// After:
format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')
```

---

## What Remains Unchanged

| Area | Reason |
|------|--------|
| Date storage logic | Already uses `formatDateToLocalString()` correctly |
| Time handling | Times are stored as HH:MM strings, no timezone issues |
| Date comparisons for sorting | `parseISO()` works fine for relative comparisons |
| Timestamp fields (`created_at`, `updated_at`) | These are full ISO timestamps, different handling |

---

## Validation After Implementation

Create/view an event with date `February 14, 2026` and verify these all show the correct date:

| Location | Expected Display |
|----------|------------------|
| Event Details Panel (Admin) | "Saturday, February 14, 2026" |
| Event List table | "Feb 14, 2026" |
| SubmissionsCard | "Feb 14, 2026" |
| EventDetail page | "Saturday, February 14, 2026" |
| PaymentList | "Feb 14, 2026" |
| Customer Portal | "Saturday, February 14, 2026" |
| Email Preview | "Saturday, February 14, 2026" |
| Sent Customer Email | "Saturday, February 14, 2026" |
| Generated PDF | "Sat, Feb 14, 2026" |
| Quote Review Summary (form) | "Saturday, February 14, 2026" |

---

## Summary

| Phase | Files | Changes |
|-------|-------|---------|
| Phase 1 | 2 | Central formatters in `src/utils/` |
| Phase 2 | 7 | Admin frontend components |
| Phase 3 | 4 | Edge functions (emails, PDFs, previews) |
| **Total** | **13** | All date display locations fixed |

This surgical fix updates only the display parsing logic without touching:
- Database schema
- Date storage logic
- Time handling
- Any business logic
