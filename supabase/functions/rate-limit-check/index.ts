import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get IP address from request headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Rate limit check for IP:', clientIP);

    // Check rate limits in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentRequests, error } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', 'quote_form_submitted')
      .eq('ip_address', clientIP)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error checking rate limit:', error);
      throw error;
    }

    const requestCount = recentRequests?.length || 0;
    const maxRequests = 3;
    
    console.log(`IP ${clientIP} has made ${requestCount}/${maxRequests} requests in the last hour`);

    if (requestCount >= maxRequests) {
      const resetTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      console.log(`Rate limit exceeded for IP ${clientIP}. Reset at: ${resetTime}`);
      
      return new Response(
        JSON.stringify({
          allowed: false,
          requestCount,
          maxRequests,
          resetTime,
          message: 'Too many quote requests. Please try again in an hour.'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the successful check
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'rate_limit_check',
        ip_address: clientIP,
        metadata: {
          requestCount,
          maxRequests,
          allowed: true
        }
      });

    return new Response(
      JSON.stringify({
        allowed: true,
        requestCount,
        maxRequests,
        remaining: maxRequests - requestCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit check error:', error);
    
    // On error, allow the request (fail open) but log it
    return new Response(
      JSON.stringify({ 
        allowed: true,
        error: 'Rate limit check failed, allowing request',
        message: error.message 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
