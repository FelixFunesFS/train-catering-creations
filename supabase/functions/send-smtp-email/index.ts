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
  replyTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from = 'soultrainseatery@gmail.com', replyTo }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('SMTP configuration missing:', { 
        hasHost: !!smtpHost, 
        hasPort: !!smtpPort, 
        hasUser: !!smtpUser, 
        hasPass: !!smtpPass 
      });
      throw new Error('SMTP not configured. Missing required environment variables.');
    }

    console.log(`Sending email via SMTP to: ${to}, subject: ${subject.substring(0, 50)}...`);

    // Extract display name and email from "Name <email>" format
    const extractEmailParts = (emailString: string): { name?: string; email: string } => {
      const match = emailString.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
      }
      return { email: emailString.trim() };
    };

    const fromParts = extractEmailParts(from);

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort, 10),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Build email message
    const emailMessage: any = {
      from: fromParts.name ? `${fromParts.name} <${fromParts.email}>` : fromParts.email,
      to: to,
      subject: subject,
      content: "Please view this email in an HTML-capable email client.",
      html: html,
    };

    // Add reply-to if specified
    if (replyTo) {
      emailMessage.replyTo = replyTo;
    }

    // Send email
    await client.send(emailMessage);
    
    // Close connection
    await client.close();

    console.log(`Email sent successfully via SMTP to: ${to}`);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: `smtp-${Date.now()}`,
      to,
      subject 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-smtp-email:', error);
    
    // Return sanitized error for security
    const safeMessage = error.message?.includes('SMTP') || error.message?.includes('Missing') 
      ? error.message 
      : 'Failed to send email via SMTP';
    
    return new Response(
      JSON.stringify({ 
        error: safeMessage,
        code: 'SMTP_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
