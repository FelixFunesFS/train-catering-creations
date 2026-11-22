
- Pricing suggestion math and lock states live only in `supabase/functions/_shared/pricingEngine.ts` (pure, no imports), used by the `suggest-pricing` edge function, the admin UI and bun tests; why: one rule set so the server re-check and the screen never disagree, and AI only writes explanations, never numbers or tax.
- Pricing history uses explicit package aliases and service-matched anchors; category fallback is package-only and ambiguous rules have no anchor, to avoid mixing unrelated items or service prices.
- Pricing rationale calls use the server-only Lovable AI Gateway SDK with validated structured output; preserve deterministic prices when AI is unavailable.
- Protein and vegetarian option lists come only from `getProteins`/`getVegetarianEntrees` in `src/data/menuData.ts` (retired ids via `LEGACY_MENU_ALIASES`); why: website, quote forms and admin editor drifted when each kept its own copy. Guarded by `src/data/menuIntegrity.test.ts`.
- Pricing apply/undo uses server-issued, revision-checked suggestion IDs and one service-only transaction for prices, audit and unpaid schedule totals; payment writes lock the same invoice to prevent check-then-write races.
- Estimate sending records a separate pricing send boundary before email delivery and preserves the original sent date; why: resends must re-lock revisions without extending quote validity.
