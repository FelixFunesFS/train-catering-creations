# Pricing/menu follow-through review

## Implemented
- Known Catering Package title variants and Standard Entree Package rules share a key. Package-category fallback cannot mix unrelated protein/equipment items.
- Anchors select the current service arrangement, including legacy drop-off → delivery-only. Duplicate/ambiguous rules and lump-sum packages do not silently use a per-person anchor.
- Historical comparisons require compatible service, unit basis and, for packages, identical stored protein selections and dual-protein mode. Sparse history remains explicit; no invented seafood surcharge.
- Eight-month windows clamp correctly at month end. Unchanged line items count toward minimums rather than causing unnecessary increases.
- AI receives vegetarian entrées/portions, dietary restrictions, descriptions and small-event context. It explains deterministic amounts; it does not control tax, discounts or payment terms. Existing model retained; supported SDK used.
- Payment/lock/history/settings reads fail closed on errors. Apply/undo reject missing expected values, changed prices/quantities, duplicate or empty item sets. Conditional row writes catch concurrent changes to each row.
- Every successful send through the estimate-actions hook refreshes sent_at; advanced payment statuses are not reset to sent.
- Apply is unavailable while suggestions refresh, while the editor is disabled, for locked estimates, or when a tier has no priced items. Standalone invoices without inquiries cannot use the assistant.
- Quote review protein/vegetarian labels and client operational menu descriptions use the canonical resolver. Public poultry uses current IDs; retired stored IDs remain readable. Both forms use getVegetarianEntrees.
- Found and fixed a real keyboard issue: Escape dismissing a menu picker also navigated the quote wizard backward. Picker/button keys no longer trigger global wizard navigation.

## Verified
- 69 Bun regression tests passed; 164 assertions.
- Preview build reported OK after changes.
- Both regular and wedding forms: entered test contact/event data, reached Mains, selected the correct salmon, selected vegetarian patties with five portions, and read the selections back. Tested 390×844 and 1280×1800; no horizontal overflow. Test data was not submitted.
- Expanded public menu renders Baked Salmon and Fried Catfish. Existing menu tests cover the seven vegetarian IDs and retired aliases.
- Updated suggest-pricing deployed successfully. An explicit invalid session received 403, not protected data.

## Remaining safety work — not represented as fixed
1. **Atomic apply/undo:** writes still occur row by row. A later error can leave an earlier row changed; an audit-write error can occur after prices change. A database transaction with an invoice revision, atomic audit and payment recheck is still required for all-or-nothing safety.
2. **Payment race:** the initial payment check fails closed, but a payment can arrive between that check and a write. Solve with a transaction/locking protocol shared with payment recording, not a client-only lock.
3. **Stale composition/settings:** expected prices and quantities are checked, but changes to descriptions/menu contents, floors and rules are not revision-checked. Server-issued suggestion IDs with revision validation remain needed; submitted tier prices are not recalculated server-side.
4. **Server document labels:** generate-invoice-from-quote still has its own title-case formatter. Existing stored descriptions and manually edited invoices are intentionally unchanged. Server generation and staff BEO stored-line descriptions do not yet share the browser resolver.
5. **Menu comparison depth:** package history does not compare sides, drinks, equipment, travel, staffing, dietary preparation or all legacy protein aliases. Exact stored protein matching can reduce eligible history; a generic package anchor is not a calculated premium-seafood allowance.
6. **History completeness:** bounded history queries are not fully paginated or consistently ordered. Large future data sets can truncate; unaccepted draft estimates and embedded line-level discounts may still enter history. Reported comparison event counts precede per-line outlier rejection.
7. **Milestone recovery:** milestone regeneration is still client-triggered and failures are not surfaced reliably. It should be part of authoritative apply completion, with a recoverable failure state.
8. **Resend boundary:** the updated hook refreshes sent_at, but send and timestamp update are separate operations. Other email/payment-link paths need a common authoritative send boundary; using sent_at also restarts quote-validity calculations.
9. **Remaining label duplication:** sides/desserts/drinks in ReviewSummaryCard and other server/client formatters are not fully canonicalized. Website and selection registries still contain separate presentation metadata within menuData.

## Unverified end-to-end workflows
The project reports external_unmanaged Supabase. Managed session minting and CLI database diagnostics are unavailable; no credentials were requested and no live customer quotes/payments were modified.

Still requires an authenticated test environment: submit → admin edit → pricing status/suggest → apply → totals/milestones read-back → undo conflict → send/unlock/resend re-lock → payment freeze → staff event/BEO print. Also test fault injection during the second line update, simultaneous admins, pending ACH, menu regeneration failure, and current production rule duplication.

These limitations mean deployment plus passing tests is not a claim of production-safe transactional pricing or complete customer-to-BEO parity.