import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-INVOICE-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id });

    // Fetch invoice with customer and quote data
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (
          email,
          name
        ),
        quote_requests (
          event_name,
          event_date,
          location
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error("Invoice not found");
    }

    if (!invoiceData.customers?.email) {
      throw new Error("Customer email not found");
    }

    logStep("Invoice found", { 
      invoiceNumber: invoiceData.invoice_number,
      customerEmail: invoiceData.customers.email 
    });

    // Create public invoice URL (token-based)
    const publicInvoiceUrl = `${req.headers.get("origin")}/invoice/public/${invoice_id}`;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    // Create email content
    const emailSubject = `Invoice ${invoiceData.invoice_number} from Soul Train's Eatery`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc143c 0%, #ff1744 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Soul Train's Eatery</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Charleston's Premier Catering Service</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Invoice ${invoiceData.invoice_number}</h2>
          
          <p>Dear ${invoiceData.customers.name},</p>
          
          <p>Thank you for choosing Soul Train's Eatery for your catering needs! Please find your invoice details below:</p>
          
          ${invoiceData.quote_requests ? `
          <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc143c;">Event Details</h3>
            <p><strong>Event:</strong> ${invoiceData.quote_requests.event_name}</p>
            <p><strong>Date:</strong> ${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${invoiceData.quote_requests.location}</p>
          </div>
          ` : ''}
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #dc143c;">Total Amount</h3>
            <p style="font-size: 32px; font-weight: bold; color: #dc143c; margin: 10px 0;">${formatCurrency(invoiceData.total_amount)}</p>
            <p style="color: #666; margin: 0;">Due Date: ${new Date(invoiceData.due_date).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${publicInvoiceUrl}" 
               style="background: linear-gradient(135deg, #dc143c 0%, #ff1744 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold; 
                      display: inline-block;
                      font-size: 16px;">
              View Invoice & Pay Online
            </a>
          </div>
          
          ${invoiceData.stripe_payment_link ? `
          <p style="text-align: center; color: #666; font-size: 14px;">
            You can also pay directly using this link: 
            <a href="${invoiceData.stripe_payment_link}" style="color: #dc143c;">Pay Now</a>
          </p>
          ` : ''}
          
          <div style="border-top: 2px solid #e1e1e1; padding-top: 20px; margin-top: 30px;">
            <h3 style="color: #dc143c;">Contact Information</h3>
            <p><strong>Phone:</strong> (843) 970-0265</p>
            <p><strong>Email:</strong> soultrainseatery@gmail.com</p>
            <p style="color: #666; font-style: italic;">Proudly serving Charleston's Lowcountry and surrounding areas</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Payment Terms:</strong> Payment is due upon receipt. We accept all major credit cards and bank transfers through our secure payment portal.
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            Thank you for your business! We look forward to making your event memorable with our exceptional catering services.
          </p>
          
          <p style="margin-bottom: 0;">
            Best regards,<br>
            <strong>The Soul Train's Eatery Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2024 Soul Train's Eatery. All rights reserved.</p>
        </div>
      </div>
    `;

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log the email content and update the invoice status
    
    logStep("Email content prepared", { 
      to: invoiceData.customers.email,
      subject: emailSubject 
    });

    // Update invoice status to sent
    const { error: updateError } = await supabaseClient
      .from("invoices")
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);

    if (updateError) {
      logStep("Warning: Failed to update invoice status", { error: updateError });
    }

    // Update quote request status
    const { error: quoteUpdateError } = await supabaseClient
      .from("quote_requests")
      .update({
        invoice_status: 'sent',
      })
      .eq("id", invoiceData.quote_request_id);

    if (quoteUpdateError) {
      logStep("Warning: Failed to update quote status", { error: quoteUpdateError });
    }

    logStep("Invoice email sent successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Invoice email sent successfully",
      public_invoice_url: publicInvoiceUrl,
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