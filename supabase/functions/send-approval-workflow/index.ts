import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Fetch invoice data
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
          email
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error("Invoice not found");
    }

    logStep("Invoice data fetched", { 
      invoiceNumber: invoiceData.invoice_number,
      status: invoiceData.status 
    });

    if (invoiceData.status !== 'approved') {
      throw new Error("Invoice must be approved to trigger workflow");
    }

    // Calculate payment schedule for email
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

    const paymentSchedule = calculatePaymentSchedule(
      invoiceData.total_amount,
      invoiceData.quote_requests.event_date,
      invoiceData.draft_data?.is_government_contract
    );

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    // Step 1: Send contract and payment instructions email
    const contractEmailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background-color: #2563eb; color: white; margin-bottom: 30px; }
        .content { padding: 20px; }
        .highlight { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .payment-box { background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Soul Train's Eatery</h1>
        <p>Estimate Approved - Next Steps</p>
      </div>
      
      <div class="content">
        <p>Congratulations ${invoiceData.customers.name}!</p>
        
        <p>Your catering estimate for <strong>${invoiceData.quote_requests.event_name}</strong> has been approved. We're excited to make your event delicious and memorable!</p>
        
        <div class="highlight">
          <h3>Your Event Details</h3>
          <p><strong>Event:</strong> ${invoiceData.quote_requests.event_name}</p>
          <p><strong>Date:</strong> ${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${invoiceData.quote_requests.location}</p>
          <p><strong>Guest Count:</strong> ${invoiceData.quote_requests.guest_count}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(invoiceData.total_amount)}</p>
        </div>
        
        <h3>Next Steps to Secure Your Event:</h3>
        
        <div class="payment-box">
          <h3 style="color: #15803d; margin-top: 0;">💳 Step 1: Deposit Payment</h3>
          <p><strong>Contract Type:</strong> ${paymentSchedule.contract_type}</p>
          <p><strong>Deposit Required:</strong> ${formatCurrency(paymentSchedule.deposit_amount)} (${paymentSchedule.deposit_percentage}%)</p>
          <p><strong>Payment Terms:</strong> ${paymentSchedule.payment_terms}</p>
          
          ${paymentSchedule.deposit_amount > 0 ? `
          <p style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>To submit your deposit:</strong><br>
            • Call us at (843) 970-0265 to pay by card<br>
            • Or we can send you a secure payment link<br>
            • Venmo: @SoulTrainsEatery<br>
            • Zelle: soultrainseatery@gmail.com
          </p>
          ` : `
          <p style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>Government Contract:</strong> Full payment will be invoiced after event completion per contract terms.
          </p>
          `}
        </div>
        
        <h3>📋 Step 2: Contract Signature</h3>
        <p>We'll email you a service agreement within 24 hours for your digital signature. This contract will include:</p>
        <ul>
          <li>Complete menu details and service specifications</li>
          <li>Event timeline and setup requirements</li>
          <li>Payment schedule and terms</li>
          <li>Cancellation and change policies</li>
        </ul>
        
        <h3>📅 Step 3: Final Details Confirmation</h3>
        <p>One week before your event, we'll contact you to:</p>
        <ul>
          <li>Confirm final guest count</li>
          <li>Review setup and timing details</li>
          <li>Address any last-minute requests</li>
          <li>Collect remaining balance (if applicable)</li>
        </ul>
        
        <div class="highlight">
          <h3>Important Information</h3>
          <p><strong>Your event date is secured once we receive your deposit and signed contract.</strong></p>
          <p>Changes to menu or guest count can be made up to 7 days before your event.</p>
        </div>
        
        <p>Thank you for choosing Soul Train's Eatery! We can't wait to serve you and your guests.</p>
        
        <p>Questions? Call us at (843) 970-0265 or reply to this email.</p>
        
        <p>Best regards,<br>
        The Soul Train's Eatery Team</p>
      </div>
      
      <div class="footer">
        <p><strong>Soul Train's Eatery</strong><br>
        Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com<br>
        Proudly serving Charleston's Lowcountry and surrounding areas</p>
      </div>
    </body>
    </html>
    `;

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
        status: 'contract_sent',
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
        status: 'approved',
        invoice_status: 'contract_sent'
      })
      .eq('id', invoiceData.quote_request_id);

    if (quoteUpdateError) {
      logStep("Warning: Failed to update quote status", { error: quoteUpdateError.message });
    }

    logStep("Approval workflow completed successfully", {
      emailSent: !!emailResult,
      invoiceStatus: 'contract_sent'
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