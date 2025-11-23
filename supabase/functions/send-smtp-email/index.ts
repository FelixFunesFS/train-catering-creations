import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from } = await req.json() as EmailRequest;

    console.log('Sending email via SMTP:', { to, subject, from });

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('SMTP configuration missing');
    }

    console.log('SMTP Config:', { host: smtpHost, port: smtpPort, user: smtpUser });

    // Create SMTP client with SSL for port 465
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Send email with proper encoding to prevent =20 artifacts
    await client.send({
      from: from || `Soul Train's Eatery <${smtpUser}>`,
      to: to,
      subject: subject,
      html: html,
      headers: {
        'Content-Transfer-Encoding': '8bit',
        'Content-Type': 'text/html; charset=UTF-8'
      },
    });

    await client.close();

    console.log('Email sent successfully via SMTP');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully via SMTP'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending email via SMTP:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
