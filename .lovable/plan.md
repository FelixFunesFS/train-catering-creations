
Goal
- Update the wording for the “chafers_requested” supply so it displays:
  - Delivery Only / Delivery with Setup / Drop Off: “Food Warmers with Fuel”
  - Full Service Catering: “Chafing Dishes with Fuel”
- Do this without breaking any existing workflows (quote submission, menu edit, regenerate line items, emails).

Key principle (best way to avoid breaking functionality)
- Do NOT change any database fields, booleans, IDs, or selection keys.
- Keep using the existing boolean: `quote_requests.chafers_requested` (and the internal supply id `chafers` in MenuEditorInline).
- Only change the *display text* (labels in UI) and the *generated description text* in line items.
- This ensures:
  - old quotes still load correctly
  - menu editor save logic still maps supplies back to the correct boolean
  - “Regenerate from Quote” still works
  - no migration is required

Where the text currently comes from (so we update all relevant generators)
There are multiple places that turn `chafers_requested` into text:

1) Invoice/estimate line item generation (authoritative for what you see in the estimate)
- Edge function: `supabase/functions/generate-invoice-from-quote/index.ts`
  - currently pushes: “Stainless steel chafers with fuel”
- Client-side regeneration: `src/utils/invoiceFormatters.ts`
  - currently pushes: “Stainless steel chafers with fuel”
  - this is commonly used by “Regenerate from Quote” and after menu edits

2) UI selection labels (what the user/admin clicks)
- Public quote form (alternate): `src/components/quote/alternative-form/FinalStep.tsx`
  - currently shows “Chafing Dishes with Fuel”
- Public quote form (step-based): `src/components/quote/steps/SuppliesStep.tsx`
  - currently shows “Chafing Dishes”
- Admin menu editor: `src/components/admin/events/MenuEditorInline.tsx`
  - currently shows “Chafing Dishes with Fuel” in SUPPLY_ITEMS
- Admin event detail badges: `src/components/admin/events/EventDetail.tsx`
  - currently shows “Chafing Dishes” badge (optional to update, but recommended for consistency)

3) Emails (recommended for consistency, even though you asked “line items”)
- Shared email supplies summary: `supabase/functions/_shared/emailTemplates.ts`
  - currently shows “Chafing Dishes”
- Admin quote notification email: `supabase/functions/send-quote-notification/index.ts`
  - currently shows “Chafing Dishes with Fuel”

Implementation approach (safe + consistent)

A) Add one tiny “label helper” (same logic in both places where line items are generated)
We’ll implement the same rule in:
- `supabase/functions/generate-invoice-from-quote/index.ts`
- `src/utils/invoiceFormatters.ts`

Helper behavior:
- If `quote.chafers_requested` is true:
  - If service type is “full-service” (and its legacy aliases), label = “Chafing Dishes with Fuel”
  - Else if service type is delivery-only / delivery-setup / drop-off (and legacy aliases), label = “Food Warmers with Fuel”
  - Else (unknown service type): default to the delivery-style label (“Food Warmers with Fuel”) to avoid accidentally implying full-service equipment

Then replace the current hardcoded push:
- from: “Stainless steel chafers with fuel”
- to: the service-type-aware label returned by the helper

Why this won’t break anything:
- It only changes a string in the description of the existing consolidated “Supply & Equipment Package” line item.
- No IDs change, no categories change, no schema changes.

B) Update the UI labels (selection text) without changing the underlying boolean/key
1) Public quote form (both variants)
- `src/components/quote/alternative-form/FinalStep.tsx`
- `src/components/quote/steps/SuppliesStep.tsx`

Implementation:
- Read/watch the current `service_type` from the form state.
- Display:
  - “Food Warmers with Fuel” when service type is delivery-only/delivery-setup/drop-off
  - “Chafing Dishes with Fuel” when service type is full-service
- Keep the field name `chafers_requested` exactly as-is.

2) Admin Menu Editor (full-page editor route you’re on now)
- `src/components/admin/events/MenuEditorInline.tsx`

Implementation:
- Build SUPPLY_ITEMS with a dynamic label for the `chafers` option based on `quote.service_type`.
- Keep the option id as `chafers` so saving still maps to `chafers_requested`.

3) (Optional but recommended) Admin EventDetail badges
- `src/components/admin/events/EventDetail.tsx`
- Change the badge label from a generic “Chafing Dishes” to the service-type-aware label.
- This is purely display; it won’t affect functionality.

C) Update email wording for consistency (recommended)
Even though your request is “line items,” emails currently render supplies too, and it’s confusing if the estimate says “Food Warmers with Fuel” but an email says “Chafing Dishes”.

We’ll update:
- `supabase/functions/_shared/emailTemplates.ts` (Supplies summary)
- `supabase/functions/send-quote-notification/index.ts` (Admin notification supplies list)

Using the same service-type-aware label logic.

D) How to update existing estimates already generated
Because line items are stored as text at the time of generation, existing invoices won’t magically change until regenerated.

Best safe method:
- Use your existing “Regenerate from Quote” (or “Save & Update Estimate” after menu edits).
- This will rebuild the line items from the quote and update the supplies description while preserving manual prices (per your system design).

Verification checklist
1) Create/adjust a quote with `chafers_requested = true` and test three service types:
- Delivery Only → Supply package description includes “Food Warmers with Fuel”
- Delivery with Setup → Supply package description includes “Food Warmers with Fuel”
- Full Service → Supply package description includes “Chafing Dishes with Fuel”

2) UI verification
- On the public quote form supplies step, the checkbox label changes appropriately after picking service type
- On the admin menu editor page (/admin/event/:id/menu), the supply option label shows the correct text
- After “Save & Update Estimate,” the estimate line item text matches the service type

3) Email verification (if we include the email updates)
- Preview or send a quote confirmation/admin notification and confirm supplies wording matches the service type.

Files we’ll update (expected)
Line items:
- supabase/functions/generate-invoice-from-quote/index.ts
- src/utils/invoiceFormatters.ts

UI labels:
- src/components/quote/alternative-form/FinalStep.tsx
- src/components/quote/steps/SuppliesStep.tsx
- src/components/admin/events/MenuEditorInline.tsx
- (optional) src/components/admin/events/EventDetail.tsx

Emails (recommended):
- supabase/functions/_shared/emailTemplates.ts
- supabase/functions/send-quote-notification/index.ts

Notes / edge cases
- Legacy service_type values (drop-off, drop_off, delivery_only, full_service) will be handled in the service-type check so older records still display correctly.
- If a quote is missing service_type entirely, we’ll default to “Food Warmers with Fuel” to avoid implying full-service equipment when it may be a drop-off style request.
