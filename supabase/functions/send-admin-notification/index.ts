import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  invoiceId: string;
  notificationType: 'customer_approval' | 'change_request' | 'payment_received' | 'payment_failed';
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, notificationType, metadata = {} }: AdminNotificationRequest = await req.json();

    console.log(`[Admin Notification] Type: ${notificationType}, Invoice: ${invoiceId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invoice and quote details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        quote_requests!invoices_quote_request_id_fkey(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    const quote = invoice.quote_requests as any;

    // Format notification email based on type
    let subject = '';
    let body = '';

    switch (notificationType) {
      case 'customer_approval':
        subject = `✅ Customer Approved: ${quote.event_name}`;
        body = `
          <h2>Great news! Customer has approved the estimate.</h2>
          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <h3 style="margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${quote.event_name}</p>
            <p><strong>Customer:</strong> ${quote.contact_name}</p>
            <p><strong>Email:</strong> ${quote.email}</p>
            <p><strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${quote.guest_count}</p>
            <p><strong>Total:</strong> $${(invoice.total_amount / 100).toFixed(2)}</p>
          </div>
          ${metadata.feedback ? `<p><strong>Customer Feedback:</strong> ${metadata.feedback}</p>` : ''}
          <p><a href="${Deno.env.get('SITE_URL')}/admin/workflow/${invoiceId}" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
        `;
        break;

      case 'change_request':
        subject = `📝 Change Request: ${quote.event_name}`;
        body = `
          <h2>Customer has requested changes to their estimate.</h2>
          <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px;">
            <h3 style="margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${quote.event_name}</p>
            <p><strong>Customer:</strong> ${quote.contact_name}</p>
            <p><strong>Email:</strong> ${quote.email}</p>
            <p><strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
          </div>
          <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px;">
            <h3 style="margin-top: 0;">Requested Changes:</h3>
            <p>${metadata.changes || 'See admin dashboard for details'}</p>
            ${metadata.urgency === 'high' ? '<p style="color: #dc2626; font-weight: bold;">⚠️ HIGH PRIORITY</p>' : ''}
          </div>
          <p><a href="${Deno.env.get('SITE_URL')}/admin?view=change-requests" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">Review Change Request</a></p>
        `;
        break;

      case 'payment_received':
        subject = `💰 Payment Received: ${quote.event_name}`;
        body = `
          <h2>Payment has been received!</h2>
          <div style="margin: 20px 0; padding: 15px; background: #d1fae5; border-radius: 8px;">
            <h3 style="margin-top: 0;">Payment Details:</h3>
            <p><strong>Event:</strong> ${quote.event_name}</p>
            <p><strong>Customer:</strong> ${quote.contact_name}</p>
            <p><strong>Amount:</strong> $${((metadata.amount || 0) / 100).toFixed(2)}</p>
            <p><strong>Type:</strong> ${metadata.payment_type === 'full' ? 'Full Payment' : '50% Deposit'}</p>
            ${metadata.full_payment ? '<p style="color: #059669; font-weight: bold;">✅ PAID IN FULL</p>' : ''}
          </div>
          <p><a href="${Deno.env.get('SITE_URL')}/admin?view=event-board" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">View Event Board</a></p>
        `;
        break;

      case 'payment_failed':
        subject = `⚠️ Payment Failed: ${quote.event_name}`;
        body = `
          <h2>Payment attempt failed</h2>
          <div style="margin: 20px 0; padding: 15px; background: #fee2e2; border-radius: 8px;">
            <h3 style="margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${quote.event_name}</p>
            <p><strong>Customer:</strong> ${quote.contact_name}</p>
            <p><strong>Email:</strong> ${quote.email}</p>
            <p><strong>Reason:</strong> ${metadata.error || 'Unknown'}</p>
          </div>
          <p>You may need to follow up with the customer.</p>
        `;
        break;
    }

    // Send email using Gmail edge function
    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            ${body}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 14px;">Soul Train's Eatery - Admin Notification</p>
          </div>
        `
      }
    });

    if (emailError) {
      console.error('[Admin Notification] Email failed:', emailError);
      throw emailError;
    }

    console.log(`[Admin Notification] Sent successfully: ${notificationType}`);

    return new Response(
      JSON.stringify({ success: true, notificationType }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[Admin Notification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
