import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  fromEmail: string;
  toEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fromEmail, toEmail }: TestEmailRequest = await req.json();

    if (!fromEmail || !toEmail) {
      throw new Error('Missing required fields: fromEmail and toEmail');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Attempting to send test email from ${fromEmail} to ${toEmail}`);

    // Generate test email HTML
    const testEmailHtml = `
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
        <p><strong>From:</strong> ${fromEmail}</p>
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

    // Send test email via Gmail
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: toEmail,
        subject: `Test Email - Soul Train's Eatery Gmail Integration`,
        html: testEmailHtml,
        from: fromEmail
      }
    });

    if (emailError) {
      console.error('Test email failed:', emailError);
      throw emailError;
    }

    console.log('Test email sent successfully:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test email sent successfully via Gmail',
      messageId: emailResult?.messageId,
      from: fromEmail,
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