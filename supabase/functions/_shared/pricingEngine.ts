// Pure pricing logic shared by the suggest-pricing edge function and the admin UI.
// No imports: must run in both Deno and the browser/bun.

export type LockState = 'open' | 'unlocked' | 'guarded' | 'locked';

export interface LockInput {
  workflowStatus: string | null | undefined;
  sentAt: string | null | undefined;
  totalPaidCents: number | null | undefined;
  lastUnlockAt?: string | null;
}

const PAID_STATUSES = ['paid', 'partially_paid'];
const PRE_SEND_STATUSES = ['draft', 'pending_review'];

export function pricingLockState(i: LockInput): LockState {
  const paid = i.totalPaidCents ?? 0;
  const status = i.workflowStatus ?? 'draft';
  if (paid > 0 || PAID_STATUSES.includes(status) || status === 'cancelled') return 'locked';
  const sent = !!i.sentAt || !PRE_SEND_STATUSES.includes(status);
  if (!sent) return 'open';
  if (i.lastUnlockAt && (!i.sentAt || new Date(i.lastUnlockAt).getTime() > new Date(i.sentAt).getTime())) return 'unlocked';
  return 'guarded';
}

export const canSuggest = (s: LockState) => s === 'open' || s === 'unlocked';

export function expectedPriceMatches(current: { unit_price: number; quantity: number }, expected: { expected_price?: number; expected_quantity?: number }): boolean {
  return expected.expected_price !== undefined && expected.expected_quantity !== undefined
    && current.unit_price === expected.expected_price && current.quantity === expected.expected_quantity;
}

// ---------- Event grouping ----------
export type EventGroup = 'military' | 'formal' | 'corporate' | 'social';
export function eventGroup(eventType: string | null | undefined, militaryOrg?: string | null): EventGroup {
  const t = (eventType ?? '').toLowerCase();
  if (t === 'military_function' || (militaryOrg && militaryOrg.trim())) return 'military';
  if (t === 'wedding' || t === 'black_tie' || t === 'anniversary') return 'formal';
  if (t === 'corporate' || t === 'holiday_party' || t === 'retirement') return 'corporate';
  return 'social';
}

// ---------- Price adjustments ----------
export interface PriceAdjustment {
  effective_date: string; // YYYY-MM-DD
  scope: 'all' | 'category' | 'item';
  scope_value?: string | null;
  adjustment_type: 'flat' | 'percent';
  amount: number; // flat = cents, percent = e.g. 5 for +5%
}

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Only known meal-package aliases share history; unrelated add-ons never do. */
export function pricingItemKey(title?: string | null): string {
  const key = norm(title);
  return /^(catering package|standard entree package)( .*)?$/.test(key) ? 'catering package' : key;
}

export function matchingPriceHistory<T extends { title?: string | null; category?: string | null }>(item: T, history: T[]): T[] {
  const key = pricingItemKey(item.title);
  const exact = key ? history.filter((h) => pricingItemKey(h.title) === key) : [];
  if (exact.length) return exact;
  // Category fallback is safe only for the canonical meal package, not seafood or equipment.
  if (key === 'catering package' || (!key && norm(item.category) === 'package')) {
    return history.filter((h) => norm(h.category) === 'package');
  }
  return [];
}

export interface PriceRule {
  item_name: string; base_price?: number | null; price_per_person?: number | null; service_type?: string | null;
}
const serviceKey = (s?: string | null) => s === 'drop-off' ? 'delivery-only' : s;
export function currentPriceAnchor(item: { title?: string | null; quantity?: number }, rules: PriceRule[], service?: string | null): number | null {
  const key = pricingItemKey(item.title);
  if (!key) return null;
  const matches = rules.filter((r) => pricingItemKey(r.item_name) === key);
  const specific = matches.filter((r) => serviceKey(r.service_type) === serviceKey(service));
  const candidates = specific.length ? specific : matches.filter((r) => !r.service_type);
  if (candidates.length !== 1) return null; // Ambiguous rules must not silently choose the first row.
  const rule = candidates[0];
  const perHead = rule.price_per_person ?? 0;
  if (perHead > 0) return key === 'catering package' && item.quantity === 1 ? null : perHead;
  return (rule.base_price ?? 0) > 0 ? rule.base_price ?? null : null;
}

/** Bring a historical unit price up to today's pricing by applying adjustments dated after the event and on/before today. */
export function adjustToToday(
  unitCents: number, eventDate: string, today: string, item: { title?: string | null; category?: string | null },
  adjustments: PriceAdjustment[],
): number {
  let p = unitCents;
  const sorted = [...adjustments].sort((a, b) => a.effective_date.localeCompare(b.effective_date));
  for (const a of sorted) {
    if (!(a.effective_date > eventDate && a.effective_date <= today)) continue;
    if (a.scope === 'category' && norm(a.scope_value) !== norm(item.category)) continue;
    if (a.scope === 'item' && norm(a.scope_value) !== norm(item.title)) continue;
    p = a.adjustment_type === 'percent' ? p * (1 + a.amount / 100) : p + a.amount;
  }
  return Math.round(p);
}

// ---------- Stats ----------
export interface Sample { value: number; weight: number }

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** Drop $0 and IQR outliers (typos like a missing decimal). Returns kept samples and number excluded. */
export function removeOutliers(samples: Sample[]): { kept: Sample[]; excluded: number } {
  const nonZero = samples.filter((s) => s.value > 0);
  let excluded = samples.length - nonZero.length;
  if (nonZero.length < 4) return { kept: nonZero, excluded };
  const vals = nonZero.map((s) => s.value).sort((a, b) => a - b);
  const q1 = quantile(vals, 0.25), q3 = quantile(vals, 0.75), iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
  const kept = nonZero.filter((s) => s.value >= lo && s.value <= hi);
  excluded += nonZero.length - kept.length;
  return { kept, excluded };
}

export function weightedQuantile(samples: Sample[], q: number): number {
  if (!samples.length) return 0;
  const s = [...samples].sort((a, b) => a.value - b.value);
  const total = s.reduce((t, x) => t + x.weight, 0);
  let acc = 0;
  for (const x of s) {
    acc += x.weight;
    if (acc / total >= q) return x.value;
  }
  return s[s.length - 1].value;
}

/** Recent events count more: weight halves every `halfLifeDays` (default ~3 months). */
export function recencyWeight(eventDate: string, today: string, halfLifeDays = 90): number {
  const days = Math.max(0, (Date.parse(today) - Date.parse(eventDate)) / 86400000);
  return Math.pow(0.5, days / halfLifeDays);
}

export function windowStart(today: string, months = 8): string {
  const d = new Date(today + 'T00:00:00Z');
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}

export const MIN_SIMILAR = 5;

export interface ItemRange {
  low: number; mid: number; high: number; sampleCount: number; excluded: number; limitedData: boolean;
}

export function itemRange(samples: Sample[], anchorCents?: number | null): ItemRange | null {
  const { kept, excluded } = removeOutliers(samples);
  if (!kept.length && !anchorCents) return null;
  if (!kept.length) {
    const a = anchorCents ?? 0;
    return { low: Math.round(a * 0.9), mid: a, high: Math.round(a * 1.1), sampleCount: 0, excluded, limitedData: true };
  }
  let low = weightedQuantile(kept, 0.25), mid = weightedQuantile(kept, 0.5), high = weightedQuantile(kept, 0.75);
  const limitedData = kept.length < MIN_SIMILAR;
  if (limitedData) { low = Math.round(mid * 0.85); high = Math.round(mid * 1.15); }
  if (anchorCents && anchorCents > 0) {
    // Current menu price wins as the recommended starting point; history shapes the spread.
    const spreadLo = mid ? low / mid : 0.9, spreadHi = mid ? high / mid : 1.1;
    mid = anchorCents; low = Math.round(anchorCents * Math.min(spreadLo, 0.97)); high = Math.round(anchorCents * Math.max(spreadHi, 1.03));
  }
  return { low: Math.round(low), mid: Math.round(mid), high: Math.round(high), sampleCount: kept.length, excluded, limitedData };
}

// ---------- Floors ----------
export interface Floors { per_head_cents: number; minimum_order_cents: number }

/** Scale a tier's lines up so the subtotal meets the per-head floor and catering minimum. Returns new unit prices. */
export function applyFloors(lines: { quantity: number; unit: number }[], guests: number, floors: Floors, unchangedSubtotal = 0): number[] {
  const subtotal = lines.reduce((t, l) => t + l.unit * l.quantity, 0);
  const required = Math.max(0, Math.max(floors.minimum_order_cents ?? 0, (floors.per_head_cents ?? 0) * Math.max(guests, 0)) - unchangedSubtotal);
  if (subtotal <= 0 || subtotal >= required) return lines.map((l) => l.unit);
  const factor = required / subtotal;
  return lines.map((l) => Math.ceil(l.unit * factor));
}
