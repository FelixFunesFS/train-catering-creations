// @ts-ignore - bun test runner types are not part of the app tsconfig
import { expect, test } from "bun:test";
import { buildMenuLabels } from "../../scripts/gen-menu-labels";
import { MENU_LABELS, labelMenuItem } from "../../supabase/functions/_shared/menuLabels";

test("document labels match the website menu (run bun scripts/gen-menu-labels.ts if this fails)", () => {
  expect(MENU_LABELS).toEqual(buildMenuLabels());
});
test("baked salmon prints its menu name on documents", () => expect(labelMenuItem("baked-salmon")).toBe(buildMenuLabels()["baked-salmon"]));
test("unknown ids still read cleanly", () => expect(labelMenuItem("mac-and-cheese")).toBe("Mac And Cheese"));
