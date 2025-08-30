import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowRequest {
  action: 'welcome' | 'quote_sent' | 'payment_reminder' | 'event_reminder' | 'status_update';
  quoteId?: string;
  invoiceId?: string;
  customData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, quoteId, invoiceId, customData }: WorkflowRequest = await req.json();

    console.log('Processing automated workflow:', { action, quoteId, invoiceId });

    switch (action) {
      case 'welcome':
        await processWelcomeWorkflow(supabaseClient, quoteId);
        break;
      
      case 'quote_sent':
        await processQuoteSentWorkflow(supabaseClient, quoteId);
        break;
      
      case 'payment_reminder':
        await processPaymentReminderWorkflow(supabaseClient, invoiceId);
        break;
      
      case 'event_reminder':
        await processEventReminderWorkflow(supabaseClient, quoteId);
        break;
      
      case 'status_update':
        await processStatusUpdateWorkflow(supabaseClient, quoteId, customData);
        break;
      
      default:
        throw new Error(`Unknown workflow action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${action} workflow completed` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Workflow error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

async function processWelcomeWorkflow(supabase: any, quoteId: string) {
  // Get quote details
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (!quote) throw new Error('Quote not found');

  // Send welcome email
  await supabase.functions.invoke('send-customer-portal-email', {
    body: {
      type: 'welcome',
      recipientEmail: quote.email,
      recipientName: quote.contact_name,
      quoteId: quoteId,
      customData: {
        eventName: quote.event_name,
        eventDate: quote.event_date
      }
    }
  });

  // Create message thread if it doesn't exist
  const { data: existingThread } = await supabase
    .from('message_threads')
    .select('id')
    .eq('quote_request_id', quoteId)
    .single();

  if (!existingThread) {
    await supabase.from('message_threads').insert({
      quote_request_id: quoteId,
      subject: `Quote Request - ${quote.event_name}`,
      is_active: true
    });
  }

  console.log('Welcome workflow completed for quote:', quoteId);
}

async function processQuoteSentWorkflow(supabase: any, quoteId: string) {
  // Update quote status
  await supabase
    .from('quote_requests')
    .update({ 
      status: 'sent',
      updated_at: new Date().toISOString()
    })
    .eq('id', quoteId);

  // Get quote details for email
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  // Send quote notification email
  await supabase.functions.invoke('send-customer-portal-email', {
    body: {
      type: 'quote_ready',
      recipientEmail: quote.email,
      recipientName: quote.contact_name,
      quoteId: quoteId,
      customData: {
        eventName: quote.event_name,
        estimatedTotal: quote.estimated_total
      }
    }
  });

  console.log('Quote sent workflow completed for quote:', quoteId);
}

async function processPaymentReminderWorkflow(supabase: any, invoiceId: string) {
  // Get invoice details
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      quote_requests(contact_name, email, event_name)
    `)
    .eq('id', invoiceId)
    .single();

  if (!invoice) throw new Error('Invoice not found');

  // Send payment reminder
  await supabase.functions.invoke('send-customer-portal-email', {
    body: {
      type: 'payment_reminder',
      recipientEmail: invoice.quote_requests.email,
      recipientName: invoice.quote_requests.contact_name,
      invoiceId: invoiceId,
      customData: {
        eventName: invoice.quote_requests.event_name,
        totalAmount: invoice.total_amount,
        dueDate: invoice.due_date
      }
    }
  });

  // Log the reminder
  await supabase.from('reminder_logs').insert({
    invoice_id: invoiceId,
    reminder_type: 'payment_reminder',
    recipient_email: invoice.quote_requests.email,
    urgency: 'medium'
  });

  console.log('Payment reminder workflow completed for invoice:', invoiceId);
}

async function processEventReminderWorkflow(supabase: any, quoteId: string) {
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (!quote) throw new Error('Quote not found');

  // Send event reminder (3 days before event)
  await supabase.functions.invoke('send-customer-portal-email', {
    body: {
      type: 'event_reminder',
      recipientEmail: quote.email,
      recipientName: quote.contact_name,
      quoteId: quoteId,
      customData: {
        eventName: quote.event_name,
        eventDate: quote.event_date,
        startTime: quote.start_time,
        location: quote.location
      }
    }
  });

  console.log('Event reminder workflow completed for quote:', quoteId);
}

async function processStatusUpdateWorkflow(supabase: any, quoteId: string, customData: any) {
  const { newStatus, oldStatus, reason } = customData;

  // Update quote status
  await supabase
    .from('quote_requests')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', quoteId);

  // Log the status change
  await supabase.from('quote_request_history').insert({
    quote_request_id: quoteId,
    field_name: 'status',
    old_value: oldStatus,
    new_value: newStatus,
    changed_by: 'automated_system',
    change_reason: reason || 'Automated status progression'
  });

  // Send status update notification to customer
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (quote && ['approved', 'confirmed', 'completed'].includes(newStatus)) {
    await supabase.functions.invoke('send-customer-portal-email', {
      body: {
        type: 'status_update',
        recipientEmail: quote.email,
        recipientName: quote.contact_name,
        quoteId: quoteId,
        customData: {
          eventName: quote.event_name,
          newStatus: newStatus,
          nextSteps: getNextStepsForStatus(newStatus)
        }
      }
    });
  }

  console.log('Status update workflow completed:', { quoteId, oldStatus, newStatus });
}

function getNextStepsForStatus(status: string): string {
  switch (status) {
    case 'approved':
      return 'Your quote has been approved! We will now begin preparing your contract and invoice.';
    case 'confirmed':
      return 'Your event is confirmed! We will contact you closer to the event date to finalize details.';
    case 'completed':
      return 'Thank you for choosing Soul Train\'s Eatery! We hope you enjoyed our catering service.';
    default:
      return 'Your request status has been updated. We will contact you if any action is needed.';
  }
}