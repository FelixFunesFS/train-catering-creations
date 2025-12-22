import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { generateStandardEmail, EMAIL_CONFIGS, EmailType } from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  // Legacy mode (SMTP test)
  fromEmail?: string;
  toEmail: string;
  // New mode (template preview test)
  emailType?: EmailType;
  variant?: 'customer' | 'admin';
}

// Sample data for email previews
const SAMPLE_DATA = {
  quote: {
    contact_name: 'Sarah Johnson',
    email: 'customer@example.com',
    phone: '(843) 555-1234',
    event_name: 'Johnson Family Reunion',
    event_date: '2025-02-15',
    start_time: '14:00',
    location: 'Magnolia Gardens, Charleston SC',
    guest_count: 75,
    service_type: 'full-service',
    proteins: ['Smoked Brisket', 'Pulled Pork'],
    sides: ['Mac & Cheese', 'Collard Greens', 'Cornbread'],
    special_requests: 'Please include extra sauce on the side'
  },
  invoice: {
    invoice_number: 'INV-2025-0042',
    total_amount: 287500,
    subtotal: 263761,
    tax_amount: 23739,
    due_date: '2025-02-01'
  },
  accessToken: 'preview-token-12345',
  paymentAmount: 143750,
  milestoneType: 'deposit',
  changeRequest: {
    type: 'menu_change',
    details: 'Customer requested to add vegetarian option'
  },
  adminResponse: 'We can add grilled vegetable skewers at $8 per person.'
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TestEmailRequest = await req.json();
    const { fromEmail, toEmail, emailType, variant } = body;

    if (!toEmail) {
      throw new Error('Missing required field: toEmail');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let testEmailHtml: string;
    let subject: string;

    // Check if this is a template preview test or legacy SMTP test
    if (emailType && EMAIL_CONFIGS[emailType]) {
      // New mode: Generate email from template system
      const config = EMAIL_CONFIGS[emailType];
      const selectedConfig = variant === 'admin' && config.admin ? config.admin : config.customer;
      
      testEmailHtml = generateStandardEmail({
        ...selectedConfig,
        quote: SAMPLE_DATA.quote,
        invoice: SAMPLE_DATA.invoice,
        accessToken: SAMPLE_DATA.accessToken,
        paymentAmount: SAMPLE_DATA.paymentAmount,
        milestoneType: SAMPLE_DATA.milestoneType,
        changeRequest: SAMPLE_DATA.changeRequest,
        adminResponse: SAMPLE_DATA.adminResponse
      });
      
      subject = `[TEST] ${selectedConfig.heroSection.title} - Soul Train's Eatery`;
      console.log(`Sending test email for template: ${emailType} (${variant || 'customer'})`);
    } else {
      // Legacy mode: Simple SMTP test email
      subject = `Test Email - Soul Train's Eatery Gmail Integration`;
      testEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email - Soul Train's Eatery</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 5px 0 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .success-badge { background: #4CAF50; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .footer { background: #f0f8ff; padding: 20px; text-align: center; border-top: 3px solid #8B4513; }
    .contact-info { margin: 10px 0; }
    .contact-info strong { color: #8B4513; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Soul Train's Eatery</h1>
      <p>Authentic Southern Catering • Charleston's Lowcountry</p>
    </div>

    <div class="content">
      <div class="success-badge">
        <h2 style="margin: 0;">✅ Gmail Integration Test Successful!</h2>
      </div>
      
      <h2 style="color: #8B4513;">Email System Status: Working</h2>
      
      <p>This is a test email to confirm that the Gmail integration for Soul Train's Eatery is working correctly.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #8B4513; margin-top: 0;">Test Details</h4>
        <p><strong>From:</strong> ${fromEmail || 'soultrainseatery@gmail.com'}</p>
        <p><strong>To:</strong> ${toEmail}</p>
        <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Service:</strong> Gmail API Integration</p>
      </div>
      
      <p>If you're seeing this email, it means:</p>
      <ul>
        <li>Gmail OAuth tokens are valid and working</li>
        <li>Email delivery system is operational</li>
        <li>Customer estimates and invoices can be sent successfully</li>
      </ul>
      
      <p style="color: #666; font-style: italic;">This email was sent as part of the Gmail integration testing process.</p>
    </div>

    <div class="footer">
      <div class="contact-info">
        <strong>Phone:</strong> (843) 970-0265
      </div>
      <div class="contact-info">
        <strong>Email:</strong> soultrainseatery@gmail.com
      </div>
      <p style="margin-top: 15px; color: #666; font-size: 14px;">
        Proudly serving Charleston's Lowcountry and surrounding areas
      </p>
    </div>
  </div>
</body>
</html>
      `;
    }

    console.log(`Attempting to send test email to ${toEmail}`);

    // Send test email via SMTP
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: toEmail,
        subject: subject,
        html: testEmailHtml,
        from: fromEmail || 'soultrainseatery@gmail.com'
      }
    });

    if (emailError) {
      console.error('Test email failed:', emailError);
      throw emailError;
    }

    console.log('Test email sent successfully:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: emailType ? `Test email for "${emailType}" sent successfully` : 'Test email sent successfully via Gmail',
      messageId: emailResult?.messageId,
      emailType: emailType || 'smtp_test',
      variant: variant || 'default',
      to: toEmail
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-test-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);