
Context / what you’re seeing
- In the invoice/estimate generator (`supabase/functions/generate-invoice-from-quote/index.ts`), the “Service Package” line item is always created (it’s not conditional), and its description is derived from `quote.service_type` via a helper function `formatServiceType()`.
- Your quote form + database currently use `service_type = 'delivery-only' | 'delivery-setup' | 'full-service'` (confirmed by frontend schema + submit payload code patterns), but the generator’s `formatServiceType()` mapping is missing `'delivery-only'` and instead has a legacy `'drop-off'` key.
- Because of that mismatch, when the quote has `service_type: 'delivery-only'`, the generator falls back to the default label `'Catering Service'`, which is exactly what you’re reporting (“I do not see the delivery only… instead of catering service”).

What fields are grouped into the “Service Package grouping” (in the estimate generator)
In `generate-invoice-from-quote/index.ts`, the “service package grouping” is:
1) Always-added base “Service Package” line item
   - title: `Service Package`
   - description: `formatServiceType(quote.service_type)`
   - quantity: `1`
   - category: `service`
   - sort_order: incrementing (Tier 5)
   - Source field: `quote.service_type`

2) Service add-ons (each becomes its own line item in the same `category: 'service'` group)
   - `quote.wait_staff_requested` → “Wait Staff Service”
   - `quote.bussing_tables_needed` → “Table Bussing Service”
   - `quote.ceremony_included` → “Ceremony Catering Service”
   - `quote.cocktail_hour` → “Cocktail Hour Service”
   These are separate line items, not merged into the “Service Package” line item—only grouped conceptually by category and sort order.

Root cause
- `supabase/functions/generate-invoice-from-quote/index.ts`:
  - `formatServiceType()` currently supports:
    - `'full-service'` → “Full Service Catering”
    - `'delivery-setup'` → “Delivery with Setup”
    - `'drop-off'` → “Drop Off Delivery”
    - otherwise → “Catering Service”
  - Missing: `'delivery-only'` (your actual stored value)
- Meanwhile the frontend utilities already support `'delivery-only'` (e.g., `src/utils/formatters.ts` and `src/utils/invoiceFormatters.ts`), so the inconsistency is specific to the edge function generator.

Plan to fix (code + data recovery)
1) Update the generator’s service type mapping to match the real system values
   - File: `supabase/functions/generate-invoice-from-quote/index.ts`
   - Change `formatServiceType()` mapping to include:
     - `'delivery-only'` → “Delivery Only” (or “Drop Off Delivery” if you want that phrasing consistently)
   - Keep legacy aliases to be safe (so older data still formats correctly):
     - `'drop-off'`, `'drop_off'`, etc.
   - Result: new invoices/estimates generated from quotes will correctly show “Delivery Only” instead of “Catering Service”.

2) Verify all other email/admin surfaces use the same service type labels
   - Quick audit targets (read-only verification first, then adjust if needed):
     - `supabase/functions/send-event-reminders/index.ts` (it formats service type for emails)
     - `_shared/emailTemplates.ts` (if it has its own mapping)
     - Any other edge function that includes service type text
   - Goal: ensure “Delivery Only” appears consistently everywhere.

3) Fix existing estimates already generated with the wrong label (“Catering Service”)
   You have two safe options; we can do either or both:

   Option A (recommended): Use your existing “Regenerate from Quote” workflow
   - Because the generator is described as the authoritative source and you already have a “Regenerate from Quote” action in the admin UI (per project memory), once the mapping is fixed, regenerating will rebuild the line items and correct the “Service Package” description.
   - Important behavior to confirm during implementation:
     - It should preserve manually set prices (as intended).
     - It should update descriptions/titles if they’re currently wrong.
   - This is the cleanest path because it keeps “quote → line items” logic centralized.

   Option B: Direct one-off patch for affected invoices
   - After mapping fix, we can identify invoices whose “Service Package” line item description is “Catering Service” but whose related quote had `service_type='delivery-only'`, then update that line item’s description.
   - This requires a small admin script/edge function or a SQL update (riskier without carefully joining invoice ↔ quote ↔ line items).
   - I’d only do this if you have many existing estimates and regenerating would be disruptive.

4) Acceptance checks (what you will see after the fix)
   - Create/generate a new estimate from a quote with `service_type = delivery-only`
   - In the estimate line items, the “Service Package” line item should read:
     - “Delivery Only” (or your chosen text)
   - No instances should fall back to “Catering Service” unless the stored `service_type` is genuinely unknown/blank.

Technical notes / why it happened
- The generator is still using an older naming convention (`'drop-off'`) while the modern system uses `'delivery-only'`.
- The frontend already uses the correct mapping, which is why the form summary may look correct but the generated invoice line item does not.

Scope of changes (expected)
- Primary fix:
  - `supabase/functions/generate-invoice-from-quote/index.ts` (mapping update)
- Possible consistency follow-up (only if found inconsistent during audit):
  - any email-related edge function that formats `service_type`

After approval (next step in default mode)
- I’ll implement the mapping fix in the edge function, deploy it, then we can regenerate the specific estimate for the event you’re on (`/admin/event/4b13d793-...`) to confirm it flips from “Catering Service” to “Delivery Only” without losing your priced amounts.
