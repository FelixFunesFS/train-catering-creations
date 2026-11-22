// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, expect, test } from "bun:test";
import { getProteins, getVegetarianEntrees, LEGACY_MENU_ALIASES, resolveMenuLabel, menuData } from "./menuData";
import { convertMenuIdToReadableText } from '../utils/menuNLP';

describe("menu integrity", () => {
  test('operational descriptions resolve every canonical protein and vegetarian selection', () => {
    for (const item of [...getProteins('regular'), ...getProteins('wedding'), ...getVegetarianEntrees()]) {
      expect(convertMenuIdToReadableText(item.id)).toBe(resolveMenuLabel(item.id));
    }
  });
  test('public poultry IDs use current selection IDs while old IDs remain readable', () => {
    const ids = menuData.entrees.sections.find((s) => s.title === 'Poultry')?.items.map((i) => i.id) ?? [];
    expect(ids).toContain('baked-chicken');
    expect(ids).toContain('bbq-chicken');
    expect(ids).not.toContain('baked-smoked-chicken');
    expect(convertMenuIdToReadableText('baked-smoked-chicken')).toBe('Baked Chicken');
  });
  for (const v of ["regular", "wedding"] as const) {
    test(`${v} protein ids are unique`, () => {
      const ids = getProteins(v).map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }
  test("Baked Salmon is a premium regular protein", () => {
    expect(getProteins("regular").find((p) => p.id === "baked-salmon")?.isPremium).toBe(true);
  });
  test("wedding keeps Lemon-Honey Seared Salmon", () => {
    expect(getProteins("wedding").some((p) => p.id === "lemon-honey-salmon")).toBe(true);
  });
  test("vegetarian list is exactly the 7 quote form entrees", () => {
    expect(getVegetarianEntrees("regular").map((v) => v.id)).toEqual([
      "vegetarian-patties-gravy", "vegetarian-burger", "vegetarian-hot-dogs", "vegetarian-lasagna",
      "vegetarian-spaghetti", "vegetarian-meat-loaf", "vegetarian-meatballs",
    ]);
  });
  test("website plant-based section matches the vegetarian list", () => {
    const sec = menuData.entrees.sections.find((s: any) => s.title === "Plant-Based Options")!;
    expect(sec.items.map((i: any) => i.id)).toEqual(getVegetarianEntrees().map((v) => v.id));
  });
  test("website lists every regular protein that is seafood", () => {
    const web = menuData.entrees.sections.flatMap((s: any) => s.items.map((i: any) => i.id));
    for (const p of getProteins("regular").filter((p) => p.category === "Seafood")) expect(web).toContain(p.id);
  });
  test("every legacy id resolves to its alias", () => {
    for (const [id, label] of Object.entries(LEGACY_MENU_ALIASES)) expect(resolveMenuLabel(id)).toBe(label);
  });
  test("wedding labels for vegetarian ids", () => {
    expect(resolveMenuLabel("vegetarian-meatballs", "wedding")).toBe("Vegetarian Italian Meatballs");
  });
});
