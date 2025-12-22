import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateStandardEmail, EMAIL_CONFIGS, formatCurrency } from '../_shared/emailTemplates.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPROVAL-WORKFLOW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Approval workflow started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    // Fetch invoice data with line items
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone,
          address
        ),
        quote_requests (
          id,
          event_name,
          event_date,
          location,
          service_type,
          guest_count,
          special_requests,
          contact_name,
          email,
          phone,
          start_time,
          both_proteins_available,
          compliance_level
        ),
        invoice_line_items (
          id,
          title,
          description,
          quantity,
          unit_price,
          total_price,
          category,
          sort_order
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error("Invoice not found");
    }

    logStep("Invoice data fetched", { 
      invoiceNumber: invoiceData.invoice_number,
      status: invoiceData.workflow_status 
    });

    if (invoiceData.workflow_status !== 'approved') {
      throw new Error("Invoice must be approved to trigger workflow");
    }

    // Calculate payment schedule
    const calculatePaymentSchedule = (totalAmount: number, eventDate: string, isGovernment = false) => {
      const eventDateTime = new Date(eventDate);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 1000 * 24));

      if (isGovernment) {
        return {
          deposit_percentage: 0,
          deposit_amount: 0,
          contract_type: "Government Contract",
          payment_terms: "Net 30 days after event completion"
        };
      }

      if (daysUntilEvent <= 30) {
        return {
          deposit_percentage: 50,
          deposit_amount: Math.round(totalAmount * 0.5),
          contract_type: "Short Notice Event",
          payment_terms: "50% deposit now, 50% due 10 days prior to event"
        };
      } else {
        return {
          deposit_percentage: 25,
          deposit_amount: Math.round(totalAmount * 0.25),
          contract_type: "Standard Event",
          payment_terms: "25% deposit now, 50% due 30 days prior, 25% due 10 days prior to event"
        };
      }
    };

    const isGovernment = invoiceData.quote_requests.compliance_level === 'government';
    const paymentSchedule = calculatePaymentSchedule(
      invoiceData.total_amount,
      invoiceData.quote_requests.event_date,
      isGovernment
    );

    // Build portal URL
    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
    const portalUrl = `${siteUrl}/estimate?token=${invoiceData.customer_access_token}`;

    // Sort line items
    const lineItems = (invoiceData.invoice_line_items || []).sort((a: any, b: any) => {
      const sortA = a.sort_order ?? 999;
      const sortB = b.sort_order ?? 999;
      return sortA - sortB;
    });

    // Generate email using standard template
    const emailConfig = EMAIL_CONFIGS.approval_confirmation.customer!;
    
    const paymentInfoHtml = paymentSchedule.deposit_amount > 0 ? `
      <div style="background:#f0fdf4;border:2px solid #22c55e;padding:20px;border-radius:10px;margin:20px 0;">
        <h3 style="margin:0 0 12px 0;color:#15803d;">💳 Next Step: Secure Your Date</h3>
        <p style="margin:0 0 8px 0;"><strong>Contract Type:</strong> ${paymentSchedule.contract_type}</p>
        <p style="margin:0 0 8px 0;"><strong>Deposit Required:</strong> ${formatCurrency(paymentSchedule.deposit_amount)} (${paymentSchedule.deposit_percentage}%)</p>
        <p style="margin:0 0 12px 0;"><strong>Payment Terms:</strong> ${paymentSchedule.payment_terms}</p>
        <div style="background:white;padding:15px;border-radius:6px;margin-top:10px;">
          <strong>To submit your deposit:</strong><br>
          • Call us at (843) 970-0265 to pay by card<br>
          • Or we can send you a secure payment link<br>
          • Venmo: @SoulTrainsEatery<br>
          • Zelle: soultrainseatery@gmail.com
        </div>
      </div>
    ` : `
      <div style="background:#dbeafe;border:2px solid #3b82f6;padding:20px;border-radius:10px;margin:20px 0;">
        <h3 style="margin:0 0 12px 0;color:#1d4ed8;">📋 Government Contract</h3>
        <p style="margin:0;">Full payment will be invoiced after event completion per Net 30 terms.</p>
      </div>
    `;

    const nextStepsHtml = `
      <h3 style="color:#DC143C;margin:24px 0 12px 0;">📋 What Happens Next:</h3>
      <ol style="line-height:1.8;margin:0;padding-left:20px;">
        <li><strong>Complete Payment:</strong> Submit your deposit to secure your date</li>
        <li><strong>Contract Signature:</strong> We'll email you a service agreement within 24 hours</li>
        <li><strong>Final Details:</strong> One week before, we'll confirm final guest count and details</li>
        <li><strong>Event Day:</strong> We arrive early to set up and serve amazing food!</li>
      </ol>
      
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;border-radius:0 8px 8px 0;margin:20px 0;">
        <strong>⏰ Important:</strong> Your event date is secured once we receive your deposit and signed contract.
      </div>
    `;

    const contractEmailContent = generateStandardEmail({
      preheaderText: emailConfig.preheaderText,
      heroSection: {
        ...emailConfig.heroSection,
        subtitle: `Congratulations, ${invoiceData.customers.name}!`
      },
      contentBlocks: [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Your catering estimate for <strong>${invoiceData.quote_requests.event_name}</strong> has been approved. We're excited to make your event delicious and memorable!</p>` }},
        { type: 'event_details' },
        { type: 'menu_with_pricing' },
        { type: 'custom_html', data: { html: paymentInfoHtml }},
        { type: 'custom_html', data: { html: nextStepsHtml }},
        { type: 'text', data: { html: `<p style="margin:24px 0 0 0;">Questions? Call us at <strong>(843) 970-0265</strong> or reply to this email. We're here to help!</p>` }}
      ],
      ctaButton: { text: 'View Your Estimate Portal', href: portalUrl, variant: 'primary' },
      quote: invoiceData.quote_requests,
      invoice: invoiceData,
      lineItems: lineItems
    });

    // Send contract email
    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        to: invoiceData.customers.email,
        subject: `🎉 Estimate Approved - Next Steps for ${invoiceData.quote_requests.event_name}`,
        html: contractEmailContent
      }
    });

    if (emailError) {
      throw new Error(`Failed to send contract email: ${emailError.message}`);
    }

    // Update invoice status to show contract has been sent
    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({
        workflow_status: 'approved',
        notes: `Contract and payment instructions sent to ${invoiceData.customers.email}`
      })
      .eq('id', invoice_id);

    if (updateError) {
      logStep("Warning: Failed to update invoice status", { error: updateError.message });
    }

    // Update quote request status
    const { error: quoteUpdateError } = await supabaseClient
      .from('quote_requests')
      .update({
        workflow_status: 'approved'
      })
      .eq('id', invoiceData.quote_request_id);

    if (quoteUpdateError) {
      logStep("Warning: Failed to update quote status", { error: quoteUpdateError.message });
    }

    logStep("Approval workflow completed successfully", {
      emailSent: !!emailResult,
      invoiceStatus: 'approved'
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Approval workflow completed successfully",
      email_sent: !!emailResult,
      next_steps: [
        "Contract and payment instructions sent to customer",
        "Awaiting deposit payment",
        "Contract signature required"
      ]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
