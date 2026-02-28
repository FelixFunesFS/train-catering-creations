

## Vegetarian Quantity: Current State and What Needs Fixing

### How it works today

- The quote form has **two separate fields** side by side: "Vegetarian Portions" (a number input) and "Vegetarian Entrées" (a multi-select dropdown)
- There is cross-field validation: if portions > 0, the form shows an error saying "select at least one entrée" — but this is a **soft error** (uses `form.setError` manually, does not block submission)
- The portions field (`guest_count_with_restrictions`) is defined as `z.string().optional()` in the schema — so it can be left blank even when entrees are selected
- **The reverse validation is missing**: if a user selects vegetarian entrées but leaves portions blank, the form submits with no quantity, and invoice generation defaults to `1` — which then gets hidden everywhere because display logic only shows quantities > 1

### The core gap

Selecting vegetarian entrées without entering a portion count creates invisible "×1" line items. The form should **require** a portion count when entrées are selected (and vice versa).

### Plan (3 targeted changes)

**1. Add reverse cross-field validation in `MenuSelectionStep.tsx`**

Update the existing `useEffect` validation block (lines 105-117) to also check the reverse case: if vegetarian entrées are selected but portions is 0 or empty, set an error on `guest_count_with_restrictions` saying "Please enter the number of vegetarian portions." This keeps the soft-error pattern already in use — no schema changes needed, no submission blocking changes.

**2. Fix invoice generation fallback in `generate-invoice-from-quote/index.ts`**

Line 96: Change fallback from `1` to `0`. Line 93: Only create the vegetarian line item when `vegCount > 0` OR when entrees exist (in which case default to `1` as a minimum). This prevents phantom quantity-1 items when the field was truly empty.

**3. Always show quantity for dietary items in display layers**

- `EstimateLineItems.tsx` line 61: Change `item.quantity > 1` to `(item.quantity > 1 || item.category === 'dietary')` so vegetarian portions always show their count
- `emailTemplates.ts` lines 537 and 944: Same condition change so emails show "×1" for vegetarian items instead of hiding it

### Files modified

1. `src/components/quote/alternative-form/MenuSelectionStep.tsx` — add reverse validation (entrees selected → require portions)
2. `supabase/functions/generate-invoice-from-quote/index.ts` — fix vegCount fallback logic
3. `src/components/customer/EstimateLineItems.tsx` — always show dietary item quantities
4. `supabase/functions/_shared/emailTemplates.ts` — always show dietary item quantities in emails

### What does NOT change

- Form schema (`formSchema.ts`) — no changes needed, validation stays in the component
- Form layout — both fields stay side by side, same inputs
- Admin editor — already allows direct quantity editing on line items
- No database changes

