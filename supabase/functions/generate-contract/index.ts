import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Contract generation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id, contract_type = 'standard' } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id, contract_type });

    // Fetch complete invoice data
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
          start_time,
          serving_start_time,
          wait_staff_requested,
          chafers_requested,
          tables_chairs_requested,
          linens_requested,
          serving_utensils_requested,
          plates_requested,
          cups_requested,
          napkins_requested,
          ice_requested,
          primary_protein,
          secondary_protein,
          appetizers,
          sides,
          desserts,
          drinks,
          dietary_restrictions
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
      invoiceNumber: invoiceData.invoice_number,
      contractType: contract_type
    });

    // Calculate payment schedule
    const calculatePaymentSchedule = (totalAmount: number, eventDate: string, isGovernment = false) => {
      const eventDateTime = new Date(eventDate);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (isGovernment) {
        return {
          type: "Government Contract",
          terms: "Net 30 days after event completion",
          schedule: [{
            amount: totalAmount,
            description: "Full payment due 30 days after event completion",
            dueDate: new Date(eventDateTime.getTime() + 30 * 24 * 60 * 60 * 1000)
          }]
        };
      }

      if (daysUntilEvent <= 30) {
        return {
          type: "Short Notice Event",
          terms: "50% deposit, 50% due 10 days prior to event",
          schedule: [
            {
              amount: Math.round(totalAmount * 0.5),
              description: "Deposit to secure event date (50%)",
              dueDate: today
            },
            {
              amount: totalAmount - Math.round(totalAmount * 0.5),
              description: "Final payment due 10 days prior to event",
              dueDate: new Date(eventDateTime.getTime() - 10 * 24 * 60 * 60 * 1000)
            }
          ]
        };
      } else {
        return {
          type: "Standard Event",
          terms: "25% deposit, 50% due 30 days prior, 25% due 10 days prior to event",
          schedule: [
            {
              amount: Math.round(totalAmount * 0.25),
              description: "Deposit to secure event date (25%)",
              dueDate: today
            },
            {
              amount: Math.round(totalAmount * 0.5),
              description: "Second payment due 30 days prior to event",
              dueDate: new Date(eventDateTime.getTime() - 30 * 24 * 60 * 60 * 1000)
            },
            {
              amount: totalAmount - Math.round(totalAmount * 0.25) - Math.round(totalAmount * 0.5),
              description: "Final payment due 10 days prior to event",
              dueDate: new Date(eventDateTime.getTime() - 10 * 24 * 60 * 60 * 1000)
            }
          ]
        };
      }
    };

    const paymentSchedule = calculatePaymentSchedule(
      invoiceData.total_amount,
      invoiceData.quote_requests.event_date,
      contract_type === 'government' || invoiceData.draft_data?.is_government_contract
    );

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    // Generate contract HTML
    const contractHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Catering Service Agreement - ${invoiceData.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .contract-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
        .party-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .party { flex: 1; padding: 0 20px; }
        .party h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background-color: #f8fafc; font-weight: bold; }
        .highlight-box { background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
        .terms-list { margin-left: 20px; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 2px solid #333; padding-top: 10px; width: 300px; text-align: center; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Soul Train's Eatery</div>
        <div>Charleston's Premier Catering Service</div>
        <div style="margin-top: 10px; color: #666;">Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</div>
      </div>

      <div class="contract-title">CATERING SERVICE AGREEMENT</div>
      <div style="text-align: center; margin-bottom: 30px;">
        <strong>Contract #:</strong> ${invoiceData.invoice_number} | 
        <strong>Date:</strong> ${new Date().toLocaleDateString()} |
        <strong>Type:</strong> ${paymentSchedule.type}
      </div>

      <div class="party-info">
        <div class="party">
          <h3>Service Provider</h3>
          <p><strong>Soul Train's Eatery</strong><br>
          Charleston, SC<br>
          Phone: (843) 970-0265<br>
          Email: soultrainseatery@gmail.com<br>
          <em>Licensed Catering Service</em></p>
        </div>
        <div class="party">
          <h3>Client</h3>
          <p><strong>${invoiceData.customers.name}</strong><br>
          ${invoiceData.customers.address || 'Address on file'}<br>
          Phone: ${invoiceData.customers.phone}<br>
          Email: ${invoiceData.customers.email}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Event Details</div>
        <table>
          <tr><td><strong>Event Name</strong></td><td>${invoiceData.quote_requests.event_name}</td></tr>
          <tr><td><strong>Event Date</strong></td><td>${new Date(invoiceData.quote_requests.event_date).toLocaleDateString()}</td></tr>
          <tr><td><strong>Event Time</strong></td><td>${invoiceData.quote_requests.start_time || 'TBD'}</td></tr>
          <tr><td><strong>Service Start</strong></td><td>${invoiceData.quote_requests.serving_start_time || 'TBD'}</td></tr>
          <tr><td><strong>Location</strong></td><td>${invoiceData.quote_requests.location}</td></tr>
          <tr><td><strong>Guest Count</strong></td><td>${invoiceData.quote_requests.guest_count} guests</td></tr>
          <tr><td><strong>Service Type</strong></td><td>${invoiceData.quote_requests.service_type}</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Services & Menu Items</div>
        <table>
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
                  <strong>${item.title || 'Service Item'}</strong><br>
                  <small>${item.description}</small>
                </td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align: center;">No itemized services listed</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc;">
              <td colspan="3"><strong>Subtotal</strong></td>
              <td><strong>${formatCurrency(invoiceData.subtotal)}</strong></td>
            </tr>
            ${invoiceData.tax_amount > 0 ? `
            <tr style="background-color: #f8fafc;">
              <td colspan="3"><strong>Tax</strong></td>
              <td><strong>${formatCurrency(invoiceData.tax_amount)}</strong></td>
            </tr>
            ` : ''}
            <tr style="background-color: #2563eb; color: white;">
              <td colspan="3"><strong>TOTAL AMOUNT</strong></td>
              <td><strong>${formatCurrency(invoiceData.total_amount)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Payment Terms</div>
        <div class="highlight-box">
          <p><strong>Payment Schedule:</strong> ${paymentSchedule.terms}</p>
          <table style="margin-top: 15px;">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${paymentSchedule.schedule.map((payment, index) => `
                <tr>
                  <td>${payment.description}</td>
                  <td>${formatCurrency(payment.amount)}</td>
                  <td>${payment.dueDate.toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Terms and Conditions</div>
        
        <h4>1. Service Commitment</h4>
        <ul class="terms-list">
          <li>Soul Train's Eatery agrees to provide catering services as outlined in this agreement.</li>
          <li>All food will be prepared fresh using quality ingredients in our licensed kitchen facility.</li>
          <li>Service includes delivery, setup, and ${invoiceData.quote_requests.wait_staff_requested ? 'professional wait staff' : 'self-service setup'}.</li>
        </ul>

        <h4>2. Client Responsibilities</h4>
        <ul class="terms-list">
          <li>Final guest count must be confirmed 7 days prior to the event.</li>
          <li>Client must provide adequate power, water, and workspace access if required.</li>
          <li>Any changes to menu or guest count after 7 days may incur additional charges.</li>
          <li>Client is responsible for obtaining any required permits or licenses for the event.</li>
        </ul>

        <h4>3. Payment Terms</h4>
        <ul class="terms-list">
          <li>All payments must be made according to the schedule outlined above.</li>
          <li>Late payments may be subject to a 1.5% monthly service charge.</li>
          <li>We accept cash, check, credit cards, and electronic payments.</li>
          ${contract_type === 'government' ? '<li>Government contract terms apply - Net 30 days after event completion.</li>' : ''}
        </ul>

        <h4>4. Cancellation Policy</h4>
        <ul class="terms-list">
          <li>Cancellations more than 14 days prior: 50% deposit refund.</li>
          <li>Cancellations 7-14 days prior: 25% deposit refund.</li>
          <li>Cancellations less than 7 days: No refund of deposit.</li>
          <li>Weather-related cancellations will be handled on a case-by-case basis.</li>
        </ul>

        <h4>5. Liability and Insurance</h4>
        <ul class="terms-list">
          <li>Soul Train's Eatery carries comprehensive liability insurance for all catering events.</li>
          <li>Client is responsible for any damages to rented equipment not caused by normal use.</li>
          <li>Soul Train's Eatery is not responsible for items left at the event location.</li>
        </ul>

        ${contract_type === 'government' ? `
        <h4>6. Government Contract Compliance</h4>
        <ul class="terms-list">
          <li>This contract complies with applicable government procurement regulations.</li>
          <li>All required certifications and documentation are maintained on file.</li>
          <li>Minority/Women-owned business enterprise certification available upon request.</li>
          <li>All applicable tax exemptions will be applied as provided by law.</li>
        </ul>
        ` : ''}
      </div>

      ${invoiceData.quote_requests.special_requests ? `
      <div class="section">
        <div class="section-title">Special Requests & Notes</div>
        <div class="highlight-box">
          <p>${invoiceData.quote_requests.special_requests}</p>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Agreement</div>
        <p>By signing below, both parties agree to the terms and conditions outlined in this catering service agreement. This contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter.</p>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div style="margin-bottom: 40px;"></div>
          <div>Client Signature</div>
          <div style="margin-top: 10px; font-size: 14px;">
            ${invoiceData.customers.name}<br>
            Date: ________________
          </div>
        </div>
        <div class="signature-box">
          <div style="margin-bottom: 40px;"></div>
          <div>Soul Train's Eatery</div>
          <div style="margin-top: 10px; font-size: 14px;">
            Authorized Representative<br>
            Date: ________________
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This agreement is governed by the laws of South Carolina. Any disputes shall be resolved in Charleston County, SC.</p>
        <p><strong>Soul Train's Eatery</strong> | Licensed Catering Service | Charleston, SC | (843) 970-0265</p>
      </div>
    </body>
    </html>
    `;

    // Save contract to database
    const { data: contractData, error: contractError } = await supabaseClient
      .from('contracts')
      .upsert({
        invoice_id: invoice_id,
        contract_type: contract_type,
        contract_html: contractHtml,
        status: 'generated',
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'invoice_id' })
      .select()
      .single();

    if (contractError) {
      logStep("Warning: Failed to save contract to database", { error: contractError.message });
    }

    logStep("Contract generated successfully", { 
      contractId: contractData?.id,
      invoiceNumber: invoiceData.invoice_number 
    });

    return new Response(JSON.stringify({
      success: true,
      contract_html: contractHtml,
      contract_id: contractData?.id,
      contract_type: contract_type,
      invoice_number: invoiceData.invoice_number,
      payment_schedule: paymentSchedule
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