import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowRequest {
  action: 'send_email' | 'update_status' | 'create_reminder' | 'renew_token';
  entityType: 'quote' | 'invoice';
  entityId: string;
  emailType?: 'welcome' | 'estimate_ready' | 'payment_reminder' | 'token_expiring';
  newStatus?: string;
  reminderType?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WORKFLOW-ORCHESTRATOR] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, entityType, entityId, emailType, newStatus, reminderType }: WorkflowRequest = await req.json();
    
    logStep("Processing workflow action", { action, entityType, entityId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let result: any = {};

    switch (action) {
      case 'send_email':
        result = await handleSendEmail(supabase, entityType, entityId, emailType!, siteUrl);
        break;
        
      case 'update_status':
        result = await handleUpdateStatus(supabase, entityType, entityId, newStatus!);
        break;
        
      case 'create_reminder':
        result = await handleCreateReminder(supabase, entityId, reminderType!);
        break;
        
      case 'renew_token':
        result = await handleRenewToken(supabase, entityId);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep("Workflow action completed successfully", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in workflow-orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

async function handleSendEmail(
  supabase: any, 
  entityType: string, 
  entityId: string, 
  emailType: string,
  siteUrl: string
): Promise<any> {
  logStep("Sending email", { entityType, entityId, emailType });

  // Get entity details
  let quoteRequestId: string;
  
  if (entityType === 'invoice') {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('quote_request_id')
      .eq('id', entityId)
      .single();
      
    if (error || !invoice) {
      throw new Error('Invoice not found');
    }
    quoteRequestId = invoice.quote_request_id;
  } else {
    quoteRequestId = entityId;
  }

  // Call the customer portal email function
  const { data, error } = await supabase.functions.invoke('send-customer-portal-email', {
    body: {
      quote_request_id: quoteRequestId,
      type: emailType
    }
  });

  if (error) throw error;

  return { emailSent: true, quoteRequestId, emailType };
}

async function handleUpdateStatus(
  supabase: any,
  entityType: string,
  entityId: string,
  newStatus: string
): Promise<any> {
  logStep("Updating status", { entityType, entityId, newStatus });

  const table = entityType === 'invoice' ? 'invoices' : 'quote_requests';
  
  const { data, error } = await supabase
    .from(table)
    .update({ 
      workflow_status: newStatus,
      last_status_change: new Date().toISOString(),
      status_changed_by: 'workflow_orchestrator'
    })
    .eq('id', entityId)
    .select()
    .single();

  if (error) throw error;

  return { statusUpdated: true, entityType, entityId, newStatus };
}

async function handleCreateReminder(
  supabase: any,
  invoiceId: string,
  reminderType: string
): Promise<any> {
  logStep("Creating reminder", { invoiceId, reminderType });

  // Get invoice and quote details for email
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select(`
      id,
      quote_request_id,
      quote_requests (
        email,
        contact_name
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (invError || !invoice) {
    throw new Error('Invoice not found for reminder');
  }

  // Log the reminder
  const { error: logError } = await supabase
    .from('reminder_logs')
    .insert({
      invoice_id: invoiceId,
      reminder_type: reminderType,
      recipient_email: invoice.quote_requests.email
    });

  if (logError) {
    console.error('Failed to log reminder:', logError);
  }

  return { reminderCreated: true, invoiceId, reminderType };
}

async function handleRenewToken(
  supabase: any,
  invoiceId: string
): Promise<any> {
  logStep("Renewing token", { invoiceId });

  // Extend token expiry by 90 days
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 90);

  const { data, error } = await supabase
    .from('invoices')
    .update({ 
      token_expires_at: newExpiry.toISOString()
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;

  return { 
    tokenRenewed: true, 
    invoiceId, 
    newExpiry: newExpiry.toISOString() 
  };
}

serve(handler);
