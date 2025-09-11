import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONTRACT-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize services
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    const { 
      contract_id, 
      customer_email, 
      customer_name, 
      event_name 
    } = await req.json();

    logStep("Request data", { contract_id, customer_email, customer_name, event_name });

    if (!contract_id || !customer_email) {
      throw new Error("Missing required fields: contract_id, customer_email");
    }

    // Get contract details
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select(`
        *,
        invoices!inner(
          id,
          total_amount,
          quote_requests!inner(
            contact_name,
            event_name,
            event_date,
            location
          )
        )
      `)
      .eq('id', contract_id)
      .maybeSingle();

    if (contractError || !contract) {
      throw new Error(`Contract not found: ${contractError?.message}`);
    }

    logStep("Contract retrieved", { contractId: contract.id, status: contract.status });

    const eventDetails = contract.invoices.quote_requests;
    const customerDisplayName = customer_name || eventDetails.contact_name;
    const eventDisplayName = event_name || eventDetails.event_name;

    // Create contract viewing URL (you may want to implement a contract viewing page)
    const contractViewUrl = `${req.headers.get("origin")}/contract/${contract.id}`;

    // Send email with contract
    const emailResponse = await resend.emails.send({
      from: "Soul Train's Eatery <catering@soultrainseatery.com>",
      to: [customer_email],
      subject: `Service Contract for ${eventDisplayName} - Soul Train's Eatery`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Georgia, serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #8B4513;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #8B4513;
                    margin-bottom: 5px;
                }
                .tagline {
                    font-size: 14px;
                    color: #666;
                    font-style: italic;
                }
                .content {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .event-details {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .cta-button {
                    display: inline-block;
                    background-color: #8B4513;
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">Soul Train's Eatery</div>
                <div class="tagline">Bringing people together around exceptional food</div>
            </div>

            <div class="content">
                <p>Dear ${customerDisplayName},</p>

                <p>Thank you for choosing Soul Train's Eatery for your upcoming event! We're excited to provide exceptional catering services for <strong>${eventDisplayName}</strong>.</p>

                <p>Your service contract is now ready for review and signature. This contract includes all the details we've discussed, including menu items, pricing, and payment schedule.</p>

                <div class="event-details">
                    <strong>Event Details:</strong><br>
                    <strong>Event:</strong> ${eventDisplayName}<br>
                    <strong>Date:</strong> ${new Date(eventDetails.event_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}<br>
                    <strong>Location:</strong> ${eventDetails.location}<br>
                    <strong>Total Value:</strong> $${(contract.invoices.total_amount / 100).toLocaleString()}
                </div>

                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Review the attached contract carefully</li>
                    <li>Sign and return the contract to confirm your booking</li>
                    <li>We'll send you payment instructions for your first payment</li>
                </ol>

                <p>If you have any questions about the contract or need any modifications, please don't hesitate to reach out to us. We're here to make your event perfect!</p>

                <p>We look forward to serving you and your guests with our authentic Southern cuisine.</p>

                <p>Best regards,<br>
                The Soul Train's Eatery Team</p>
            </div>

            <div class="footer">
                <p><strong>Soul Train's Eatery</strong><br>
                Phone: (843) 970-0265<br>
                Email: soultrainseatery@gmail.com<br>
                Proudly serving Charleston's Lowcountry and surrounding areas</p>
            </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Contract-${eventDisplayName.replace(/[^a-zA-Z0-9]/g, '-')}.html`,
          content: Buffer.from(contract.contract_html).toString('base64'),
          content_type: 'text/html'
        }
      ]
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    // Update contract status
    const { error: updateError } = await supabaseClient
      .from('contracts')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', contract_id);

    if (updateError) {
      logStep("Warning: Failed to update contract status", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      success: true,
      email_id: emailResponse.data?.id,
      message: "Contract sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Failed to send contract email"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});