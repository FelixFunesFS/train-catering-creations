import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowEmailRequest {
  quoteId: string;
  invoiceId: string;
  emailType: 'estimate' | 'contract' | 'payment_request' | 'event_confirmation' | 'thank_you_feedback';
  contractId?: string;
  milestoneId?: string;
  notes?: string;
  customSubject?: string;
  customMessage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      quoteId, 
      invoiceId, 
      emailType, 
      contractId, 
      milestoneId, 
      notes,
      customSubject,
      customMessage 
    }: WorkflowEmailRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://id-preview--c4c8d2d1-63da-4772-a95b-bf211f87a132.lovable.app';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch comprehensive data
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!quote || !invoice) {
      throw new Error('Quote or invoice not found');
    }

    // Generate portal access token if needed
    const portalToken = invoice.customer_access_token;
    const portalUrl = `${frontendUrl}/customer-portal?token=${portalToken}`;

    // Build email content based on type
    let subject: string;
    let htmlContent: string;

    switch (emailType) {
      case 'estimate':
        subject = customSubject || `Your Estimate - Soul Train's Eatery`;
        htmlContent = generateEstimateEmail(quote, invoice, portalUrl, customMessage);
        break;
      
      case 'contract':
        subject = 'Your Contract is Ready for Signature';
        htmlContent = generateContractEmail(quote, invoice, contractId!, portalUrl);
        break;
      
      case 'payment_request':
        subject = 'Payment Request - Soul Train\'s Eatery';
        htmlContent = await generatePaymentEmail(quote, invoice, milestoneId, portalUrl, supabase);
        break;
      
      case 'event_confirmation':
        subject = `Event Confirmed: ${quote.event_name}`;
        htmlContent = generateConfirmationEmail(quote, invoice, notes, portalUrl);
        break;
      
      case 'thank_you_feedback':
        subject = `Thank You for Choosing Soul Train's Eatery!`;
        htmlContent = generateThankYouEmail(quote, invoice, portalUrl);
        break;
      
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    // Send via Gmail
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject,
        html: htmlContent,
        from: 'soultrainseatery@gmail.com'
      }
    });

    if (emailError) throw emailError;

    // Update tracking based on email type
    if (emailType === 'estimate') {
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          workflow_status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    }

    return new Response(
      JSON.stringify({ success: true, portalUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in send-workflow-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

function generateEstimateEmail(quote: any, invoice: any, portalUrl: string, customMessage?: string): string {
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  
  // Determine event type for T&C
  const eventType = ['wedding', 'second_wedding'].includes(quote.event_type) 
    ? 'wedding' 
    : quote.compliance_level === 'government' 
      ? 'government' 
      : 'standard';
  
  // Generate T&C HTML if included
  const termsHTML = invoice.include_terms_and_conditions ? generateTermsHTML(eventType) : '';
  
  const contractNote = invoice.requires_separate_contract
    ? '<li>Sign your service agreement</li>'
    : '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .terms { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 13px; }
    .terms h3 { color: #DC143C; margin-bottom: 15px; }
    .terms h4 { color: #333; font-size: 14px; margin: 15px 0 5px; }
    .terms p { color: #666; margin: 0 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">Soul Train's Eatery</h1>
      <p style="margin:5px 0">Authentic Southern Catering</p>
    </div>
    <div class="content">
      <h2>Your Estimate for ${quote.event_name}</h2>
      <p>${customMessage || `Thank you for considering Soul Train's Eatery for your upcoming ${quote.event_name}!`}</p>
      
      <p><strong>Event Details:</strong></p>
      <ul>
        <li>Date: ${new Date(quote.event_date).toLocaleDateString()}</li>
        <li>Guests: ${quote.guest_count}</li>
        <li>Location: ${quote.location}</li>
      </ul>
      
      <p><strong>Total Estimate: ${formatCurrency(invoice.total_amount)}</strong></p>
      
      <a href="${portalUrl}" class="btn">View & Approve Estimate</a>
      
      <p>Use the customer portal to:</p>
      <ul>
        <li>Review detailed pricing breakdown</li>
        ${contractNote}
        <li>Approve estimate and make payment</li>
        <li>Request changes if needed</li>
      </ul>
      
      ${termsHTML}
      
      ${!invoice.requires_separate_contract ? `
        <p style="font-size: 13px; color: #666; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0;">
          <strong>Note:</strong> By approving this estimate, you acknowledge that you have read and agree to the Terms & Conditions above. No separate contract signature is required for this event.
        </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateTermsHTML(eventType: 'standard' | 'wedding' | 'government'): string {
  const terms = getTermsByType(eventType);
  
  return `
    <div class="terms">
      <h3>Terms & Conditions</h3>
      ${terms.map(section => `
        <h4>${section.title}</h4>
        <p>${section.content}</p>
      `).join('')}
      <p style="font-size: 12px; color: #999; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
        By accepting this estimate, you acknowledge that you have read and agree to these terms and conditions.
      </p>
    </div>
  `;
}

function getTermsByType(eventType: 'standard' | 'wedding' | 'government') {
  const baseTerms = [
    { title: '1. Payment Terms', content: 'A deposit of 50% is required to secure your event date. The remaining balance is due 10 days prior to your event. Accepted payment methods include credit card, debit card, or bank transfer.' },
    { title: '2. Cancellation Policy', content: 'Cancellations made more than 30 days before the event will receive a full refund minus a $100 processing fee. Cancellations made 15-30 days before will receive a 50% refund. Cancellations made less than 15 days before the event are non-refundable.' },
    { title: '3. Guest Count Changes', content: 'Final guest count must be confirmed 7 days prior to the event. You will be charged for the confirmed guest count or actual guests served, whichever is greater.' },
    { title: '4. Service & Delivery', content: 'Soul Train\'s Eatery will arrive at the designated time to set up and serve. Client is responsible for providing adequate space, access, and facilities.' },
    { title: '5. Food Safety & Liability', content: 'All food is prepared in licensed kitchen facilities following food safety regulations. Client assumes responsibility for any food allergies or dietary restrictions not communicated in advance.' },
    { title: '6. Equipment & Rentals', content: 'Standard serving equipment, chafing dishes, and utensils are included. Specialty rentals are available for an additional fee.' }
  ];

  if (eventType === 'wedding') {
    baseTerms.push({ title: '7. Wedding Specific Terms', content: 'A tasting session is included for events over 100 guests. Menu changes must be finalized 30 days before the event.' });
  }

  if (eventType === 'government') {
    baseTerms.push({ title: '7. Government Contract Compliance', content: 'All services rendered comply with applicable government procurement regulations. Proper documentation will be provided as required.' });
  }

  return baseTerms;
}

function generateContractEmail(quote: any, invoice: any, contractId: string, portalUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">Soul Train's Eatery</h1>
      <p style="margin:5px 0">Contract Ready for Signature</p>
    </div>
    <div class="content">
      <h2>Your Contract is Ready!</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>Great news! Your contract for ${quote.event_name} is ready for your signature.</p>
      
      <p><strong>Event Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
      
      <a href="${portalUrl}" class="btn">Review & Sign Contract</a>
      
      <p>Once you've signed, we'll move forward with securing your event date and finalizing all details.</p>
      
      <p>If you have any questions, please don't hesitate to reach out!</p>
    </div>
    <div class="footer">
      <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function generatePaymentEmail(quote: any, invoice: any, milestoneId: string | undefined, portalUrl: string, supabase: any): Promise<string> {
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  let paymentDetails = '';
  if (milestoneId) {
    const { data: milestone } = await supabase
      .from('payment_milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();
    
    if (milestone) {
      paymentDetails = `
        <p><strong>Payment Due:</strong></p>
        <ul>
          <li>Type: ${milestone.milestone_type}</li>
          <li>Amount: ${formatCurrency(milestone.amount_cents)}</li>
          <li>Due Date: ${new Date(milestone.due_date).toLocaleDateString()}</li>
        </ul>
      `;
    }
  } else {
    paymentDetails = `<p><strong>Amount Due: ${formatCurrency(invoice.total_amount)}</strong></p>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">Soul Train's Eatery</h1>
      <p style="margin:5px 0">Payment Request</p>
    </div>
    <div class="content">
      <h2>Payment for ${quote.event_name}</h2>
      <p>Dear ${quote.contact_name},</p>
      ${paymentDetails}
      
      <a href="${portalUrl}" class="btn">Make Payment</a>
      
      <p>You can pay securely through our customer portal using credit/debit card.</p>
    </div>
    <div class="footer">
      <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateConfirmationEmail(quote: any, invoice: any, notes: string | undefined, portalUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">Soul Train's Eatery</h1>
      <p style="margin:5px 0">Event Confirmed!</p>
    </div>
    <div class="content">
      <h2>Your Event is Confirmed!</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>We're excited to confirm your event!</p>
      
      <p><strong>Event Details:</strong></p>
      <ul>
        <li>Event: ${quote.event_name}</li>
        <li>Date: ${new Date(quote.event_date).toLocaleDateString()}</li>
        <li>Time: ${quote.start_time}</li>
        <li>Location: ${quote.location}</li>
        <li>Guests: ${quote.guest_count}</li>
      </ul>
      
      ${notes ? `<p><strong>Additional Notes:</strong><br>${notes}</p>` : ''}
      
      <a href="${portalUrl}" class="btn">View Event Timeline & Details</a>
      
      <p>We'll be in touch as we get closer to your event date to finalize all the details!</p>
    </div>
    <div class="footer">
      <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateThankYouEmail(quote: any, invoice: any, portalUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">Soul Train's Eatery</h1>
      <p style="margin:5px 0">Thank You!</p>
    </div>
    <div class="content">
      <h2>Thank You for Choosing Us!</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>Thank you for allowing Soul Train's Eatery to be part of your special event! We hope you and your guests enjoyed the food and service.</p>
      
      <p>We'd love to hear about your experience. Would you mind taking a moment to share your feedback?</p>
      
      <a href="${portalUrl}" class="btn">Share Your Feedback</a>
      
      <p>We appreciate your business and look forward to serving you again in the future!</p>
      
      <p>Warm regards,<br>Soul Train's Eatery Team</p>
    </div>
    <div class="footer">
      <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}
