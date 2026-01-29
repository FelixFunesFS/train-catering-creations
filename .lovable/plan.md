

# Complete Date Bug Fix - Formal Quote Form + Remaining Edge Functions

## Summary of Analysis

The date helpers (`src/utils/dateHelpers.ts` and `supabase/functions/_shared/dateHelpers.ts`) were already created in the previous fix. Now we need to apply them to the remaining files that still use the problematic `toISOString().split('T')[0]` pattern.

---

## Files Requiring Updates

### 1. Frontend - Formal/Wedding Quote Form

**File:** `src/components/quote/alternative-form/ContactAndEventStep.tsx`

**Current (Line 360):**
```typescript
onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
```

**Fixed:**
```typescript
import { formatDateToLocalString } from "@/utils/dateHelpers";
// ...
onChange={(date) => field.onChange(date ? formatDateToLocalString(date) : undefined)}
```

**Also fix Line 359 (value parsing):**
```typescript
// Current: value={field.value ? new Date(field.value) : undefined}
// Fixed: value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
```

This matches the fix already applied to `EventDetailsStep.tsx`.

---

### 2. Edge Functions - generate-invoice-from-quote

**File:** `supabase/functions/generate-invoice-from-quote/index.ts`

**Import at top:**
```typescript
import { formatDateToString, subtractDaysFromDate } from '../_shared/dateHelpers.ts';
```

**Affected lines and fixes:**

| Line | Current | Fixed |
|------|---------|-------|
| 374 | `new Date(Date.now() + 30 * 24...).toISOString().split('T')[0]` | `formatDateToString(new Date(Date.now() + 30 * 24...))` |
| 442 | `dueDate.toISOString().split('T')[0]` | `formatDateToString(dueDate)` |
| 455 | `new Date().toISOString().split('T')[0]` | `formatDateToString(new Date())` |
| 470 | `new Date().toISOString().split('T')[0]` | `formatDateToString(new Date())` |
| 480 | `finalDue.toISOString().split('T')[0]` | `formatDateToString(finalDue)` |
| 498 | `new Date().toISOString().split('T')[0]` | `formatDateToString(new Date())` |
| 506 | `finalDue.toISOString().split('T')[0]` | `formatDateToString(finalDue)` |
| 524 | `new Date().toISOString().split('T')[0]` | `formatDateToString(new Date())` |
| 534 | `midDue.toISOString().split('T')[0]` | `formatDateToString(midDue)` |
| 544 | `finalDue.toISOString().split('T')[0]` | `formatDateToString(finalDue)` |

---

### 3. Edge Functions - event-timeline-generator

**File:** `supabase/functions/event-timeline-generator/index.ts`

**Import at top:**
```typescript
import { formatDateToString, parseDateString, getTodayString } from '../_shared/dateHelpers.ts';
```

**Affected lines and fixes:**

| Line | Current | Fixed |
|------|---------|-------|
| 143 | `.gte('event_date', new Date().toISOString().split('T')[0])` | `.gte('event_date', getTodayString())` |
| 178 | `const eventDate = new Date(quote.event_date)` | `const eventDate = parseDateString(quote.event_date)` |
| 187 | `new Date(new Date().toISOString().split('T')[0])` | `parseDateString(getTodayString())` |
| 193 | `dueDate.toISOString()` | `formatDateToString(dueDate) + 'T00:00:00.000Z'` (or just `formatDateToString(dueDate)` if column is DATE type) |
| 206 | `new Date(new Date().toISOString().split('T')[0])` | `parseDateString(getTodayString())` |
| 212 | `setupDate.toISOString()` | `formatDateToString(setupDate)` |
| 225 | `new Date(new Date().toISOString().split('T')[0])` | `parseDateString(getTodayString())` |
| 231 | `largeEventDate.toISOString()` | `formatDateToString(largeEventDate)` |

---

### 4. Edge Functions - auto-workflow-manager

**File:** `supabase/functions/auto-workflow-manager/index.ts`

**Import at top:**
```typescript
import { getTodayString, formatDateToString } from '../_shared/dateHelpers.ts';
```

**Affected lines and fixes:**

| Line | Current | Fixed |
|------|---------|-------|
| 121 | `yesterday.toISOString().split('T')[0]` | `formatDateToString(yesterday)` |
| 177-178 | `...toISOString().split('T')[0]` (2 occurrences) | Use `getTodayString()` and `formatDateToString()` |

---

### 5. Edge Functions - send-event-followup

**File:** `supabase/functions/send-event-followup/index.ts`

**Import at top:**
```typescript
import { getTodayString, formatDateToString, subtractDays } from '../_shared/dateHelpers.ts';
```

**Affected lines and fixes:**

| Line | Current | Fixed |
|------|---------|-------|
| 73 | `yesterdayStart.toISOString().split('T')[0]` | Use `subtractDays(getTodayString(), 1)` |
| 74 | `yesterdayEnd.toISOString().split('T')[0]` | Use same date string (both are the same date) |

Simplified approach - replace the complex yesterday calculation (lines 53-61) with:
```typescript
const yesterdayStr = subtractDays(getTodayString(), 1);
```

Then use `yesterdayStr` for both `.gte()` and `.lte()` filters.

---

### 6. Frontend Service - EventDataService.ts

**File:** `src/services/EventDataService.ts`

**Import at top:**
```typescript
import { formatDateToLocalString, parseDateFromLocalString } from '@/utils/dateHelpers';
```

**Affected lines and fixes:**

| Line | Current | Fixed |
|------|---------|-------|
| 98 | `filters.dateRange.start.toISOString().split('T')[0]` | `formatDateToLocalString(filters.dateRange.start)` |
| 99 | `filters.dateRange.end.toISOString().split('T')[0]` | `formatDateToLocalString(filters.dateRange.end)` |
| 120 | `const eventDate = new Date(qr.event_date)` | `const eventDate = parseDateFromLocalString(qr.event_date)` |
| 255 | `const eventDate = new Date(data.event_date)` | `const eventDate = parseDateFromLocalString(data.event_date)` |

---

## Impact Analysis

### What This Fixes

| Component | Current Bug | After Fix |
|-----------|-------------|-----------|
| Formal/Wedding quote form | Date picker saves previous day | Correct date saved |
| Invoice generation milestones | Due dates may shift by 1 day | Accurate due dates |
| Timeline tasks | Task due dates off by 1 day | Correct scheduling |
| Auto-complete workflow | Events marked complete on wrong day | Triggers on correct day |
| Post-event follow-ups | Emails sent 1 day early/late | Sent on correct day |
| Admin date range filters | May miss events at range boundaries | Accurate filtering |

### Backward Compatibility

The date helpers already exist and are tested in other functions. These changes:
- Use the same proven patterns
- Don't modify database schema
- Don't change API contracts
- Only affect how dates are formatted/parsed in JavaScript

### Risk Assessment

**Low Risk**: All changes follow the same pattern already implemented and tested in `EventDetailsStep.tsx`, `unified-reminder-system`, and other updated functions.

---

## Testing Verification

After implementation, verify:

1. **Formal Quote Form**: Submit a wedding quote, confirm date stored correctly
2. **Regular Quote Form**: Verify still works (already fixed)
3. **Invoice Generation**: Generate invoice, check milestone due dates
4. **Admin Calendar**: Confirm date range filtering works correctly
5. **Auto-Workflow**: Monitor that events complete on the correct day
6. **Timeline Tasks**: Verify task due dates are accurate

---

## Files Summary

| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `src/components/quote/alternative-form/ContactAndEventStep.tsx` | Add import + fix date picker | 2 lines |
| `src/services/EventDataService.ts` | Add import + fix date conversions | 5 lines |
| `supabase/functions/generate-invoice-from-quote/index.ts` | Add import + fix 10 date conversions | ~12 lines |
| `supabase/functions/event-timeline-generator/index.ts` | Add import + fix 8 date conversions | ~10 lines |
| `supabase/functions/auto-workflow-manager/index.ts` | Add import + fix 3 date conversions | ~5 lines |
| `supabase/functions/send-event-followup/index.ts` | Add import + simplify yesterday logic | ~5 lines |

