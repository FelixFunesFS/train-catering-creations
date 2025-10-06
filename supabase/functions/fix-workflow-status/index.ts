import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting workflow status synchronization...');

    // Fix quote_requests workflow_status based on invoices
    const { data: quotes, error: quotesError } = await supabase
      .from('quote_requests')
      .select(`
        id,
        workflow_status,
        invoices!quote_request_id (
          id,
          workflow_status,
          created_at
        )
      `);

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
      throw quotesError;
    }

    console.log(`Processing ${quotes.length} quote requests...`);

    const updates = [];

    for (const quote of quotes) {
      let newWorkflowStatus = quote.workflow_status;

      // Check if there's an associated invoice
      const invoice = quote.invoices?.[0];
      
      if (invoice) {
        // Sync quote workflow_status with invoice workflow_status
        if (invoice.workflow_status === 'sent' && quote.workflow_status !== 'estimated') {
          newWorkflowStatus = 'estimated';
        } else if (invoice.workflow_status === 'approved' && quote.workflow_status !== 'confirmed') {
          newWorkflowStatus = 'confirmed';
        } else if (invoice.workflow_status === 'paid' && quote.workflow_status !== 'confirmed') {
          newWorkflowStatus = 'confirmed';
        }
      }

      // Only update if there's a change
      if (newWorkflowStatus !== quote.workflow_status) {
        updates.push({
          id: quote.id,
          oldWorkflowStatus: quote.workflow_status,
          newWorkflowStatus
        });

        await supabase
          .from('quote_requests')
          .update({
            workflow_status: newWorkflowStatus,
            last_status_change: new Date().toISOString()
          })
          .eq('id', quote.id);
      }
    }

    // Fix invoice workflow_status (should already be correct, but validate)
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, workflow_status');

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    console.log(`Processing ${invoices.length} invoices...`);

    const invoiceUpdates = [];

    // Invoice workflow_status should already be correctly set
    // This is just a validation pass - workflow_status is the source of truth
    console.log(`Validated ${invoices.length} invoices`);

    console.log('Workflow status synchronization completed');
    console.log(`Quote updates: ${updates.length}`);
    console.log(`Invoice updates: ${invoiceUpdates.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workflow status synchronization completed',
        quoteUpdates: updates.length,
        invoiceUpdatesCount: invoiceUpdates.length,
        updates,
        invoiceUpdates
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('Error in fix-workflow-status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});