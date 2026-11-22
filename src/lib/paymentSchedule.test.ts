// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, expect, test } from "bun:test";
import { getScheduleTier, planSchedule, splitAmounts } from "../../supabase/functions/_shared/paymentSchedule";
import { getScheduleTier as uiTier } from "../utils/paymentScheduling";

const pcts = (d: number) => planSchedule(d).map((p) => p.percentage);

describe("payment schedule rules (one 10/40/50 plan)", () => {
  test("14 days or less is 100% now", () => expect(pcts(14)).toEqual([100]));
  test("15 days is 50% now, 50% at 14 days prior", () => {
    expect(pcts(15)).toEqual([50, 50]);
    expect(planSchedule(15)[1].daysBeforeEvent).toBe(14);
  });
  test("30 days is 50/50", () => expect(pcts(30)).toEqual([50, 50]));
  test("31 days is 10/40/50 with milestone at 30 and balance at 14", () => {
    expect(pcts(31)).toEqual([10, 40, 50]);
    expect(planSchedule(31).map((p) => p.daysBeforeEvent)).toEqual([null, 30, 14]);
  });
  test("no 60/40 split exists anywhere", () => {
    for (let d = 0; d <= 120; d++) expect(pcts(d)).not.toContain(60);
  });
  test("amounts always add up to the total", () => {
    for (const t of [101, 9999, 123457]) for (const d of [10, 20, 40, 60])
      expect(splitAmounts(t, planSchedule(d)).reduce((a, b) => a + b, 0)).toBe(t);
  });
  test("screen tiers match the shared rule", () => {
    for (const d of [1, 14, 15, 30, 31, 44, 45, 90]) expect(uiTier(d, "PERSON")).toBe(getScheduleTier(d));
  });
});

import { readFileSync } from 'fs';
test('milestone generator imports shared schedule and protects paid plans', () => {
  const src = readFileSync('supabase/functions/generate-payment-milestones/index.ts', 'utf8');
  expect(src).toContain("from '../_shared/paymentSchedule.ts'");
  expect(src).not.toContain('totalAmountCents * 0.4');
  expect(src).toContain('payments_exist');
});
