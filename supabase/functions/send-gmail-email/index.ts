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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from = 'soultrainseatery@gmail.com' }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

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
      .eq('email', from)
      .single();

    if (tokenError || !tokenData) {
      throw new Error(`No Gmail tokens found for ${from}. Please authorize Gmail access first.`);
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh if needed
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    if (now >= expiresAt) {
      console.log('Token expired, refreshing...');
      
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
        throw new Error('Failed to refresh access token');
      }

      const refreshTokens = await refreshResponse.json();
      accessToken = refreshTokens.access_token;

      // Update stored tokens
      const newExpiresAt = new Date(Date.now() + (refreshTokens.expires_in * 1000)).toISOString();
      
      const { error: updateError } = await supabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
        })
        .eq('id', tokenData.id);

      if (updateError) {
        console.error('Failed to update tokens:', updateError);
      }

      console.log('Token refreshed successfully');
    }

    // Create MIME message
    const message = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\r\n');

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