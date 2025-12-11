import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId) {
      throw new Error('GMAIL_CLIENT_ID not configured');
    }

    // Clear existing tokens to force fresh authorization with all scopes
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: deleteError } = await supabase
        .from('gmail_tokens')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all tokens
      
      if (deleteError) {
        console.warn('Could not clear old tokens:', deleteError.message);
      } else {
        console.log('Cleared old Gmail tokens for fresh authorization');
      }
    }

    const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
    const redirectUri = `https://${projectId}.functions.supabase.co/gmail-oauth-callback`;
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    // Request gmail.send scope for sending emails
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent'); // Force consent to guarantee all scopes
    authUrl.searchParams.set('login_hint', 'soultrainseatery@gmail.com');

    console.log('Redirecting to OAuth URL:', authUrl.toString());

    // Redirect directly to Google OAuth
    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl.toString(),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in gmail-oauth-init:', error);
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