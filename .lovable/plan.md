
Goal
- Remove the “otherwise” fallback label “Catering Service” anywhere service type is formatted for estimates/line items.
- Fix “Edit Menu Selections” so it’s a full-page editor (not a modal) and always scrollable on desktop, matching your request and avoiding viewport/overflow issues.

What’s happening now (confirmed from code + data)
1) Why you still see “Catering Service”
- The event you’re on has `quote_requests.service_type = 'delivery-only'` (confirmed in DB for `4b13d793-8c4f-4048-a02d-8c72ac456794`).
- There are two different “generators” that can create/regenerate line items:
  - The Edge Function `supabase/functions/generate-invoice-from-quote/index.ts` (used when initially generating an invoice)
  - The client-side regeneration path `QuoteUpdateService.updateInvoiceLineItems(...)` which uses `src/utils/invoiceFormatters.ts` (`generateProfessionalLineItems`) (used by “Regenerate from Quote” and also after menu edits)
- We updated the edge function mapping, but **the client-side invoice formatter still has a fallback**:
  - `src/utils/invoiceFormatters.ts -> formatServiceType()` returns `... || 'Catering Service'`
- So if your line items were generated/regenerated via the client path (very common), you can still get the “Catering Service” default.

2) Why “Edit Menu Selections” doesn’t scroll reliably
- In desktop `EventEstimateFullView`, “Edit Menu Selections” opens inside a Radix `DialogContent`.
- `MenuEditorInline` internally wraps everything in a `ScrollArea className="flex-1 min-h-0"`.
- But the dialog content is not structured as a proper `flex flex-col` container with a constrained height for the ScrollArea to calculate against, so the ScrollArea can end up with no effective height to scroll within (classic nested flex/overflow issue).
- You explicitly chose “Full-page editor” which avoids this entire class of modal scroll issues.

Decisions (based on your answers)
- Service label when missing/unrecognized: “do not display in item”
  - Interpreting this as: do not show the “Service Package” description when not recognized; and do not substitute “Catering Service” ever.
- Menu edit scrolling: Full-page editor

Implementation changes

A) Remove “Catering Service” fallback everywhere it can appear in estimates
1) Update client-side formatter used for regeneration
- File: `src/utils/invoiceFormatters.ts`
- Change `formatServiceType(serviceType)` to:
  - Return a mapped label for recognized values
  - Return `''` (empty string) for unknown/missing values
  - Never return “Catering Service”

2) Ensure “Service Package” line item doesn’t show an “unknown” description
- File: `src/utils/invoiceFormatters.ts`
- Update `createServicePackage(quote)` (and any other service line-item creator) so:
  - If `formatServiceType(...)` returns `''`, then:
    - either omit the Service Package line item entirely (preferred per “do not display in item”), OR
    - include it with an empty description only if you want the placeholder line item to exist
  - I’ll implement the “omit the line item” behavior to match your instruction.

3) Keep edge function consistent (defense-in-depth)
- File: `supabase/functions/generate-invoice-from-quote/index.ts`
- Update `formatServiceType(...)` there as well:
  - Remove the `|| 'Catering Service'` fallback
  - Return `''` if unknown
- Update the line item creation logic so:
  - If formatted service type is `''`, do not add the “Service Package” line item.

Result
- If the service type is valid (`delivery-only`, `delivery-setup`, `full-service`), it will always show the correct label.
- If it’s ever missing/unknown, the estimate will not silently display “Catering Service”.

B) Convert “Edit Menu Selections” to a full-page editor (desktop)
1) Add a new protected admin route
- File: `src/App.tsx`
- Add:
  - `/admin/event/:quoteId/menu` → ProtectedRoute → new page component (see next step)
- Update `hideChrome` logic so Header/Footer remain hidden on this route too, consistent with the full-viewport admin experience.
  - Expand the regex so `/admin/event/:id/menu` is treated like the other full-page admin views.

2) Create a full-page Menu Edit screen
- New file (example name): `src/pages/AdminMenuEditPage.tsx`
- Responsibilities:
  - Load `quote` and `invoice` for the given `quoteId` (same hooks as `EventEstimateFullViewPage`)
  - Render a full-page layout:
    - Top bar: Back button (returns to `/admin/event/:quoteId`), page title “Edit Menu Selections”
    - Body: `MenuEditorInline` in a properly constrained scroll container
  - Ensure scrolling always works:
    - Use a full-height flex layout similar to other full-page views (explicit height, `min-h-0`, and ScrollArea with `h-0 flex-1` pattern)

3) Change “Edit Menu” actions to navigate instead of opening a modal
- File: `src/components/admin/events/EventEstimateFullView.tsx`
- Replace `showMenuEdit` dialog flow with navigation:
  - `onEditMenu` should do: `navigate(/admin/event/${quote.id}/menu)`
- This removes the modal that currently traps scrolling.

4) Optional parity (recommended): also update mobile estimate view if it opens menu edit in a modal
- File: `src/components/admin/mobile/MobileEstimateView.tsx`
- If it uses a modal for menu editing, switch it to navigate to the same full-page menu editor route (mobile will benefit too).
- If mobile already has a better pattern, we’ll keep it consistent.

Verification checklist (what we’ll test right after)
1) Service Package label:
- Regenerate line items for the event you’re on:
  - Confirm the “Service Package” description shows “Delivery Only” (not “Catering Service”).
- Also confirm there is no “Catering Service” fallback anywhere in regenerated items.

2) Full-page menu editor:
- From `/admin/event/4b13d793-...`, click Edit Menu:
  - You should land on `/admin/event/4b13d793-.../menu`
- Confirm:
  - The page scrolls fully (can reach all categories and the Save button)
  - No content is hidden / no trapped scroll
  - After saving, it returns you to the event view and line items update (and prices preserved as before)

Files expected to change
- src/utils/invoiceFormatters.ts
- supabase/functions/generate-invoice-from-quote/index.ts
- src/App.tsx
- src/components/admin/events/EventEstimateFullView.tsx
- (new) src/pages/AdminMenuEditPage.tsx
- (optional) src/components/admin/mobile/MobileEstimateView.tsx (if needed for parity)

Notes / risk management
- This approach fixes the real source of the “Catering Service” fallback (client-side regeneration) and prevents it at the edge-function layer too.
- Moving menu editing to a full-page route is the cleanest way to eliminate modal viewport scroll bugs long-term, and aligns with your admin architecture that already uses `/admin/event/:quoteId` as the full-viewport hub.
