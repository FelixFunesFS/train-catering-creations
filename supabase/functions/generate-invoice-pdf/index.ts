import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("PDF generation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id });

    // Fetch complete invoice data with relationships
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

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabaseClient
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice_id)
      .order("created_at");

    if (lineItemsError) {
      throw new Error("Failed to fetch line items");
    }

    logStep("Data fetched successfully", { 
      lineItemsCount: lineItems?.length || 0,
      invoiceNumber: invoiceData.invoice_number 
    });

    // Format currency function
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    // Calculate payment schedule
    const calculatePaymentSchedule = (totalAmount: number, eventDate: string, isGovernment = false) => {
      const eventDateTime = new Date(eventDate);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (isGovernment) {
        return {
          deposit_percentage: 0,
          deposit_amount: 0,
          schedule: [{
            amount: totalAmount,
            description: "Full payment due 30 days after event completion"
          }]
        };
      }

      if (daysUntilEvent <= 30) {
        return {
          deposit_percentage: 50,
          deposit_amount: Math.round(totalAmount * 0.5),
          schedule: [
            { amount: Math.round(totalAmount * 0.5), description: "Deposit to secure event date (50%)" },
            { amount: totalAmount - Math.round(totalAmount * 0.5), description: "Final payment due 10 days prior to event" }
          ]
        };
      } else {
        return {
          deposit_percentage: 25,
          deposit_amount: Math.round(totalAmount * 0.25),
          schedule: [
            { amount: Math.round(totalAmount * 0.25), description: "Deposit to secure event date (25%)" },
            { amount: Math.round(totalAmount * 0.5), description: "Second payment due 30 days prior (50%)" },
            { amount: totalAmount - Math.round(totalAmount * 0.25) - Math.round(totalAmount * 0.5), description: "Final payment due 10 days prior (25%)" }
          ]
        };
      }
    };

    const paymentSchedule = calculatePaymentSchedule(
      invoiceData.total_amount,
      invoiceData.quote_requests.event_date,
      invoiceData.draft_data?.is_government_contract
    );

    // Generate HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Catering Estimate - ${invoiceData.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
        .subtitle { color: #666; margin-top: 5px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
        .line-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .line-items th, .line-items td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .line-items th { background-color: #f8fafc; font-weight: bold; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-row { margin: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }
        .payment-info { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .contact-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Soul Train's Eatery</div>
        <div class="subtitle">Charleston's Premier Catering Service</div>
        <div style="margin-top: 10px; color: #666;">Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</div>
      </div>

      <div class="invoice-details">
        <div>
          <strong>Estimate #:</strong> ${invoiceData.invoice_number}<br>
          <strong>Date:</strong> ${new Date(invoiceData.created_at).toLocaleDateString()}<br>
          <strong>Status:</strong> ${invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
        </div>
        <div>
          <strong>Bill To:</strong><br>
          ${invoiceData.customers.name}<br>
          ${invoiceData.customers.email}<br>
          ${invoiceData.customers.phone}<br>
          ${invoiceData.customers.address || ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Event Details</div>
        <strong>Event:</strong> ${invoiceData.quote_requests.event_name}<br>
        <strong>Date:</strong> ${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}<br>
        <strong>Location:</strong> ${invoiceData.quote_requests.location}<br>
        <strong>Service Type:</strong> ${invoiceData.quote_requests.service_type}<br>
        <strong>Guest Count:</strong> ${invoiceData.quote_requests.guest_count}<br>
        ${invoiceData.quote_requests.special_requests ? `<strong>Special Requests:</strong> ${invoiceData.quote_requests.special_requests}<br>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Line Items</div>
        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems?.map(item => `
              <tr>
                <td>
                  <strong>${item.title || 'Item'}</strong><br>
                  <small>${item.description}</small>
                </td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align: center; color: #666;">No line items available</td></tr>'}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">Subtotal: ${formatCurrency(invoiceData.subtotal)}</div>
          ${invoiceData.tax_amount > 0 ? `<div class="total-row">Tax: ${formatCurrency(invoiceData.tax_amount)}</div>` : ''}
          <div class="total-row grand-total">Total: ${formatCurrency(invoiceData.total_amount)}</div>
        </div>
      </div>

      <div class="payment-info">
        <div class="section-title">Payment Information</div>
        <p><strong>Deposit Required:</strong> ${formatCurrency(paymentSchedule.deposit_amount)} (${paymentSchedule.deposit_percentage}%)</p>
        <p><strong>Payment Schedule:</strong></p>
        <ul>
          ${paymentSchedule.schedule.map(payment => `
            <li>${payment.description}: ${formatCurrency(payment.amount)}</li>
          `).join('')}
        </ul>
      </div>

      <div class="contact-info">
        <div class="section-title">Contact Information</div>
        <p><strong>Soul Train's Eatery</strong><br>
        Phone: (843) 970-0265<br>
        Email: soultrainseatery@gmail.com<br>
        Proudly serving Charleston's Lowcountry and surrounding areas</p>
      </div>

      <div class="footer">
        <p>Thank you for choosing Soul Train's Eatery for your catering needs!</p>
        <p><em>This estimate is valid for 30 days from the date of issuance.</em></p>
      </div>
    </body>
    </html>
    `;

    // For now, we'll return the HTML content and a placeholder PDF URL
    // In a real implementation, you'd use a service like Puppeteer to generate the actual PDF
    const pdfUrl = `data:text/html;base64,${btoa(htmlContent)}`;

    logStep("PDF generation completed", { pdfUrl: "Generated" });

    return new Response(JSON.stringify({
      success: true,
      pdf_url: pdfUrl,
      html_content: htmlContent,
      invoice_number: invoiceData.invoice_number
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