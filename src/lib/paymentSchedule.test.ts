import { describe, expect, test } from "bun:test";
import { getScheduleTier, planSchedule, splitAmounts } from "../../supabase/functions/_shared/paymentSchedule";
import { getScheduleTier as uiTier } from "../utils/paymentScheduling";

const pcts = (d: number) => planSchedule(d).map((p) => p.percentage);

describe("payment schedule rules", () => {
  test("14 days or less is 100% now", () => expect(pcts(14)).toEqual([100]));
  test("15 days is 60/40", () => expect(pcts(15)).toEqual([60, 40]));
  test("44 days is 60/40 with balance 14 days prior", () => {
    expect(pcts(44)).toEqual([60, 40]);
    expect(planSchedule(44)[1].daysBeforeEvent).toBe(14);
  });
  test("45 days is 10/40/50", () => expect(pcts(45)).toEqual([10, 40, 50]));
  test("amounts always add up to the total", () => {
    for (const t of [101, 9999, 123457]) for (const d of [10, 20, 40, 60])
      expect(splitAmounts(t, planSchedule(d)).reduce((a, b) => a + b, 0)).toBe(t);
  });
  test("screen tiers match the shared rule", () => {
    for (const d of [1, 14, 15, 30, 31, 44, 45, 90]) expect(uiTier(d, "PERSON")).toBe(getScheduleTier(d));
  });
});
