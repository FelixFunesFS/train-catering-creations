import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🔍 Test email function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, from } = await req.json();
    console.log(`📧 Sending test email from ${from} to ${to}`);

    // Create SMTP connection to Gmail
    const gmail_user = Deno.env.get('GMAIL_USER');
    const gmail_password = Deno.env.get('GMAIL_APP_PASSWORD');
    
    console.log('🔐 Gmail credentials check:', {
      user: gmail_user ? 'SET' : 'NOT SET',
      password: gmail_password ? 'SET' : 'NOT SET'
    });

    if (!gmail_user || !gmail_password) {
      throw new Error('Gmail credentials not configured');
    }

    // Simple test email content
    const subject = 'Test Email from Soul Train\'s Eatery';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Test Email Confirmation</h2>
        <p>Hello!</p>
        <p>This is a test email from Soul Train's Eatery to verify our email delivery system is working correctly.</p>
        <p>If you receive this email, our system is functioning properly!</p>
        <p>Best regards,<br>
        <strong>Soul Train's Eatery Team</strong></p>
        <p style="color: #666; font-size: 12px;">
          Phone: (843) 970-0265<br>
          Email: soultrainseatery@gmail.com
        </p>
      </div>
    `;

    // Use the existing sendEmailViaSMTP function logic
    const success = await sendEmailViaSMTP(to, subject, html);

    if (success) {
      console.log('✅ Test email sent successfully');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      throw new Error('Failed to send test email');
    }

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function sendEmailViaSMTP(to: string, subject: string, html: string): Promise<boolean> {
  const gmail_user = Deno.env.get('GMAIL_USER');
  const gmail_password = Deno.env.get('GMAIL_APP_PASSWORD');

  try {
    console.log('🔄 Connecting to Gmail SMTP...');
    
    const conn = await Deno.connect({
      hostname: "smtp.gmail.com",
      port: 587,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return '';
      const response = decoder.decode(buffer.slice(0, n));
      console.log('📨 SMTP Response:', response.trim());
      return response;
    };

    // Helper function to send command
    const sendCommand = async (command: string) => {
      console.log('📤 SMTP Command:', command.trim());
      await conn.write(encoder.encode(command));
    };

    // SMTP conversation
    await readResponse(); // Initial greeting
    await sendCommand("EHLO localhost\r\n");
    await readResponse();
    
    await sendCommand("STARTTLS\r\n");
    await readResponse();
    
    // Start TLS
    const tlsConn = await Deno.startTls(conn, { hostname: "smtp.gmail.com" });
    
    // Continue with TLS connection
    const tlsReadResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      if (n === null) return '';
      const response = decoder.decode(buffer.slice(0, n));
      console.log('📨 TLS Response:', response.trim());
      return response;
    };

    const tlsSendCommand = async (command: string) => {
      console.log('📤 TLS Command:', command.trim());
      await tlsConn.write(encoder.encode(command));
    };

    await tlsSendCommand("EHLO localhost\r\n");
    await tlsReadResponse();
    
    await tlsSendCommand("AUTH LOGIN\r\n");
    await tlsReadResponse();
    
    // Send base64 encoded username
    const userB64 = btoa(gmail_user!);
    await tlsSendCommand(userB64 + "\r\n");
    await tlsReadResponse();
    
    // Send base64 encoded password
    const passB64 = btoa(gmail_password!);
    await tlsSendCommand(passB64 + "\r\n");
    const authResponse = await tlsReadResponse();
    
    if (!authResponse.includes("235")) {
      throw new Error(`Authentication failed: ${authResponse}`);
    }

    await tlsSendCommand(`MAIL FROM:<${gmail_user}>\r\n`);
    await tlsReadResponse();
    
    await tlsSendCommand(`RCPT TO:<${to}>\r\n`);
    await tlsReadResponse();
    
    await tlsSendCommand("DATA\r\n");
    await tlsReadResponse();
    
    const emailData = `From: Soul Train's Eatery <${gmail_user}>
To: ${to}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${html}
\r\n.\r\n`;

    await tlsSendCommand(emailData);
    await tlsReadResponse();
    
    await tlsSendCommand("QUIT\r\n");
    await tlsReadResponse();
    
    tlsConn.close();
    
    console.log('✅ Test email sent successfully via SMTP');
    return true;

  } catch (error: any) {
    console.error('❌ SMTP Error:', error);
    return false;
  }
}

serve(handler);