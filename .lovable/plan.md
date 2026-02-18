

## Fix: Update remaining "10/50/40" references to "10/40/50"

Two locations still reference the old label:

### 1. `src/components/admin/events/PaymentScheduleSection.tsx` (line 66)
- Change `'STANDARD (10/50/40)'` to `'STANDARD (10/40/50)'`
- This is the label shown in the admin billing panel for standard-tier events

### 2. `supabase/functions/generate-invoice-from-quote/index.ts` (line 418)
- Change the comment from `Standard (45+) = 10/50/40` to `Standard (45+) = 10/40/50`
- Code-only comment, no runtime impact, but keeps documentation accurate

Both are one-line string/comment changes with zero logic impact.
