# Pricing/menu follow-through review

## Latest safety pass — November 22, 2026

### Delivered
- Fried Catfish removed from active website, regular/wedding form and admin protein options. Fried Fish remains. Retired `catfish` and `catfish-fried` records retain their original label and are shown only when already selected on an older admin record.
- Apply/undo now use `apply_pricing_suggestion`: one database transaction validates the invoice, locks its line items and inquiry, updates prices and authoritative totals, updates unpaid milestone amounts, and records the audit. A later error rolls back earlier writes, totals, milestones and audit together.
- Payment transaction inserts/updates acquire the same invoice lock. A completed payment committed before the pricing transaction prevents its application; a payment writer arriving during pricing waits. This addresses the original check-then-write race, not outstanding Stripe sessions described below.
- Suggestions have server-stored tiers and an admin-bound ID, expire after 15 minutes, and require the same invoice/quote/menu/settings revision. The browser cannot choose arbitrary replacement prices. Settings tables are share-locked during apply/undo. Unchanged lines and descriptions are included in revision validation.
- Existing milestone IDs, dates and percentages are retained; amounts are allocated to the new invoice total with the final cent remainder assigned to the last milestone. A missing schedule is created inside the transaction, with standard 10/40/50, rush/full or manually selected Net 30. No browser regeneration is needed after AI apply/undo.
- `pricing_sent_at` re-locks revised estimates separately from the original `sent_at`. A database trigger also protects old timestamp writers from extending the seven-day validity clock. No expired quote dates were retroactively repaired.
- Estimate sends now lock before reading the delivery content; previews do not change dates or locks. Existing advanced payment statuses are not regressed. A delivery failure leaves pricing guarded; admins can retry sending or deliberately unlock.
- The secondary invoice-email hook now sends a real email instead of merely recording a sent timestamp. Protected portal emails accept verified admins or internal service calls only.
- Historical invoice and line-item queries are ordered and paginated. Draft/sent-only estimates are excluded; only invoice approval/payment-progress statuses enter history.

### Quality checks actually completed
- 71 Bun tests passed, 170 assertions; no failing tests. New tests cover Catfish retirement/history preservation and separate resend lock boundaries.
- Rollback-only database checks ran successfully twice, including after the final transaction changes: multi-line apply, exact 10/40/50 schedule, totals/schedule read-back, undo, second-line failure rolling back the first write, stale revision rejection, paid-status rejection, resend retaining original sent date and preserving payment status. Retained QA quote count verified as zero.
- Public `/menu` and both quote forms checked at 390×844, 980×738 and 1280×1800. Forms used test contact/event values, reached Mains, selected the correct salmon plus five vegetarian portions, and read selections back. No form submitted, no Catfish options, Fried Fish retained in regular options, no horizontal overflow or browser runtime errors. Screenshots checked after menu closing animations finished.
- Preview reported build OK; whitespace/diff checks passed. Updated `suggest-pricing` and `send-customer-portal-email` deployed. Both reject explicitly invalid authorization with 403.
- New migration warnings were fixed; 63 older security warnings remain, not introduced by this pass.
- Production rules are accessible to read-only diagnostics: 54 active rules; two active generic `Chafer Rental` rules share the same name/service. The assistant's ambiguity rule deliberately avoids choosing one.

### What this does not prove
The browser still reports `external_unmanaged` Supabase; no managed admin/staff session can be restored. Public walkthroughs and rollback-only database tests are not authenticated admin-to-customer-to-staff end-to-end tests. SMTP delivery, actual Stripe checkout/webhooks, staff BEO printing, simultaneous connections and the AI rationale success path were not exercised with a signed-in test account. Earlier blanket assurances that no workflows could break were too strong.

### Next-pass plan, in priority order
1. **Payment-in-progress and outstanding checkout safety.** Freeze revisions during ACH processing and expire/reconcile existing Stripe checkout sessions before permitting an unpaid revision. Test an already-open checkout completing after a price revision, simultaneous admins and payment recording, and webhook retry behavior in an isolated authenticated environment.
2. **Canonical schedule generation.** Audit and consolidate the separate `generate-payment-milestones` function. It still deletes/recreates rows outside a single transaction and contains legacy 60/40 short-notice rules, unlike the documented 10/40/50 policy. Resolve the exact short-notice treatment before altering existing arrangements; cover Net 30, rush, month boundaries, cent rounding, due dates, linked transactions and manual edits. This pass intentionally preserves existing schedule dates/percentages rather than silently rewriting commitments.
3. **Customer documents and delivery.** Share canonical labels with server invoice generation and then verify quote submission → admin edit → apply → totals/milestones → PDF/email → approval/payment → staff/BEO print. Leave historical/custom descriptions untouched. Add an explicit delivery-attempt/success state so a failed first send does not look like a delivered quote or start validity without delivery; email delivery and database updates cannot be one transaction.
4. **Pricing data quality.** Compare included sides, drinks, dietary portions, equipment/service scope and normalized legacy protein IDs before widening package comparisons. Exclude embedded discounts and count only invoices whose samples survive outlier filtering. Add history-volume tests and settings-revision tests. Review the duplicate Chafer Rental rules rather than choosing or deleting one without the owner's rate decision.
5. **Security and accessibility audit.** Triage the 63 existing warnings by intended public/customer/admin access. Do not blindly revoke customer portal RPCs. Check collapsed public menu content for keyboard/screen-reader visibility; its CSS-only collapse leaves hidden controls represented in the DOM.

### Unresolved edge cases that need attention
- A previously opened Stripe checkout or processing ACH can still carry an older amount; serialization of database writes does not invalidate external checkout amounts.
- The manual/general milestone generator still has non-atomic replacement and legacy 60/40 short-notice behavior. Existing schedules may therefore differ from standard policy; this pass does not silently replace them.
- A failed send stays locked and can retain a first sent date despite no email delivery; retry/unlock is safe, but accurate delivery/validity state needs an outbox/attempt record.
- Server-generated labels and some sides/desserts/drinks still use separate formatters; older/custom descriptions are intentionally not rewritten.
- Package comparisons still omit some menu/logistics differences and per-line discounts; event-count provenance can include later-rejected samples.
- Two generic Chafer Rental rules are ambiguous and need the correct current rate confirmed.
- Full signed-in booking/payment/document/staff workflows and real concurrency are unverified; no claim of zero workflow regressions or unconditional publishing certainty.
- 63 pre-existing security warnings remain for a separate targeted review.

---

## Earlier pass (historical record; superseded where noted above)

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

## Earlier remaining safety work — see latest status above
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