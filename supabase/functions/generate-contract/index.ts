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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      invoice_id, 
      quote_request_id, 
      contract_type = 'standard',
      customer_data,
      payment_schedule
    } = await req.json();

    logStep("Request data", { invoice_id, quote_request_id, contract_type });

    if (!invoice_id || !quote_request_id) {
      throw new Error("Missing required fields: invoice_id, quote_request_id");
    }

    // Get invoice and quote details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*),
        quote_requests!inner(*)
      `)
      .eq('id', invoice_id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    // Get payment milestones if not provided
    let milestones = payment_schedule;
    if (!milestones) {
      const { data: milestonesData, error: milestonesError } = await supabaseClient
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoice_id)
        .order('due_date', { ascending: true });

      if (milestonesError) {
        throw new Error(`Failed to get payment schedule: ${milestonesError.message}`);
      }
      milestones = milestonesData || [];
    }

    logStep("Data retrieved", { lineItems: invoice.invoice_line_items?.length, milestones: milestones.length });

    // Generate contract HTML
    const contractHtml = generateContractHTML(invoice, customer_data || invoice.quote_requests, milestones);

    // Save contract to database
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .insert({
        invoice_id: invoice_id,
        contract_type: contract_type,
        contract_html: contractHtml,
        status: 'generated',
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contractError) {
      throw new Error(`Failed to save contract: ${contractError.message}`);
    }

    logStep("Contract generated", { contractId: contract.id });

    return new Response(JSON.stringify({ 
      contract_id: contract.id,
      status: 'generated',
      message: 'Contract generated successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Failed to generate contract"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateContractHTML(invoice: any, customerData: any, milestones: any[]): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catering Service Contract</title>
    <style>
        body {
            font-family: Georgia, serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #8B4513;
            margin-bottom: 5px;
        }
        
        .tagline {
            font-size: 16px;
            color: #666;
            font-style: italic;
        }
        
        .contract-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #8B4513;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .party-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
        }
        
        .party-box {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #f9f9f9;
        }
        
        .event-details {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .menu-items {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .menu-item {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .menu-item:last-child {
            border-bottom: none;
        }
        
        .menu-item.total {
            background: #8B4513;
            color: white;
            font-weight: bold;
        }
        
        .payment-schedule {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .payment-item {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 10px;
            align-items: center;
        }
        
        .payment-item:last-child {
            border-bottom: none;
        }
        
        .payment-item.header {
            background: #8B4513;
            color: white;
            font-weight: bold;
        }
        
        .terms {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
        }
        
        .signature-box {
            text-align: center;
            border-top: 2px solid #333;
            padding-top: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Soul Train's Eatery</div>
        <div class="tagline">Bringing people together around exceptional food</div>
        <div style="margin-top: 10px; font-size: 14px;">
            Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com<br>
            Proudly serving Charleston's Lowcountry and surrounding areas
        </div>
    </div>

    <div class="contract-title">Catering Service Agreement</div>

    <div class="section">
        <div class="party-info">
            <div class="party-box">
                <strong>Service Provider:</strong><br>
                Soul Train's Eatery<br>
                Charleston, SC<br>
                Phone: (843) 970-0265<br>
                Email: soultrainseatery@gmail.com
            </div>
            <div class="party-box">
                <strong>Client:</strong><br>
                ${customerData.contact_name}<br>
                Email: ${customerData.email}<br>
                Phone: ${customerData.phone || 'Not provided'}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Event Details</div>
        <div class="event-details">
            <strong>Event Name:</strong> ${customerData.event_name}<br>
            <strong>Event Date:</strong> ${formatDate(customerData.event_date)}<br>
            <strong>Location:</strong> ${customerData.location}<br>
            <strong>Guest Count:</strong> ${customerData.guest_count} people<br>
            <strong>Service Type:</strong> ${invoice.quote_requests?.service_type || 'Full Service Catering'}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Menu & Services</div>
        <div class="menu-items">
            ${invoice.invoice_line_items?.map((item: any) => `
            <div class="menu-item">
                <div>
                    <strong>${item.title || item.description}</strong>
                    ${item.description && item.title ? `<br><small>${item.description}</small>` : ''}
                </div>
                <div>Qty: ${item.quantity}</div>
                <div>${formatCurrency(item.total_price)}</div>
            </div>
            `).join('') || '<div class="menu-item">Menu items will be confirmed</div>'}
            <div class="menu-item total">
                <div>Total Contract Value</div>
                <div></div>
                <div>${formatCurrency(invoice.total_amount)}</div>
            </div>
        </div>
    </div>

    ${milestones.length > 0 ? `
    <div class="section">
        <div class="section-title">Payment Schedule</div>
        <div class="payment-schedule">
            <div class="payment-item header">
                <div>Payment Description</div>
                <div>Amount</div>
                <div>Due Date</div>
            </div>
            ${milestones.map((milestone: any) => `
            <div class="payment-item">
                <div>${milestone.description}</div>
                <div>${formatCurrency(milestone.amount_cents)}</div>
                <div>
                    ${milestone.is_due_now ? 'Due upon signing' : 
                      milestone.is_net30 ? 'Net 30 after event' :
                      milestone.due_date ? formatDate(milestone.due_date) : 'TBD'}
                </div>
            </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Terms and Conditions</div>
        <div class="terms">
            <p><strong>1. Services:</strong> Soul Train's Eatery agrees to provide catering services as specified above for the agreed-upon event date, time, and location.</p>
            
            <p><strong>2. Payment Terms:</strong> Payment schedule as outlined above. All payments are due on the specified dates. Late payments may incur additional fees.</p>
            
            <p><strong>3. Cancellation Policy:</strong> Cancellations made more than 14 days before the event will receive a full refund minus a 10% processing fee. Cancellations made within 14 days are subject to forfeiture of the deposit.</p>
            
            <p><strong>4. Menu Changes:</strong> Any changes to the menu or guest count must be communicated at least 7 days before the event and may result in price adjustments.</p>
            
            <p><strong>5. Force Majeure:</strong> Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control.</p>
            
            <p><strong>6. Liability:</strong> Soul Train's Eatery's liability is limited to the contract value. Client is responsible for venue requirements and permits.</p>
            
            <p><strong>7. Governing Law:</strong> This agreement shall be governed by the laws of South Carolina.</p>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div>Client Signature</div>
            <div style="margin-top: 30px; font-size: 14px;">Date: ___________</div>
        </div>
        <div class="signature-box">
            <div>Soul Train's Eatery Representative</div>
            <div style="margin-top: 30px; font-size: 14px;">Date: ___________</div>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for choosing Soul Train's Eatery for your special event!</p>
        <p>Contract generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
</body>
</html>
  `;
}