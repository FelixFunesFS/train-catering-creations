import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrackingEvent {
  event_type: string;
  entity_id?: string;
  entity_type?: string;
  user_id?: string;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      event_type,
      entity_id,
      entity_type,
      user_id,
      session_id,
      metadata = {}
    }: TrackingEvent = await req.json();

    // Extract request information
    const user_agent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || '';
    const ip_address = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    console.log(`Tracking event: ${event_type} for ${entity_type}:${entity_id}`);

    // Store analytics event
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        entity_id,
        entity_type,
        user_id,
        session_id: session_id || crypto.randomUUID(),
        user_agent,
        ip_address,
        referrer,
        metadata,
        created_at: new Date().toISOString()
      });

    if (analyticsError) {
      console.error('Error storing analytics:', analyticsError);
    }

    // Update entity-specific metrics
    if (entity_type === 'estimate' && entity_id) {
      // First get the current count
      const { data: currentInvoice } = await supabase
        .from('invoices')
        .select('estimate_viewed_count')
        .eq('id', entity_id)
        .single();
      
      const currentCount = currentInvoice?.estimate_viewed_count || 0;
      
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          estimate_viewed_count: currentCount + 1,
          estimate_viewed_at: new Date().toISOString(),
          last_customer_interaction: new Date().toISOString()
        })
        .eq('id', entity_id);

      if (updateError) {
        console.error('Error updating estimate metrics:', updateError);
      }
    }

    // Track quote interactions
    if (entity_type === 'quote' && entity_id) {
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .update({
          last_customer_interaction: new Date().toISOString()
        })
        .eq('id', entity_id);

      if (quoteError) {
        console.error('Error updating quote metrics:', quoteError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event_tracked: event_type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);