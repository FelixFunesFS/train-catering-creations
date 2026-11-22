# One Menu, Everywhere — Safe Unification Plan

Goal: the website menu, both quote forms (Regular + Wedding) and the admin event editor all show the exact same proteins and vegetarian entrées, coming from one shared list. No old quote, invoice, BEO or price is lost or changed in the process.

## What changes for you
- **Baked Salmon** can be picked on the Regular quote form and in the admin editor (marked premium).
- **Fried Catfish** shows on the website menu (it's already sold on the form/admin).
- **Vegetarian**: everywhere uses the 7-item quote form list (Patties w/ Gravy, Burger, Hot Dogs, Lasagna, Spaghetti, Meat Loaf, Meatballs). Wedding events show the formal names.
- Old events with items no longer on the list still show them, with a "Legacy" tag, and saving keeps them.

## Edge cases and how each is handled
1. **Old quotes with retired names** (e.g. baked-smoked-chicken, bbq-chicken, quinoa bowl) — an alias map translates them to today's name for display; unknown ones are kept as "Legacy" chips. Nothing is rewritten in stored data.
2. **Saving in admin wipes unknown items** — the editor merges, never replaces: anything selected that isn't in the list is preserved on save.
3. **Switching an event Regular to Wedding** — selections that don't exist in the new list stay selected under a "Selected" row with a short notice, instead of vanishing.
4. **Salmon pricing** — flagged premium so dual-entrée and the Pricing Assistant treat it like other premium seafood. No existing invoice prices change.
5. **Line items regenerating** — menu edits keep today's behavior (existing change-confirmation step); custom-priced lines are preserved as they are now. No new automatic regeneration.
6. **BEO / staff view / emails / PDFs** — the name-cleaning dictionary gets the new and legacy ids so printouts read "Baked Salmon", not "baked salmon" or blank.
7. **Protein limits** — customer forms keep max 2; admin can go up to 4 for custom menus.
8. **Customer form in progress** — saved drafts using old ids still load via the alias map.
9. **Pricing history** — the Pricing Assistant groups by event type, not item name, so renamed items don't skew suggestions.

## Risks and safeguards
- **Risk: an id typo silently drops an item.** Safeguard: new automated check that every protein/vegetarian id used by forms and admin exists in the shared list, and every legacy id has an alias.
- **Old menu file (`menuItems.ts`)**: only one file uses it, an old quote menu screen (`MenuSelection.tsx`) that no page shows anymore. Both are removed so nobody edits the wrong list later. Nothing customers or admins see uses them.
- **Risk: website menu layout shifts.** Only the item lists change, not the page design.
- **No database changes**, no migration — easy to roll back.

## Verification and quality checks
Automated (run before saying done):
- All existing tests, plus new menu checks: every id unique, form and admin lists identical per event type, salmon premium, every legacy id resolves to a readable name, vegetarian list is exactly the 7 items.
- Search the code for any leftover hardcoded protein/vegetarian list; must find none outside the shared file.
- Build log clean.

Hands-on walkthrough (phone and desktop sizes):
1. Website menu shows Baked Salmon, Fried Catfish and the 7 vegetarian items.
2. Regular form: pick Baked Salmon + a vegetarian item, submit.
3. Same quote in admin editor: both appear selected; save without changes; reopen — still there.
4. Estimate, BEO print, staff event view show clean names.
5. Wedding form still shows Lemon-Honey Seared Salmon and formal vegetarian names.
6. Older event with a retired item: shows "Legacy", survives a save.
7. Switch a test event Regular to Wedding: selections kept with notice.

## What this pass will not cover (listed so nothing is assumed)
- Stored data is not rewritten: old quotes keep old ids; they only display through the alias map.
- Sides, appetizers and desserts are already shared and are not reworked.
- Menu item prices are not changed; the Pricing Assistant floors stay as set.
- Emails already sent and PDFs already downloaded keep their old wording.
- Server-side functions do not list menu items by name today (checked), so none are changed; if one is added later it must use the shared list.
- Hands-on checks use test quotes; real customer quotes are not edited.

## Technical details
- `src/data/menuData.ts`: add `getProteins(variant)`, `getVegetarianEntrees(variant)` (sourced from `vegetarianOptions.ts`), `LEGACY_MENU_ALIASES`, `resolveMenuLabel(id, variant)`; add Fried Catfish to seafood; replace Plant-Based list with the 7 entrées.
- `MenuSelectionStep.tsx` + `MenuEditorInline.tsx`: delete hardcoded REGULAR/WEDDING protein + vegetarian arrays, import helpers; admin renders unknown selected ids as Legacy chips and merges on save; admin protein cap 4.
- `src/utils/menuNLP.ts`: add baked-salmon, lemon-honey-salmon, fried-catfish and legacy aliases.
- New `src/data/menuIntegrity.test.ts` (bun): ids unique, salmon premium, every legacy alias resolves, admin and form lists equal per variant.
- Delete unused `src/data/menuItems.ts` and `src/components/quote/MenuSelection.tsx` (verified: no imports elsewhere).
- Record rule in AGENTS.md: menu item lists come only from `menuData.ts` helpers.
