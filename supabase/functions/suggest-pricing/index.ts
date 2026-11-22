import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyAdminAuth } from "../_shared/security.ts";
import {
  adjustToToday, applyFloors, canSuggest, eventGroup, itemRange, MIN_SIMILAR, pricingLockState,
  recencyWeight, windowStart, type Floors, type PriceAdjustment, type Sample,
} from "../_shared/pricingEngine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const MODEL = "openai/gpt-6.1-sol";
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  action: z.enum(["status", "suggest", "apply", "unlock"]),
  invoice_id: z.string().uuid(),
  tier: z.string().max(40).optional(),
  items: z.array(z.object({ id: z.string().uuid(), unit_price: z.number().int().min(0).max(100_000_000) })).max(200).optional(),
  reason: z.string().max(500).optional(),
});

const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const auth = await verifyAdminAuth(req);
  if (!auth.isAdmin) return json({ error: "Admins only" }, 403);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const body = parsed.data;

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const { data: invoice, error: invErr } = await db.from("invoices")
    .select("id, workflow_status, sent_at, quote_request_id, discount_amount").eq("id", body.invoice_id).maybeSingle();
  if (invErr || !invoice) return json({ error: "Estimate not found" }, 404);

  const [{ data: paidRows }, { data: unlockRows }] = await Promise.all([
    db.from("payment_transactions").select("amount").eq("invoice_id", invoice.id).eq("status", "completed"),
    db.from("pricing_suggestion_log").select("created_at").eq("invoice_id", invoice.id).eq("action", "unlock")
      .order("created_at", { ascending: false }).limit(1),
  ]);
  const totalPaid = (paidRows ?? []).reduce((t, r) => t + (r.amount ?? 0), 0);
  const lock = pricingLockState({
    workflowStatus: invoice.workflow_status, sentAt: invoice.sent_at, totalPaidCents: totalPaid,
    lastUnlockAt: unlockRows?.[0]?.created_at ?? null,
  });

  // ---------- unlock ----------
  if (body.action === "unlock") {
    if (lock === "locked") return json({ error: "Payment received - pricing is frozen.", lock }, 409);
    await db.from("pricing_suggestion_log").insert({
      invoice_id: invoice.id, action: "unlock", performed_by: auth.userId, basis: { reason: body.reason ?? null },
    });
    return json({ lock: lock === "guarded" ? "unlocked" : lock });
  }

  // ---------- apply ----------
  if (body.action === "apply") {
    if (!canSuggest(lock)) return json({ error: lock === "locked" ? "Payment received - pricing is frozen." : "Pricing is locked because the quote was sent. Unlock for revision first.", lock }, 409);
    const items = body.items ?? [];
    const { data: current } = await db.from("invoice_line_items").select("id, quantity, unit_price, title")
      .eq("invoice_id", invoice.id);
    const byId = new Map((current ?? []).map((c) => [c.id, c]));
    if (items.some((i) => !byId.has(i.id))) return json({ error: "Some line items changed. Refresh and try again." }, 409);
    const previous = items.map((i) => ({ id: i.id, unit_price: byId.get(i.id)!.unit_price }));
    for (const i of items) {
      const c = byId.get(i.id)!;
      const { error } = await db.from("invoice_line_items")
        .update({ unit_price: i.unit_price, total_price: i.unit_price * c.quantity }).eq("id", i.id);
      if (error) return json({ error: "Could not update the estimate." }, 500);
    }
    await db.from("pricing_suggestion_log").insert({
      invoice_id: invoice.id, action: body.tier === "undo" ? "undo" : "apply", tier: body.tier ?? null,
      previous_items: previous, applied_items: items, performed_by: auth.userId,
    });
    return json({ ok: true, previous });
  }

  // ---------- status / suggest: build baseline ----------
  const { data: quote } = await db.from("quote_requests")
    .select("event_type, event_date, guest_count, military_organization, service_type, both_proteins_available, special_requests, custom_menu_requests, proteins")
    .eq("id", invoice.quote_request_id).maybeSingle();
  const { data: lines } = await db.from("invoice_line_items")
    .select("id, title, category, quantity, unit_price, description").eq("invoice_id", invoice.id)
    .order("sort_order", { ascending: true, nullsFirst: false });

  const today = new Date().toISOString().slice(0, 10);
  const from = windowStart(today, 8);
  const group = eventGroup(quote?.event_type, quote?.military_organization);

  const [{ data: histInvoices }, { data: adjRows }, { data: rules }, { data: floorCfg }] = await Promise.all([
    db.from("invoices")
      .select("id, discount_amount, workflow_status, quote_requests!inner(event_date, event_type, military_organization)")
      .neq("id", invoice.id).neq("workflow_status", "cancelled")
      .gte("quote_requests.event_date", from).lte("quote_requests.event_date", today).limit(1000),
    db.from("pricing_adjustments").select("effective_date, scope, scope_value, adjustment_type, amount"),
    db.from("pricing_rules").select("item_name, base_price, price_per_person, is_active").eq("is_active", true),
    db.from("business_config").select("config_value").eq("config_key", "pricing_floors").maybeSingle(),
  ]);
  const adjustments = (adjRows ?? []) as PriceAdjustment[];
  const floors: Floors = { per_head_cents: 0, minimum_order_cents: 0, ...(floorCfg?.config_value as Floors ?? {}) };

  const discounted = (histInvoices ?? []).filter((i) => (i.discount_amount ?? 0) > 0).length;
  const clean = (histInvoices ?? []).filter((i) => !((i.discount_amount ?? 0) > 0));
  const meta = new Map(clean.map((i: any) => [i.id, i.quote_requests]));
  const ids = clean.map((i) => i.id);
  let histLines: any[] = [];
  for (let k = 0; k < ids.length; k += 150) {
    const { data } = await db.from("invoice_line_items").select("invoice_id, title, category, unit_price")
      .in("invoice_id", ids.slice(k, k + 150)).limit(5000);
    histLines = histLines.concat(data ?? []);
  }

  const futureAdjustments = adjustments.filter((a) => a.effective_date > today)
    .sort((a, b) => a.effective_date.localeCompare(b.effective_date));
  const appliedAdjustments = adjustments.filter((a) => a.effective_date > from && a.effective_date <= today);

  const ranges = (lines ?? []).map((li) => {
    const key = norm(li.title) || norm(li.category);
    const matches = histLines.filter((h) => (norm(h.title) || norm(h.category)) === key);
    const toSample = (h: any): Sample => {
      const q = meta.get(h.invoice_id);
      return { value: adjustToToday(h.unit_price, q.event_date, today, h, adjustments), weight: recencyWeight(q.event_date, today) };
    };
    const same = matches.filter((h) => eventGroup(meta.get(h.invoice_id)?.event_type, meta.get(h.invoice_id)?.military_organization) === group);
    const useSame = same.filter((h) => h.unit_price > 0).length >= MIN_SIMILAR;
    const rule = (rules ?? []).find((r) => norm(r.item_name) === norm(li.title));
    const anchor = rule ? (rule.price_per_person || rule.base_price) : null;
    const r = itemRange((useSame ? same : matches).map(toSample), anchor);
    return { id: li.id, title: li.title, category: li.category, quantity: li.quantity, current: li.unit_price,
      range: r, comparedAcross: useSame ? group : "all event types", menuPrice: anchor };
  });

  const guests = quote?.guest_count ?? 0;
  const priced = ranges.filter((r) => r.range);
  const buildTier = (pick: "low" | "mid" | "high") => {
    const raw = priced.map((r) => ({ quantity: r.quantity, unit: r.range![pick] }));
    const floored = applyFloors(raw, guests, floors);
    const items = priced.map((r, i) => ({ id: r.id, unit_price: floored[i] }));
    const unpriced = ranges.filter((r) => !r.range).reduce((t, r) => t + r.current * r.quantity, 0);
    const subtotal = items.reduce((t, it, i) => t + it.unit_price * priced[i].quantity, 0) + unpriced;
    return { items, subtotal, perHead: guests ? Math.round(subtotal / guests) : null, flooredUp: floored.some((v, i) => v !== raw[i].unit) };
  };
  const tiers = { competitive: buildTier("low"), recommended: buildTier("mid"), premium: buildTier("high") };
  const sampleEvents = new Set(histLines.map((h) => h.invoice_id)).size;
  const excluded = ranges.reduce((t, r) => t + (r.range?.excluded ?? 0), 0);
  const limitedData = ranges.some((r) => r.range?.limitedData) || sampleEvents < MIN_SIMILAR;

  const basis = {
    windowFrom: from, windowTo: today, group, sampleEvents, excludedOutliers: excluded, excludedDiscounted: discounted,
    appliedAdjustments, upcomingAdjustment: futureAdjustments[0] ?? null, limitedData, floors,
  };
  const base = { lock, totalPaid, guests, eventType: quote?.event_type ?? null, ranges, tiers, basis };

  if (body.action === "status") return json(base);

  // ---------- suggest: AI rationale (numbers stay deterministic) ----------
  if (!canSuggest(lock)) return json({ ...base, ai: null, aiError: "Pricing is locked." });
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ ...base, ai: null, aiError: "AI is not configured." });

  const context = {
    event: { type: quote?.event_type, group, guests, service: quote?.service_type, bothProteins: quote?.both_proteins_available,
      proteins: quote?.proteins, specialRequests: quote?.special_requests, customMenu: quote?.custom_menu_requests },
    lines: ranges.map((r) => ({ title: r.title, qty: r.quantity, current: r.current, range: r.range, comparedAcross: r.comparedAcross })),
    tiers: Object.fromEntries(Object.entries(tiers).map(([k, v]) => [k, { subtotal: v.subtotal, perHead: v.perHead, flooredUp: v.flooredUp }])),
    basis,
  };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL, store: false, reasoning: { effort: "low" },
        instructions: "You help a family-run Charleston catering company price an estimate. Amounts are in cents, pre-tax. Never mention or suggest tax or tax exemption. Using only the provided data, write one short plain-English sentence (max 30 words) explaining each tier, and a short summary noting anything in the special requests or menu that could justify adjusting (e.g. both proteins served, travel, extra staffing). Be honest when data is limited.",
        input: [{ role: "user", content: JSON.stringify(context) }],
        text: { format: { type: "json_schema", name: "pricing_rationale", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["competitive", "recommended", "premium", "summary"],
          properties: { competitive: { type: "string" }, recommended: { type: "string" }, premium: { type: "string" }, summary: { type: "string" } },
        } } },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const msg = res.status === 402 ? "AI credits have run out." : res.status === 429 ? "AI is busy - try again shortly." : "AI is unavailable right now.";
      return json({ ...base, ai: null, aiError: msg });
    }
    const out = await res.json();
    const text = out.output_text ?? out.output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text;
    return json({ ...base, ai: JSON.parse(text) });
  } catch (e) {
    console.error("[suggest-pricing] ai error", e);
    return json({ ...base, ai: null, aiError: "AI is unavailable right now." });
  }
});
