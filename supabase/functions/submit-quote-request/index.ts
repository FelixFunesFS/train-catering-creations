import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max submissions per email within time window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Max 3 submissions per email per hour

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();

    // Honeypot check - if this field has any value, it's likely a bot
    // The form should include a hidden field that humans won't fill out
    if (payload._honeypot || payload.website_url || payload.company_website) {
      console.log('Bot detected via honeypot field');
      // Return success to not tip off bots, but don't actually process
      return new Response(
        JSON.stringify({ success: true, quote_id: 'processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    const requiredFields = ['contact_name', 'email', 'phone', 'event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location', 'service_type'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = String(payload.email).trim().toLowerCase().slice(0, 255);
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate guest count
    if (typeof payload.guest_count !== 'number' || payload.guest_count < 1) {
      return new Response(
        JSON.stringify({ error: 'Guest count must be at least 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check - count recent submissions from this email
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
      .eq('email', sanitizedEmail)
      .gte('created_at', windowStart);

    if (countError) {
      console.error('Rate limit check error:', countError);
      // Don't block on rate limit check failure, but log it
    } else if (count !== null && count >= MAX_SUBMISSIONS_PER_WINDOW) {
      console.log(`Rate limit exceeded for email: ${sanitizedEmail} (${count} submissions in window)`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many quote requests. Please wait before submitting another request.',
          retry_after_minutes: 60
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and prepare the insert payload
    const insertPayload = {
      contact_name: String(payload.contact_name).trim().slice(0, 200),
      email: sanitizedEmail,
      phone: String(payload.phone).trim().slice(0, 50),
      event_name: String(payload.event_name).trim().slice(0, 200),
      event_type: payload.event_type,
      event_date: payload.event_date,
      start_time: payload.start_time,
      guest_count: Math.min(Math.max(1, Number(payload.guest_count)), 10000),
      location: String(payload.location).trim().slice(0, 500),
      service_type: payload.service_type,
      serving_start_time: payload.serving_start_time || null,
      proteins: Array.isArray(payload.proteins) ? payload.proteins : [],
      both_proteins_available: Boolean(payload.both_proteins_available),
      appetizers: Array.isArray(payload.appetizers) ? payload.appetizers : [],
      sides: Array.isArray(payload.sides) ? payload.sides : [],
      desserts: Array.isArray(payload.desserts) ? payload.desserts : [],
      drinks: Array.isArray(payload.drinks) ? payload.drinks : [],
      dietary_restrictions: Array.isArray(payload.dietary_restrictions) ? payload.dietary_restrictions : [],
      vegetarian_entrees: Array.isArray(payload.vegetarian_entrees) ? payload.vegetarian_entrees : [],
      guest_count_with_restrictions: payload.guest_count_with_restrictions ? String(payload.guest_count_with_restrictions).slice(0, 100) : null,
      plates_requested: Boolean(payload.plates_requested),
      cups_requested: Boolean(payload.cups_requested),
      napkins_requested: Boolean(payload.napkins_requested),
      serving_utensils_requested: Boolean(payload.serving_utensils_requested),
      chafers_requested: Boolean(payload.chafers_requested),
      ice_requested: Boolean(payload.ice_requested),
      utensils: Array.isArray(payload.utensils) ? payload.utensils : [],
      extras: Array.isArray(payload.extras) ? payload.extras : [],
      separate_serving_area: Boolean(payload.separate_serving_area),
      serving_setup_area: payload.serving_setup_area ? String(payload.serving_setup_area).slice(0, 500) : null,
      bussing_tables_needed: Boolean(payload.bussing_tables_needed),
      special_requests: payload.special_requests ? String(payload.special_requests).slice(0, 2000) : null,
      referral_source: payload.referral_source || null,
      theme_colors: payload.theme_colors ? String(payload.theme_colors).slice(0, 200) : null,
      // ceremony_included is deprecated - no longer submitted
      cocktail_hour: payload.cocktail_hour != null ? Boolean(payload.cocktail_hour) : null,
      military_organization: payload.military_organization ? String(payload.military_organization).trim().slice(0, 200) : null,
      workflow_status: 'pending'
    };

    console.log('Inserting quote request for:', insertPayload.email);

    // Insert with service role (bypasses RLS)
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([insertPayload])
      .select('id')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save quote request', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Quote request created successfully:', data.id);

    // Server-owned email triggers (non-blocking)
    // Rationale: prevents client-side navigation/abort from skipping confirmations.
    // Note: SMTP acceptance is not the same as inbox delivery; we still log outcomes here.
    const quoteId = data.id;

    const invokeEmailFn = async (fnName: string) => {
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke(fnName, {
          body: { quote_id: quoteId },
        });

        if (fnError) {
          console.warn(`[email] ${fnName} returned error for quote ${quoteId}:`, fnError);
          return { ok: false, error: fnError.message };
        }

        console.log(`[email] ${fnName} invoked for quote ${quoteId}`, fnData ?? null);
        return { ok: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[email] ${fnName} threw for quote ${quoteId}:`, msg);
        return { ok: false, error: msg };
      }
    };

    // Run in parallel; don't block quote creation success on email deliverability.
    await Promise.all([
      invokeEmailFn('send-quote-confirmation'),
      invokeEmailFn('send-quote-notification'),
    ]);

    return new Response(
      JSON.stringify({ success: true, quote_id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
