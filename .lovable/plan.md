
# Date Off-By-One Bug Fix

## Root Cause Analysis

The date picker in `EventDetailsStep.tsx` (line 251) uses `toISOString().split('T')[0]` to convert the selected date to a string:

```typescript
onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
```

**Why This Causes the Bug:**

When a user in Charleston (Eastern Time, UTC-5) selects "March 15, 2026" at any time before 7:00 PM local time:
1. The Calendar component returns a `Date` object representing March 15, 2026 at 00:00:00 LOCAL time
2. `toISOString()` converts this to UTC, shifting it BACK by 5 hours
3. Result: `2026-03-14T19:00:00.000Z` (March 14th in UTC)
4. After `.split('T')[0]`: `"2026-03-14"` - **THE WRONG DATE**

---

## Impact Assessment

### Frontend (Form Input)
| Location | File | Issue |
|----------|------|-------|
| Event Date Picker | `EventDetailsStep.tsx:251` | Date stored as previous day |

### Frontend (Date Display)
| Location | File | Status |
|----------|------|--------|
| Admin event lists | Uses `format(new Date(event_date), ...)` | **OK** - displays stored date correctly |
| Email template preview | Uses `toLocaleDateString()` | **OK** - displays correctly |

### Backend (Edge Functions)
| Function | Usage | Impact |
|----------|-------|--------|
| `generate-payment-milestones` | `new Date(quote.event_date)` for milestone calculations | **AFFECTED** - milestone due dates could shift |
| `unified-reminder-system` | Compares dates using `toISOString().split('T')[0]` | **AFFECTED** - reminders could fire on wrong day |
| `send-event-reminders` | Date comparisons | **AFFECTED** - 7-day/2-day reminders off by 1 day |
| `event-timeline-generator` | Task due date calculations | **AFFECTED** - timeline tasks off by 1 day |
| `_shared/emailTemplates.ts` | `formatDate()` with `timeZone: 'America/New_York'` | **OK** - displays correctly |

### Database Storage
The `quote_requests.event_date` column stores a `DATE` type (no time component), so once the wrong date string is inserted, it's persisted incorrectly.

---

## Solution Strategy

Create a **locale-aware date formatting utility** that extracts the local date components instead of using UTC conversion.

### The Fix

Replace `toISOString().split('T')[0]` with a utility function:

```typescript
// src/utils/dateHelpers.ts
/**
 * Format a Date object to YYYY-MM-DD string using LOCAL timezone
 * Prevents the off-by-one day bug caused by UTC conversion
 */
export function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object in LOCAL timezone
 * Use this instead of new Date(dateString) to avoid timezone shifts
 */
export function parseDateFromLocalString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```

---

## Files to Modify

### 1. Create Date Helpers Utility
**File:** `src/utils/dateHelpers.ts` (NEW)

Create centralized date utilities:
- `formatDateToLocalString(date: Date): string` - Local date to YYYY-MM-DD
- `parseDateFromLocalString(dateStr: string): Date` - YYYY-MM-DD to local Date
- Document the timezone handling approach

### 2. Fix Form Date Picker
**File:** `src/components/quote/steps/EventDetailsStep.tsx`

Change line 251 from:
```typescript
onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
```
To:
```typescript
onChange={(date) => field.onChange(date ? formatDateToLocalString(date) : undefined)}
```

### 3. Update Form Schema Validation
**File:** `src/components/quote/alternative-form/formSchema.ts`

Update the `event_date` validation refinement (lines 28-39) to use the local date parsing utility for accurate date comparison.

### 4. Update Payment Scheduling Utilities
**File:** `src/utils/paymentScheduling.ts`

Replace `toISOString().split('T')[0]` calls (lines 210, 212) with `formatDateToLocalString()`.

### 5. Update Payment Milestone Service
**File:** `src/services/PaymentMilestoneService.ts`

Replace line 63:
```typescript
due_date: typeof payment.due_date === 'string' ? null : payment.due_date.toISOString().split('T')[0],
```
With the local date formatter.

### 6. Update Edge Functions (Deno)
Create a shared date helper in `supabase/functions/_shared/dateHelpers.ts` with the same logic, then update:

| Edge Function | Lines to Update |
|---------------|-----------------|
| `generate-payment-milestones/index.ts` | Lines 144, 157, 189, 201, 232, 244, 284, 296, 308 |
| `unified-reminder-system/index.ts` | Lines 45, 145, 259, 336, 393, 448 |
| `send-event-reminders/index.ts` | Lines 44, 45 |
| `update-quote-workflow/index.ts` | Line 266 |
| `token-renewal-manager/index.ts` | Line 98 |

---

## Backward Compatibility

**Existing Data:**
- Dates already stored in the database may be off by one day
- The fix only prevents NEW submissions from having the issue
- A data migration script could be provided separately if needed

**Display Functions:**
- Functions like `formatDate()` in `src/utils/formatters.ts` already use `timeZone: 'America/New_York'` for display, so they'll continue to show dates correctly after the fix

---

## Testing Verification

After implementation, verify:

1. **Form Submission:** Select a date (e.g., March 15), submit form, check database stores "2026-03-15"
2. **Edge Cases:** Test dates at midnight, early morning, late evening
3. **Admin Display:** Confirm admin dashboard shows correct date
4. **Customer Emails:** Verify emails display correct event date
5. **Payment Milestones:** Check milestone due dates are calculated correctly
6. **Reminders:** Verify 7-day and 2-day reminders fire on correct dates

---

## Summary

| Category | Fix |
|----------|-----|
| **Root Cause** | `toISOString()` converts to UTC, shifting dates |
| **Solution** | Use local timezone components (getFullYear, getMonth, getDate) |
| **Frontend Changes** | 3 files (helpers, form step, schema) |
| **Backend Changes** | 2 files (services) |
| **Edge Functions** | 5 functions + 1 shared helper |
| **Risk Level** | Low - isolated change to date formatting only |
