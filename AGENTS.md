
- Pricing suggestion math and lock states live only in `supabase/functions/_shared/pricingEngine.ts` (pure, no imports), used by the `suggest-pricing` edge function, the admin UI and bun tests; why: one rule set so the server re-check and the screen never disagree, and AI only writes explanations, never numbers or tax.
