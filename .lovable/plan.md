# AI Pricing Assistant (Admin Estimate Editor)

## Last things to settle before building
1. **Change requests from customers** - the app already has a customer change-request panel. When a customer asks for changes on an unpaid quote, the assistant should offer "Unlock for Revision" right from that request instead of making you hunt for it.
2. **Too little history** - if fewer than 5 similar past events exist (e.g. a rare formal wedding at 300 guests), the assistant says so plainly and shows a wider range, instead of pretending to be precise.
3. **Price floors** - suggestions never go below your minimums (per-head floor and catering minimum). These numbers will be shown as editable settings.
4. **Nothing is saved automatically** - suggestions only change the draft after you tap Apply, and every Apply can be undone.
5. **AI outage** - if the AI is slow or unavailable, you still instantly see the historical range; the estimate editor keeps working normally.
6. **Audit trail** - each applied suggestion records who applied it, when, and which tier, so you can see later where a price came from.
7. **Cost** - AI runs only when you tap "Suggest Pricing", never in the background on every page open.


## Rolling data and price increases
- **Always current**: every time you tap Suggest Pricing, it looks at the last 8 months as of today. Older events drop off automatically; new events count as soon as they are invoiced.
- **Recent weighs more**: last 2 months count more than events 6-8 months ago, so trends show up quickly.
- **Price changes you announce**: a "Price Change" setting where you enter a date and an adjustment (e.g. +$1 per head on everything, or +5% on proteins starting Jan 1). Older events are adjusted up to today's prices before being compared, so old prices never pull suggestions down. You can schedule a change ahead of time and it kicks in on that date.
- **Your current menu prices win**: if an item has a set price in your pricing list, that is the starting point; history only fine-tunes it.
- **Shows its basis**: the drawer says "Based on events from Mar-Nov 2026, Jan 2027 price change applied".

## What gets built
- **Suggest Pricing button** inside the estimate editor (desktop and phone), with the three lock states:
  - Open: new inquiries with no quote sent and nothing paid.
  - Guarded: quote or payment link sent, unpaid - locked until you tap "Unlock for Revision" and confirm.
  - Hard locked: any payment received - shows "Payment Received - Pricing Frozen", no AI.
- **Suggestion drawer**: instant historical range first, then three tiers (Competitive / Recommended / Premium) with a short reason and "based on X similar events, Y outliers excluded".
- **Line-by-line breakdown**: main package per head, second protein (both proteins served), sides, appetizers, desserts, add-ons, service style, travel/logistics. Notes and special requests are read for context.
- **Event type awareness**: military, formal/wedding, corporate and social events compared only against similar events.
- **Clean data**: typos, $0 items and discounted/comped events excluded from the baseline; discounts shown separately.
- **Tax never touched**: tax and government tax-exempt stay fully manual.
- **Phone safety**: Apply asks for a second confirmation on phones.

## Technical details
- Gate logic in a pure helper (`pricingLockState`) using quote status, sent/payment-link flags and `total_paid > 0`; server re-checks the same gate so a stale screen cannot apply to a paid event. Unit tests for each state.
- Deterministic stats (IQR outlier removal, per-head normalization, last 8 months, grouped by event type/service style) in a shared module with tests.
- New edge function `suggest-pricing` (admin-only via shared auth util) builds stats from invoices/line items and calls Lovable AI Gateway for tiers + rationale using structured output; returns pre-tax line items only.
- New `pricing_suggestion_log` table (RLS admin-only) for audit; manual unlock stored per invoice.
- UI wired into `EstimateEditor` and `MobileEstimateView`; apply goes through existing line-item save path so totals triggers and validation stay the single source of truth; React Query invalidations per existing admin cache standards.
- New `pricing_adjustments` table (effective_date, scope: all/category/item, flat or percent; admin-only RLS). Stats normalize each historical line to today by applying adjustments dated after that event; recency weighting via exponential decay (half-life ~3 months). Tests for date cutoffs and adjustment math.
- Floors and minimums stored as admin-editable settings.
