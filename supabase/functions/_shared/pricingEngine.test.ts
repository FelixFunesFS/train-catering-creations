
import { entreeUpliftCents as _eu, archetypePackageCents as _ap } from "./pricingEngine.ts";
test("three meats add a $5 multi-entree uplift even without the both-proteins toggle", () => {
  expect(_eu(["bbq-chicken", "honey-glazed-ham", "roasted-turkey"], false)).toBe(500);
  expect(_ap("delivery-only", ["bbq-chicken", "honey-glazed-ham", "roasted-turkey"], false)).toBe(1900);
});
test("two meats only add $3 when both are served to every guest", () => {
  expect(_eu(["bbq-chicken", "fried-chicken"], true)).toBe(300);
  expect(_eu(["bbq-chicken", "fried-chicken"], false)).toBe(0);
});
