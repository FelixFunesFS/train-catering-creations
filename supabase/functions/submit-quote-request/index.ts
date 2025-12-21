import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    if (!emailRegex.test(payload.email)) {
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

    // Sanitize and prepare the insert payload
    const insertPayload = {
      contact_name: String(payload.contact_name).trim().slice(0, 200),
      email: String(payload.email).trim().toLowerCase().slice(0, 255),
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
      ceremony_included: payload.ceremony_included != null ? Boolean(payload.ceremony_included) : null,
      cocktail_hour: payload.cocktail_hour != null ? Boolean(payload.cocktail_hour) : null,
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
