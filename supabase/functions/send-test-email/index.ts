import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  from: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, from }: EmailRequest = await req.json();

    if (!to || !from) {
      throw new Error('Missing required fields: to, from');
    }

    console.log(`Attempting to send test email from ${from} to ${to}`);

    // Use the new Gmail API email function
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured');
    }

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-gmail-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        to,
        from,
        subject: 'Test Email from Soul Train\'s Eatery',
        html: `
          <h1>Test Email Successful!</h1>
          <p>This is a test email from Soul Train's Eatery catering service.</p>
          <p>If you received this email, the Gmail OAuth system is working correctly.</p>
          <p>From: ${from}</p>
          <p>To: ${to}</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <hr>
          <p><strong>Soul Train's Eatery</strong><br>
          Charleston's Trusted Catering Partner<br>
          Phone: (843) 970-0265<br>
          Email: soultrainseatery@gmail.com</p>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Gmail API call failed:', errorData);
      throw new Error(`Gmail API failed: ${emailResponse.status} - ${errorData}`);
    }

    const result = await emailResponse.json();
    console.log('Test email sent successfully via Gmail API');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test email sent successfully via Gmail API',
      from,
      to,
      messageId: result.messageId
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