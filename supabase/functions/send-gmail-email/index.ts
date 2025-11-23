import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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

    // Extract email address from display name format: "Name <email@domain.com>" → "email@domain.com"
    const extractEmail = (emailString: string): string => {
      const match = emailString.match(/<(.+?)>/);
      return match ? match[1] : emailString;
    };

    const fromEmail = extractEmail(from);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    if (!supabaseUrl || !serviceRoleKey || !clientId || !clientSecret) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get stored tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('email', fromEmail)
      .single();

    if (tokenError || !tokenData) {
      console.error('Gmail token lookup failed:', { fromEmail, tokenError, tokenData });
      throw new Error(`No Gmail tokens found for ${fromEmail}. Please authorize Gmail access first. Visit /admin to set up Gmail integration.`);
    }

    console.log('Found Gmail tokens for:', from);

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh if needed
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    if (now >= expiresAt) {
      console.log('Token expired, refreshing...', {
        refresh_token_preview: tokenData.refresh_token.substring(0, 15) + '...',
        expires_at: tokenData.expires_at,
        now: now.toISOString()
      });
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.text();
        console.error('Token refresh failed:', errorData);
        
        // If refresh fails, the user needs to re-authenticate
        throw new Error(`Gmail authentication has expired and cannot be refreshed. Please re-authenticate by visiting the Test Email page at /test-email and clicking "Authorize Gmail Access". Error: ${errorData}`);
      }

      const refreshTokens = await refreshResponse.json();
      accessToken = refreshTokens.access_token;

      // Update stored tokens
      const newExpiresAt = new Date(Date.now() + (refreshTokens.expires_in * 1000)).toISOString();
      
      // Prepare update object - include new refresh token if Google provides one
      const updateData: any = {
        access_token: accessToken,
        expires_at: newExpiresAt,
      };

      // Google may return a new refresh token during refresh
      if (refreshTokens.refresh_token) {
        updateData.refresh_token = refreshTokens.refresh_token;
        console.log('Received new refresh token from Google, updating...');
      }

      const { error: updateError } = await supabase
        .from('gmail_tokens')
        .update(updateData)
        .eq('id', tokenData.id);

      if (updateError) {
        console.error('Failed to update tokens:', updateError);
      } else {
        console.log('Token refreshed successfully', {
          updated_refresh_token: !!refreshTokens.refresh_token
        });
      }
    }

    // Create MIME message
    const message = [
      `To: ${to}`,
      `From: ${from}`,
      replyTo ? `Reply-To: ${replyTo}` : '',
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].filter(Boolean).join('\r\n');

    // Base64url encode the message (handle UTF-8 properly)
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    // Convert to base64 using proper UTF-8 handling
    let base64String = '';
    try {
      // Use btoa for binary string conversion
      const binaryString = String.fromCharCode(...messageBytes);
      base64String = btoa(binaryString);
    } catch (error) {
      console.error('Base64 encoding error:', error);
      // Fallback: use manual base64 encoding
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      for (let i = 0; i < messageBytes.length; i += 3) {
        const a = messageBytes[i];
        const b = messageBytes[i + 1] || 0;
        const c = messageBytes[i + 2] || 0;
        const encoded = (a << 16) | (b << 8) | c;
        result += chars[(encoded >> 18) & 63] + chars[(encoded >> 12) & 63] + 
                 chars[(encoded >> 6) & 63] + chars[encoded & 63];
      }
      base64String = result;
    }
    
    const encodedMessage = base64String
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!gmailResponse.ok) {
      const errorData = await gmailResponse.text();
      console.error('Gmail API error:', errorData);
      throw new Error(`Gmail API failed: ${gmailResponse.status} - ${errorData}`);
    }

    const result = await gmailResponse.json();
    console.log('Email sent successfully:', result.id);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.id,
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
    console.error('Error in send-gmail-email:', error);
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