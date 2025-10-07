import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoice');
    const emailType = url.searchParams.get('type');

    if (!invoiceId || !emailType) {
      console.log('Missing tracking parameters');
      return createPixelResponse();
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables');
      return createPixelResponse();
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Update invoice with email opened timestamp (email tracking only)
    const updateField = 'email_opened_at';
    const countField = 'email_opened_count';

    const { data: currentInvoice } = await supabase
      .from('invoices')
      .select(countField)
      .eq('id', invoiceId)
      .single();

    const currentCount = currentInvoice?.[countField] || 0;

    await supabase
      .from('invoices')
      .update({
        [updateField]: new Date().toISOString(),
        [countField]: currentCount + 1,
        last_customer_interaction: new Date().toISOString()
      })
      .eq('id', invoiceId);

    // Track in analytics
    await supabase.from('analytics_events').insert({
      event_type: 'email_opened',
      entity_type: 'invoices',
      entity_id: invoiceId,
      metadata: {
        email_type: emailType,
        opened_at: new Date().toISOString()
      }
    });

    console.log(`Email opened tracked for invoice ${invoiceId} (${emailType})`);

    return createPixelResponse();

  } catch (error: any) {
    console.error('Error in track-email-open:', error);
    return createPixelResponse();
  }
};

function createPixelResponse(): Response {
  // Return a 1x1 transparent GIF pixel
  const pixel = Uint8Array.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
    0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
    0x01, 0x00, 0x3b
  ]);

  return new Response(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Expires': '0',
      ...corsHeaders
    }
  });
}

serve(handler);
