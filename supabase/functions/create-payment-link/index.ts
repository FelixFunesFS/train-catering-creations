import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment link creation started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id, type = 'deposit' } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id, type });

    // Fetch invoice with customer and quote data
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone,
          stripe_customer_id
        ),
        quote_requests (
          id,
          event_name,
          event_date,
          location,
          guest_count
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error("Invoice not found");
    }

    logStep("Invoice data fetched", { 
      invoiceNumber: invoiceData.invoice_number,
      customerEmail: invoiceData.customers.email,
      totalAmount: invoiceData.total_amount 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Calculate payment amount based on type
    let paymentAmount: number;
    let description: string;

    if (type === 'deposit') {
      // Calculate deposit based on payment schedule
      const eventDate = new Date(invoiceData.quote_requests.event_date);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isGovernment = invoiceData.draft_data?.is_government_contract;

      if (isGovernment) {
        throw new Error("Government contracts don't require deposit payments");
      }

      if (daysUntilEvent <= 30) {
        paymentAmount = Math.round(invoiceData.total_amount * 0.5); // 50% for short notice
        description = `Deposit Payment (50%) - ${invoiceData.quote_requests.event_name}`;
      } else {
        paymentAmount = Math.round(invoiceData.total_amount * 0.25); // 25% for standard
        description = `Deposit Payment (25%) - ${invoiceData.quote_requests.event_name}`;
      }
    } else {
      paymentAmount = invoiceData.total_amount;
      description = `Full Payment - ${invoiceData.quote_requests.event_name}`;
    }

    logStep("Payment amount calculated", { paymentAmount, description });

    // Get or create Stripe customer
    let stripeCustomerId = invoiceData.customers.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: invoiceData.customers.email,
        name: invoiceData.customers.name,
        phone: invoiceData.customers.phone,
        metadata: {
          invoice_id: invoice_id,
          quote_request_id: invoiceData.quote_request_id
        }
      });

      stripeCustomerId = customer.id;

      // Update customer with Stripe ID
      await supabaseClient
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', invoiceData.customers.id);

      logStep("Created new Stripe customer", { customerId: stripeCustomerId });
    }

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description,
              description: `Event: ${invoiceData.quote_requests.event_name} on ${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}`,
              metadata: {
                invoice_id: invoice_id,
                quote_request_id: invoiceData.quote_request_id,
                payment_type: type
              }
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice_id,
        quote_request_id: invoiceData.quote_request_id,
        payment_type: type,
        customer_email: invoiceData.customers.email
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${req.headers.get("origin")}/payment-success?invoice_id=${invoice_id}&type=${type}`
        }
      }
    });

    logStep("Payment link created", { 
      paymentLinkId: paymentLink.id,
      url: paymentLink.url 
    });

    // Send payment link email to customer
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background-color: #2563eb; color: white; margin-bottom: 30px; }
        .content { padding: 20px; }
        .payment-box { background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .cta-button { display: inline-block; background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Soul Train's Eatery</h1>
        <p>Payment Link for Your Event</p>
      </div>
      
      <div class="content">
        <p>Dear ${invoiceData.customers.name},</p>
        
        <p>Your payment link is ready! You can now securely pay for your catering services online.</p>
        
        <div class="payment-box">
          <h3>Payment Details</h3>
          <p><strong>Event:</strong> ${invoiceData.quote_requests.event_name}</p>
          <p><strong>Date:</strong> ${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}</p>
          <p><strong>Amount Due:</strong> ${formatCurrency(paymentAmount)}</p>
          <p><strong>Payment Type:</strong> ${type === 'deposit' ? 'Event Deposit' : 'Full Payment'}</p>
          
          <a href="${paymentLink.url}" class="cta-button">Pay Now - ${formatCurrency(paymentAmount)}</a>
          
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            This secure payment link is valid for 30 days and accepts all major credit cards.
          </p>
        </div>
        
        ${type === 'deposit' ? `
        <p><strong>What happens after your deposit?</strong></p>
        <ol>
          <li>Your event date is officially secured</li>
          <li>We'll send you a detailed service agreement</li>
          <li>Final menu and guest count confirmation one week prior</li>
          <li>Remaining balance due 10 days before your event</li>
        </ol>
        ` : `
        <p><strong>Thank you for your full payment!</strong> Your event is now fully paid and confirmed. We'll contact you one week before your event to confirm final details.</p>
        `}
        
        <p>Questions about your payment? Contact us at (843) 970-0265 or reply to this email.</p>
        
        <p>We're excited to make your event delicious and memorable!</p>
        
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

    // Send email with payment link
    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-gmail-email', {
      body: {
        to: invoiceData.customers.email,
        subject: `💳 Payment Link Ready - ${description}`,
        html: emailContent
      }
    });

    if (emailError) {
      logStep("Warning: Failed to send payment link email", { error: emailError.message });
    } else {
      logStep("Payment link email sent successfully");
    }

    // Update invoice with payment link info
    const updateData: any = {
      notes: `${type} payment link created and sent to customer`,
      updated_at: new Date().toISOString()
    };

    if (type === 'deposit') {
      updateData.status = 'payment_pending';
    }

    await supabaseClient
      .from('invoices')
      .update(updateData)
      .eq('id', invoice_id);

    logStep("Payment link creation completed successfully");

    return new Response(JSON.stringify({
      success: true,
      payment_link_url: paymentLink.url,
      payment_link_id: paymentLink.id,
      amount: paymentAmount,
      description: description,
      email_sent: !!emailResult
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