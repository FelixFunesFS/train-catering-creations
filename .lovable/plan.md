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
- **Risk: deleting the old menu file breaks the original quote form.** It's still in use, so it stays; only unused parts are left alone this pass.
- **Risk: website menu layout shifts.** Only the item lists change, not the page design.
- **No database changes**, no migration — easy to roll back.

## Verification
- Run all existing tests plus the new menu checks.
- Walk through: Regular form picks Baked Salmon → submit → appears in admin editor, estimate, BEO print and staff view.
- Open an older event with a retired item → still shown and still there after save.
- Check on phone and desktop sizes.

## Technical details
- `src/data/menuData.ts`: add `getProteins(variant)`, `getVegetarianEntrees(variant)` (sourced from `vegetarianOptions.ts`), `LEGACY_MENU_ALIASES`, `resolveMenuLabel(id, variant)`; add Fried Catfish to seafood; replace Plant-Based list with the 7 entrées.
- `MenuSelectionStep.tsx` + `MenuEditorInline.tsx`: delete hardcoded REGULAR/WEDDING protein + vegetarian arrays, import helpers; admin renders unknown selected ids as Legacy chips and merges on save; admin protein cap 4.
- `src/lib/menuNLP.ts`: add baked-salmon, lemon-honey-salmon, fried-catfish and legacy aliases.
- New `src/data/menuIntegrity.test.ts` (bun): ids unique, salmon premium, every legacy alias resolves, admin and form lists equal per variant.
- Record rule in AGENTS.md: menu item lists come only from `menuData.ts` helpers.
