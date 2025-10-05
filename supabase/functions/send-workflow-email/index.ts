import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { TaxCalculationService } from '../_shared/TaxCalculationService.ts';

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

    // Fetch invoice line items for detailed breakdown
    const { data: lineItems } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('category', { ascending: true });

    // Validate and auto-fix totals before sending
    if (lineItems && lineItems.length > 0) {
      const calculatedSubtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const isGovContract = quote.compliance_level === 'government' || quote.requires_po_number === true;
      const taxCalc = TaxCalculationService.calculateTax(calculatedSubtotal, isGovContract);
      
      // Check for mismatch
      if (invoice.subtotal !== taxCalc.subtotal || 
          invoice.tax_amount !== taxCalc.taxAmount || 
          invoice.total_amount !== taxCalc.totalAmount) {
        
        console.warn('⚠️ Invoice totals mismatch detected! Auto-fixing...', {
          invoiceId,
          current: { subtotal: invoice.subtotal, tax: invoice.tax_amount, total: invoice.total_amount },
          calculated: { subtotal: taxCalc.subtotal, tax: taxCalc.taxAmount, total: taxCalc.totalAmount }
        });
        
        // Auto-fix the database
        await supabase
          .from('invoices')
          .update({
            subtotal: taxCalc.subtotal,
            tax_amount: taxCalc.taxAmount,
            total_amount: taxCalc.totalAmount,
          })
          .eq('id', invoiceId);
        
        // Update local invoice object for email generation
        invoice.subtotal = taxCalc.subtotal;
        invoice.tax_amount = taxCalc.taxAmount;
        invoice.total_amount = taxCalc.totalAmount;
      }
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
        htmlContent = generateEstimateEmail(quote, invoice, portalUrl, customMessage, lineItems || []);
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

// Title case formatters (inline since we can't import from src)
const formatCustomerName = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatEventName = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatLocation = (location: string): string => {
  if (!location) return '';
  const parts = location.split(',').map(part => part.trim());
  return parts.map((part, index) => {
    if (index === parts.length - 1 && part.length === 2) {
      return part.toUpperCase();
    }
    return part
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }).join(', ');
};

function generateEstimateEmail(quote: any, invoice: any, portalUrl: string, customMessage?: string, lineItems?: any[]): string {
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .header .tagline { margin: 10px 0 0; font-size: 16px; color: #FFD700; font-style: italic; }
    .header .subtitle { margin: 5px 0 0; font-size: 14px; color: rgba(255,255,255,0.9); }
    .content { padding: 40px 30px; }
    .greeting { color: #DC143C; font-size: 24px; margin-bottom: 10px; }
    .event-details { background: linear-gradient(to right, #FFF5E6, #FFE4E1); padding: 25px; border-radius: 8px; border-left: 4px solid #DC143C; margin: 25px 0; }
    .event-details h3 { color: #DC143C; margin: 0 0 15px 0; font-size: 18px; }
    .event-details table { width: 100%; font-size: 14px; }
    .event-details td { padding: 8px 0; }
    .menu-title { color: #DC143C; margin: 35px 0 20px; font-size: 22px; border-bottom: 3px solid #FFD700; padding-bottom: 10px; }
    .menu-subtitle { font-size: 14px; color: #666; font-style: italic; margin-bottom: 20px; }
    table.items { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table.items thead tr { background: linear-gradient(135deg, #DC143C, #B91C3C); color: white; }
    table.items th { text-align: left; padding: 15px; font-weight: 600; }
    table.items tbody tr:nth-child(even) { background: #FFF5E6; }
    table.items tbody tr:nth-child(odd) { background: #fff; }
    table.items tbody tr { border-bottom: 1px solid #e9ecef; }
    table.items td { padding: 15px; }
    table.items .item-title { font-weight: 600; color: #333; margin-bottom: 4px; }
    table.items .item-desc { font-size: 12px; color: #666; line-height: 1.4; }
    table.items tfoot tr { background: #FFF5E6; }
    table.items .total-row { background: linear-gradient(135deg, #DC143C, #B91C3C) !important; color: white; }
    .btn { display: inline-block; background: linear-gradient(135deg, #DC143C, #B91C3C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3); margin: 30px 0; }
    .btn-note { margin-top: 15px; font-size: 13px; color: #666; }
    .footer { background: linear-gradient(to right, #f8f9fa, #e9ecef); padding: 30px; text-align: center; border-top: 3px solid #FFD700; }
    .footer .title { margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #333; }
    .footer .contact { margin: 5px 0; color: #666; }
    .footer .contact a { color: #DC143C; text-decoration: none; }
    .footer .tagline-footer { margin: 15px 0 5px; font-size: 12px; color: #999; }
    .footer .love { margin: 5px 0; font-size: 12px; color: #999; font-style: italic; }
    .terms { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 13px; }
    .terms h3 { color: #DC143C; margin-bottom: 15px; }
    .terms h4 { color: #333; font-size: 14px; margin: 15px 0 5px; }
    .terms p { color: #666; margin: 0 0 10px; }
    @media only screen and (max-width: 600px) {
      .container { border-radius: 0 !important; }
      .header { padding: 25px 15px !important; }
      .header h1 { font-size: 24px !important; }
      .content { padding: 20px 15px !important; }
      table.items { font-size: 12px !important; }
      table.items th, table.items td { padding: 10px 8px !important; }
      .btn { padding: 14px 30px !important; font-size: 16px !important; display: block !important; margin: 20px auto !important; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Soul Train's Eatery</h1>
      <p class="tagline">Where Southern Soul Meets Lowcountry Love</p>
      <p class="subtitle">Charleston's Premier Family-Run Catering</p>
    </div>
    <div class="content">
      <h2 class="greeting">Hello ${formatCustomerName(quote.contact_name)}! 👋</h2>
      <p style="font-size: 16px; line-height: 1.8; color: #333;">
        ${customMessage || `We're so excited to be part of your special day! Here's your personalized estimate for ${formatEventName(quote.event_name)}. We've hand-picked the perfect menu to make your celebration unforgettable.`}
      </p>
      
      <div class="event-details">
        <h3>📅 Your Event Details</h3>
        <table>
          <tr>
            <td style="color: #666;"><strong>🗓️ Date:</strong></td>
            <td style="color: #333;">${new Date(quote.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>👥 Guests:</strong></td>
            <td style="color: #333;">${quote.guest_count} hungry souls</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>📍 Location:</strong></td>
            <td style="color: #333;">${formatLocation(quote.location)}</td>
          </tr>
        </table>
      </div>
      
      <h3 class="menu-title">🍴 Your Soul Food Menu</h3>
      <p class="menu-subtitle">Prepared fresh with love, just like Grandma used to make</p>
      
      ${lineItems && lineItems.length > 0 ? `
      <table class="items">
        <thead>
          <tr>
            <th>Menu Item</th>
            <th style="text-align: center;">Servings</th>
            <th style="text-align: right;">Price per</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems.map((item, idx) => `
            <tr>
              <td>
                <div class="item-title">${item.title || 'Item'}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </td>
              <td style="text-align: center; color: #666; font-weight: 500;">${item.quantity}</td>
              <td style="text-align: right; color: #666;">${formatCurrency(item.unit_price)}</td>
              <td style="text-align: right; font-weight: 600; color: #DC143C;">${formatCurrency(item.total_price)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          ${(() => {
            // Calculate totals from line items using shared service
            const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
            const isGovContract = quote.compliance_level === 'government' || quote.requires_po_number === true;
            const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);
            
            return `
              <tr>
                <td colspan="3" style="text-align: right; padding: 15px; font-weight: 600; color: #666;">Subtotal:</td>
                <td style="text-align: right; padding: 15px; font-weight: 600;">${formatCurrency(taxCalc.subtotal)}</td>
              </tr>
              ${taxCalc.taxAmount > 0 ? `
              <tr>
                <td colspan="3" style="text-align: right; padding: 15px; color: #666;">Tax (${TaxCalculationService.formatTaxRate()}):</td>
                <td style="text-align: right; padding: 15px;">${formatCurrency(taxCalc.taxAmount)}</td>
              </tr>
              ` : ''}
              ${taxCalc.isExempt ? `
              <tr>
                <td colspan="3" style="text-align: right; padding: 15px; color: #666; font-style: italic;">Tax Exempt (Government Contract)</td>
                <td style="text-align: right; padding: 15px;"></td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding: 18px; font-weight: 700; font-size: 18px;">Your Total Investment:</td>
                <td style="text-align: right; padding: 18px; font-weight: 700; font-size: 20px;">${formatCurrency(taxCalc.totalAmount)}</td>
              </tr>
            `;
          })()}
        </tfoot>
      </table>
      ` : `
      <p><strong>Total Estimate: ${formatCurrency(invoice.total_amount)}</strong></p>
      `}
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${portalUrl}" class="btn">👉 View & Approve Your Estimate</a>
        <p class="btn-note">Questions? We're here to help make your event perfect!</p>
      </div>
      
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
      <p class="title">📞 Contact Soul Train's Eatery</p>
      <p class="contact"><strong>Phone:</strong> <a href="tel:8439700265">(843) 970-0265</a></p>
      <p class="contact"><strong>Email:</strong> <a href="mailto:soultrainseatery@gmail.com">soultrainseatery@gmail.com</a></p>
      <p class="tagline-footer">Proudly serving Charleston's Lowcountry and surrounding areas</p>
      <p class="love">❤️ Made with Southern Love by the Soul Train Family</p>
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
