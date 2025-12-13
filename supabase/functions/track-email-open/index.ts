import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 transparent GIF (base64)
const TRANSPARENT_GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoice');
    const emailType = url.searchParams.get('type') || 'estimate';

    console.log(`[track-email-open] Tracking email open for invoice: ${invoiceId}, type: ${emailType}`);

    if (!invoiceId) {
      console.log('[track-email-open] Missing invoice ID, returning pixel');
      return new Response(TRANSPARENT_GIF, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Initialize Supabase client with service role for database updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only update if email_opened_at is null (first open tracking)
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        email_opened_at: new Date().toISOString() 
      })
      .eq('id', invoiceId)
      .is('email_opened_at', null)
      .select('id, email_opened_at')
      .maybeSingle();

    if (error) {
      console.error('[track-email-open] Database error:', error);
    } else if (data) {
      console.log(`[track-email-open] First email open recorded for invoice: ${invoiceId}`);
      
      // Log analytics event
      await supabase.from('analytics_events').insert({
        event_type: 'email_opened',
        entity_type: 'invoice',
        entity_id: invoiceId,
        metadata: { email_type: emailType },
      });
    } else {
      console.log(`[track-email-open] Email already opened or invoice not found: ${invoiceId}`);
    }

    // Always return the tracking pixel
    return new Response(TRANSPARENT_GIF, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('[track-email-open] Error:', error);
    
    // Return pixel even on error to avoid broken images in emails
    return new Response(TRANSPARENT_GIF, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
      },
    });
  }
});