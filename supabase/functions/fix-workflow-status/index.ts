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

    // Fix quote_requests workflow_status based on current status and invoices
    const { data: quotes, error: quotesError } = await supabase
      .from('quote_requests')
      .select(`
        id,
        status,
        workflow_status,
        invoices!quote_request_id (
          id,
          status,
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
      let newStatus = quote.status;

      // Check if there's an associated invoice
      const invoice = quote.invoices?.[0];
      
      if (invoice) {
        // If there's an invoice, the quote should be at least 'quoted'
        if (quote.status === 'pending' || quote.status === 'reviewed') {
          newStatus = 'quoted';
          newWorkflowStatus = 'quoted';
        }
        
        // Check invoice status for further progression
        if (invoice.status === 'sent' || invoice.status === 'viewed') {
          newStatus = 'quoted';
          newWorkflowStatus = 'quoted';
        } else if (invoice.status === 'approved') {
          newStatus = 'confirmed';
          newWorkflowStatus = 'confirmed';
        } else if (invoice.status === 'paid') {
          newStatus = 'confirmed';
          newWorkflowStatus = 'confirmed';
        }
      } else {
        // No invoice exists, ensure proper status mapping
        switch (quote.status) {
          case 'pending':
            newWorkflowStatus = 'pending';
            break;
          case 'reviewed':
            newWorkflowStatus = 'under_review';
            break;
          case 'quoted':
            newWorkflowStatus = 'quoted';
            break;
          case 'confirmed':
            newWorkflowStatus = 'confirmed';
            break;
          case 'completed':
            newWorkflowStatus = 'completed';
            break;
          case 'cancelled':
            newWorkflowStatus = 'cancelled';
            break;
        }
      }

      // Only update if there's a change
      if (newStatus !== quote.status || newWorkflowStatus !== quote.workflow_status) {
        updates.push({
          id: quote.id,
          oldStatus: quote.status,
          newStatus,
          oldWorkflowStatus: quote.workflow_status,
          newWorkflowStatus
        });

        await supabase
          .from('quote_requests')
          .update({
            status: newStatus,
            workflow_status: newWorkflowStatus,
            last_status_change: new Date().toISOString()
          })
          .eq('id', quote.id);
      }
    }

    // Fix invoice workflow_status based on status
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, status, workflow_status');

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    console.log(`Processing ${invoices.length} invoices...`);

    const invoiceUpdates = [];

    for (const invoice of invoices) {
      let newWorkflowStatus = invoice.workflow_status;

      switch (invoice.status) {
        case 'draft':
          newWorkflowStatus = 'draft';
          break;
        case 'approved':
          newWorkflowStatus = 'approved';
          break;
        case 'sent':
          newWorkflowStatus = 'sent';
          break;
        case 'viewed':
          newWorkflowStatus = 'viewed';
          break;
        case 'paid':
          newWorkflowStatus = 'paid';
          break;
        case 'overdue':
          newWorkflowStatus = 'overdue';
          break;
        case 'cancelled':
          newWorkflowStatus = 'cancelled';
          break;
      }

      if (newWorkflowStatus !== invoice.workflow_status) {
        invoiceUpdates.push({
          id: invoice.id,
          oldWorkflowStatus: invoice.workflow_status,
          newWorkflowStatus
        });

        await supabase
          .from('invoices')
          .update({
            workflow_status: newWorkflowStatus,
            last_status_change: new Date().toISOString()
          })
          .eq('id', invoice.id);
      }
    }

    console.log('Workflow status synchronization completed');
    console.log(`Quote updates: ${updates.length}`);
    console.log(`Invoice updates: ${invoiceUpdates.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workflow status synchronization completed',
        quoteUpdates: updates.length,
        invoiceUpdates: invoiceUpdates.length,
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
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