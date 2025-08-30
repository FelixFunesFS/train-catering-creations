import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GOVERNMENT-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Government contract workflow started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { quote_request_id, action = 'initialize' } = await req.json();
    if (!quote_request_id) throw new Error("quote_request_id is required");

    logStep("Processing government contract workflow", { quote_request_id, action });

    // Fetch quote request data
    const { data: quoteData, error: quoteError } = await supabaseClient
      .from("quote_requests")
      .select("*")
      .eq("id", quote_request_id)
      .single();

    if (quoteError || !quoteData) {
      throw new Error("Quote request not found");
    }

    logStep("Quote data fetched", { 
      eventName: quoteData.event_name,
      guestCount: quoteData.guest_count 
    });

    switch (action) {
      case 'initialize':
        return await initializeGovernmentContract(supabaseClient, quoteData);
      
      case 'generate_compliance_docs':
        return await generateComplianceDocs(supabaseClient, quoteData);
      
      case 'submit_for_approval':
        return await submitForGovernmentApproval(supabaseClient, quoteData);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function initializeGovernmentContract(supabaseClient: any, quoteData: any) {
  logStep("Initializing government contract");

  // Update quote request to mark as government contract
  const { error: updateError } = await supabaseClient
    .from("quote_requests")
    .update({
      status: 'government_review',
      updated_at: new Date().toISOString()
    })
    .eq("id", quoteData.id);

  if (updateError) {
    throw new Error(`Failed to update quote status: ${updateError.message}`);
  }

  // Create government contract record
  const { data: govContractData, error: govContractError } = await supabaseClient
    .from("government_contracts")
    .insert({
      quote_request_id: quoteData.id,
      contract_status: 'initiated',
      compliance_checklist: {
        vendor_registration: false,
        insurance_verified: false,
        tax_exempt_applied: false,
        minority_certification: false,
        background_check: false,
        licensing_verified: false
      },
      required_documents: [
        'Certificate of Insurance',
        'Business License',
        'Tax Exemption Certificate',
        'W-9 Form',
        'Vendor Registration',
        'Food Service License'
      ],
      special_requirements: {
        net_payment_terms: 30,
        requires_purchase_order: true,
        requires_multiple_quotes: quoteData.estimated_total > 250000, // $2,500 threshold
        requires_board_approval: quoteData.estimated_total > 500000, // $5,000 threshold
        tax_exempt: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (govContractError) {
    throw new Error(`Failed to create government contract record: ${govContractError.message}`);
  }

  // Send government contract initiation email
  const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 20px; background-color: #1e40af; color: white; margin-bottom: 30px; }
      .content { padding: 20px; }
      .compliance-box { background-color: #eff6ff; border: 2px solid #1e40af; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Soul Train's Eatery</h1>
      <p>Government Contract Initiation</p>
    </div>
    
    <div class="content">
      <p>Dear ${quoteData.contact_name},</p>
      
      <p>Thank you for considering Soul Train's Eatery for your government catering needs. We're honored to serve our community's public institutions.</p>
      
      <div class="compliance-box">
        <h3>Government Contract Process</h3>
        <p>As a government contractor, we maintain full compliance with all applicable regulations:</p>
        <ul>
          <li>✓ Licensed and insured catering service</li>
          <li>✓ Tax-exempt status processing</li>
          <li>✓ Minority/Women-owned business certification available</li>
          <li>✓ Net 30 payment terms (standard government contract)</li>
          <li>✓ Purchase order system compatibility</li>
        </ul>
      </div>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>We'll prepare a detailed quote with government-specific terms</li>
        <li>Required documentation will be provided for your procurement process</li>
        <li>Contract will include all necessary compliance certifications</li>
        <li>Payment terms: Net 30 days after event completion</li>
      </ol>
      
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Event:</strong> ${quoteData.event_name}</li>
        <li><strong>Date:</strong> ${new Date(quoteData.event_date).toLocaleDateString()}</li>
        <li><strong>Guest Count:</strong> ${quoteData.guest_count}</li>
        <li><strong>Location:</strong> ${quoteData.location}</li>
      </ul>
      
      <p>A detailed quote will be prepared within 48 hours. If you have specific procurement requirements or need additional documentation, please let us know.</p>
      
      <p>Thank you for your service to our community!</p>
      
      <p>Best regards,<br>
      The Soul Train's Eatery Team</p>
    </div>
    
    <div class="footer">
      <p><strong>Soul Train's Eatery</strong> - Certified Government Contractor<br>
      Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com<br>
      Business License: [License Number] | Tax ID: [Tax ID]</p>
    </div>
  </body>
  </html>
  `;

  // Send email
  const { error: emailError } = await supabaseClient.functions.invoke('send-gmail-email', {
    body: {
      to: quoteData.email,
      subject: `Government Contract Initiated - ${quoteData.event_name}`,
      html: emailContent
    }
  });

  if (emailError) {
    logStep("Warning: Failed to send government contract email", { error: emailError.message });
  }

  logStep("Government contract initialized successfully", { 
    contractId: govContractData.id,
    quoteId: quoteData.id 
  });

  return new Response(JSON.stringify({
    success: true,
    government_contract_id: govContractData.id,
    status: 'initiated',
    message: "Government contract workflow initiated successfully",
    compliance_requirements: govContractData.required_documents,
    special_requirements: govContractData.special_requirements
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function generateComplianceDocs(supabaseClient: any, quoteData: any) {
  logStep("Generating compliance documentation");

  // This would integrate with document generation services
  // For now, we'll create a compliance checklist and documentation packet

  const compliancePacket = {
    business_information: {
      legal_name: "Soul Train's Eatery LLC",
      dba: "Soul Train's Eatery",
      address: "Charleston, SC",
      phone: "(843) 970-0265",
      email: "soultrainseatery@gmail.com",
      business_license: "[License Number]",
      tax_id: "[Federal Tax ID]",
      duns_number: "[DUNS Number if applicable]"
    },
    certifications: {
      business_license: {
        status: "active",
        expiration_date: "2025-12-31",
        issuing_authority: "Charleston County"
      },
      food_service_license: {
        status: "active",
        expiration_date: "2025-12-31",
        issuing_authority: "SC Department of Health"
      },
      liability_insurance: {
        provider: "[Insurance Company]",
        policy_number: "[Policy Number]",
        coverage_amount: "$1,000,000",
        expiration_date: "2025-12-31"
      }
    },
    compliance_statements: {
      equal_opportunity: true,
      drug_free_workplace: true,
      background_checks: true,
      tax_exempt_processing: true
    }
  };

  // Update government contract with compliance documentation
  const { error: updateError } = await supabaseClient
    .from("government_contracts")
    .update({
      compliance_documentation: compliancePacket,
      contract_status: 'compliance_ready',
      updated_at: new Date().toISOString()
    })
    .eq("quote_request_id", quoteData.id);

  if (updateError) {
    throw new Error(`Failed to update compliance documentation: ${updateError.message}`);
  }

  logStep("Compliance documentation generated successfully");

  return new Response(JSON.stringify({
    success: true,
    message: "Compliance documentation generated",
    compliance_packet: compliancePacket
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function submitForGovernmentApproval(supabaseClient: any, quoteData: any) {
  logStep("Submitting for government approval");

  // Update status to submitted for approval
  const { error: updateError } = await supabaseClient
    .from("government_contracts")
    .update({
      contract_status: 'submitted_for_approval',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("quote_request_id", quoteData.id);

  if (updateError) {
    throw new Error(`Failed to update submission status: ${updateError.message}`);
  }

  // Send submission confirmation email
  const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 20px; background-color: #059669; color: white; margin-bottom: 30px; }
      .content { padding: 20px; }
      .highlight { background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
      .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Soul Train's Eatery</h1>
      <p>Government Contract Submission Confirmed</p>
    </div>
    
    <div class="content">
      <p>Dear ${quoteData.contact_name},</p>
      
      <div class="highlight">
        <h3>✅ Contract Submitted for Approval</h3>
        <p>Your government catering contract has been submitted for official approval through your procurement process.</p>
      </div>
      
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li><strong>Event:</strong> ${quoteData.event_name}</li>
        <li><strong>Date:</strong> ${new Date(quoteData.event_date).toLocaleDateString()}</li>
        <li><strong>Contract Type:</strong> Government Catering Services</li>
        <li><strong>Payment Terms:</strong> Net 30 days after event completion</li>
        <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
      
      <p><strong>Included Documentation:</strong></p>
      <ul>
        <li>✓ Detailed service agreement</li>
        <li>✓ Business license and certifications</li>
        <li>✓ Insurance certificates</li>
        <li>✓ Tax exemption processing</li>
        <li>✓ Compliance certifications</li>
      </ul>
      
      <p>We'll monitor the approval process and contact you once we receive official authorization to proceed.</p>
      
      <p>Thank you for choosing Soul Train's Eatery for your government catering needs!</p>
      
      <p>Best regards,<br>
      The Soul Train's Eatery Team</p>
    </div>
    
    <div class="footer">
      <p><strong>Soul Train's Eatery</strong> - Certified Government Contractor<br>
      Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</p>
    </div>
  </body>
  </html>
  `;

  // Send email
  const { error: emailError } = await supabaseClient.functions.invoke('send-gmail-email', {
    body: {
      to: quoteData.email,
      subject: `Government Contract Submitted - ${quoteData.event_name}`,
      html: emailContent
    }
  });

  if (emailError) {
    logStep("Warning: Failed to send submission confirmation email", { error: emailError.message });
  }

  logStep("Government contract submitted successfully");

  return new Response(JSON.stringify({
    success: true,
    message: "Government contract submitted for approval",
    status: 'submitted_for_approval',
    submitted_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}