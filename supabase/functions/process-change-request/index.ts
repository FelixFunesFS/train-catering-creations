import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { escapeHtml, createErrorResponse } from '../_shared/security.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-CHANGE-REQUEST] ${step}${detailsStr}`);
};

interface ProcessChangeRequest {
  change_request_id: string;
  action: 'approve' | 'reject' | 'request_more_info';
  admin_response?: string;
  estimated_cost_change?: number;
  new_estimate_data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Change request processing started");

    const { 
      change_request_id, 
      action, 
      admin_response, 
      estimated_cost_change, 
      new_estimate_data 
    }: ProcessChangeRequest = await req.json();

    if (!change_request_id || !action) {
      throw new Error('Missing required fields: change_request_id, action');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Service configuration error');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    logStep("Fetching change request data", { change_request_id });

    // Fetch change request details
    const { data: changeRequest, error: fetchError } = await supabase
      .from('change_requests')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          total_amount,
          customers (
            name,
            email
          ),
          quote_requests (
            event_name,
            event_date
          )
        )
      `)
      .eq('id', change_request_id)
      .single();

    if (fetchError || !changeRequest) {
      throw new Error('Change request not found');
    }

    logStep("Change request data fetched", { 
      requestType: changeRequest.request_type,
      status: changeRequest.status
    });

    let newStatus = changeRequest.status;
    let updates: any = {
      admin_response: admin_response,
      estimated_cost_change: estimated_cost_change,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'admin',
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        
        if (new_estimate_data) {
          // Create new estimate version
          const { data: currentVersions } = await supabase
            .from('estimate_versions')
            .select('version_number')
            .eq('invoice_id', changeRequest.invoice_id)
            .order('version_number', { ascending: false })
            .limit(1);

          const nextVersion = (currentVersions?.[0]?.version_number || 0) + 1;

          await supabase
            .from('estimate_versions')
            .insert({
              invoice_id: changeRequest.invoice_id,
              change_request_id: change_request_id,
              version_number: nextVersion,
              status: 'draft',
              line_items: new_estimate_data.line_items || [],
              subtotal: new_estimate_data.subtotal || 0,
              tax_amount: new_estimate_data.tax_amount || 0,
              total_amount: new_estimate_data.total_amount || 0,
              notes: `Updated per change request - ${admin_response || 'Customer requested changes'}`
            });

          logStep("Created new estimate version", { version: nextVersion });
        }
        
        updates.completed_at = new Date().toISOString();
        break;
        
      case 'reject':
        newStatus = 'rejected';
        updates.completed_at = new Date().toISOString();
        break;
        
      case 'request_more_info':
        newStatus = 'reviewing';
        break;
        
      default:
        throw new Error('Invalid action');
    }

    updates.status = newStatus;

    // Update change request
    const { error: updateError } = await supabase
      .from('change_requests')
      .update(updates)
      .eq('id', change_request_id);

    if (updateError) {
      throw new Error('Failed to update change request');
    }

    logStep("Change request updated", { newStatus, action });

    // Send notification email to customer
    try {
      const emailData = {
        to: changeRequest.customer_email,
        subject: `Change Request Update - ${escapeHtml(changeRequest.invoices.quote_requests.event_name)}`,
        html: generateResponseEmail(changeRequest, action, admin_response, estimated_cost_change)
      };

      const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
        body: emailData
      });

      if (emailError) {
        logStep("Warning: Failed to send notification email");
      } else {
        logStep("Notification email sent successfully");
      }
    } catch (emailError) {
      logStep("Warning: Email notification failed");
    }

    return new Response(JSON.stringify({ 
      success: true,
      change_request_id: change_request_id,
      new_status: newStatus,
      message: `Change request ${action}d successfully`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    return createErrorResponse(error, 'process-change-request', corsHeaders);
  }
};

function generateResponseEmail(changeRequest: any, action: string, adminResponse?: string, costChange?: number): string {
  // Sanitize all user-provided data
  const safeEventName = escapeHtml(changeRequest.invoices.quote_requests.event_name);
  const safeCustomerName = escapeHtml(changeRequest.invoices.customers.name);
  const safeAdminResponse = escapeHtml(adminResponse);
  
  let statusMessage = '';
  let nextSteps = '';
  
  switch (action) {
    case 'approve':
      statusMessage = '<span style="color: #16a34a; font-weight: bold;">APPROVED</span>';
      nextSteps = `
        <p>Great news! We've approved your change request and will update your estimate accordingly.</p>
        ${costChange ? `<p><strong>Estimated cost adjustment:</strong> ${costChange > 0 ? '+' : ''}$${(Math.abs(costChange) / 100).toFixed(2)}</p>` : ''}
        <p>We'll send you a revised estimate within 24 hours.</p>
      `;
      break;
    case 'reject':
      statusMessage = '<span style="color: #dc2626; font-weight: bold;">DECLINED</span>';
      nextSteps = `
        <p>Unfortunately, we're unable to accommodate this change request at this time.</p>
        <p>If you have any questions or would like to discuss alternatives, please don't hesitate to contact us.</p>
      `;
      break;
    case 'request_more_info':
      statusMessage = '<span style="color: #ea580c; font-weight: bold;">NEEDS MORE INFORMATION</span>';
      nextSteps = `
        <p>We need a bit more information to process your request. Please review our response below and get back to us.</p>
      `;
      break;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Soul Train's Eatery</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Change Request Update</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${safeCustomerName},</h2>
        
        <p>We've reviewed your change request for <strong>${safeEventName}</strong>.</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Request Status: ${statusMessage}</h3>
          ${safeAdminResponse ? `<p><strong>Our Response:</strong> ${safeAdminResponse}</p>` : ''}
        </div>
        
        ${nextSteps}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin-bottom: 5px;"><strong>Questions?</strong></p>
          <p style="margin: 0;">Call us at <a href="tel:8439700265" style="color: #8B5CF6;">(843) 970-0265</a></p>
          <p style="margin: 5px 0 0 0;">Email us at <a href="mailto:soultrainseatery@gmail.com" style="color: #8B5CF6;">soultrainseatery@gmail.com</a></p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
        <p>Thank you for choosing Soul Train's Eatery!</p>
      </div>
    </div>
  `;
}

serve(handler);
