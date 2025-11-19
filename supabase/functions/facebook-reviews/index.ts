import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookRating {
  reviewer: {
    name: string;
    id: string;
  };
  rating: number;
  review_text?: string;
  created_time: string;
  id: string;
}

interface FacebookResponse {
  data: FacebookRating[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pageId = Deno.env.get('FACEBOOK_PAGE_ID');
    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');

    if (!pageId || !accessToken) {
      console.error('Missing Facebook credentials');
      throw new Error('Facebook credentials not configured');
    }

    console.log('Fetching Facebook reviews for page:', pageId);

    // Fetch reviews from Facebook Graph API
    const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/ratings?fields=reviewer{name},rating,review_text,created_time&limit=10&access_token=${accessToken}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error:', response.status, errorText);
      throw new Error(`Facebook API returned ${response.status}`);
    }

    const fbData: FacebookResponse = await response.json();
    console.log('Facebook API response:', JSON.stringify(fbData, null, 2));

    // Transform Facebook reviews to our format
    const reviews = (fbData.data || []).map(rating => ({
      id: rating.id,
      name: rating.reviewer?.name || 'Facebook User',
      rating: rating.rating,
      quote: rating.review_text || 'Great service!',
      createdTime: rating.created_time,
      source: 'facebook' as const
    }));

    console.log(`Successfully fetched ${reviews.length} Facebook reviews`);

    return new Response(
      JSON.stringify({ reviews }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching Facebook reviews:', error);
    
    return new Response(
      JSON.stringify({ 
        reviews: [],
        error: error.message 
      }),
      { 
        status: 200, // Return 200 with empty array to gracefully handle errors
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
