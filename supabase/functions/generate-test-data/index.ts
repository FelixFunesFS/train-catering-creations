import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {}

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPrefix: supabaseUrl?.substring(0, 20) + '...',
      keyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Starting test data generation...');

    // Comprehensive test data for Sarah's Birthday Celebration
    const testQuoteData = {
      contact_name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com', 
      phone: '555-123-4567',
      event_name: "Sarah's Birthday Celebration",
      event_type: 'birthday',
      event_date: '2025-12-15',
      start_time: '18:00:00',
      guest_count: 45,
      location: '123 Celebration Ave, Charleston, SC 29401',
      service_type: 'full-service',
      serving_start_time: '19:00:00',
      wait_staff_requested: true,
      primary_protein: 'grilled-salmon',
      secondary_protein: 'herb-roasted-chicken', 
      both_proteins_available: true,
      appetizers: JSON.stringify(['shrimp-cocktail', 'cheese-board', 'bruschetta']),
      sides: JSON.stringify(['garlic-mashed-potatoes', 'roasted-vegetables', 'wild-rice-pilaf']),
      desserts: JSON.stringify(['chocolate-cake', 'fruit-tart']),
      drinks: JSON.stringify(['wine', 'sparkling-water', 'coffee']),
      dietary_restrictions: JSON.stringify(['gluten-free', 'vegetarian']),
      chafers_requested: true,
      tables_chairs_requested: true,
      linens_requested: true,
      wait_staff_requirements: 'Need 2 servers for dinner service and cleanup assistance',
      separate_serving_area: true,
      bussing_tables_needed: true,
      serving_utensils_requested: true,
      cups_requested: true,
      plates_requested: true,
      napkins_requested: true,
      ice_requested: true,
      custom_menu_requests: 'Would like elegant plating for salmon course',
      special_requests: 'Birthday celebration for 45th birthday, prefer elegant presentation',
      referral_source: 'google_search',
      theme_colors: 'Burgundy and Gold',
      status: 'pending',
      workflow_status: 'pending'
    };

    // Insert the comprehensive test quote request
    console.log('Attempting to insert quote request data...');
    const { data: quoteData, error: quoteError } = await supabase
      .from('quote_requests')
      .insert(testQuoteData as any)
      .select()
      .single();

    if (quoteError) {
      console.error('Detailed quote error:', {
        message: quoteError.message,
        details: quoteError.details,
        hint: quoteError.hint,
        code: quoteError.code
      });
      throw quoteError;
    }

    console.log('Successfully created quote request:', quoteData.id);

    // Insert comprehensive quote line items
    const lineItems = [
      {
        quote_request_id: quoteData.id,
        title: 'Grilled Salmon with Lemon Herb Butter',
        description: 'Fresh Atlantic salmon grilled to perfection with house-made lemon herb butter',
        category: 'protein',
        quantity: 25,
        unit_price: 2800, // $28.00
        total_price: 70000 // $700.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Herb-Roasted Chicken Breast',
        description: 'Free-range chicken breast with rosemary and thyme seasoning',
        category: 'protein', 
        quantity: 20,
        unit_price: 2200, // $22.00
        total_price: 44000 // $440.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Vegetarian Pasta Primavera',
        description: 'Seasonal vegetables with penne pasta in cream sauce',
        category: 'protein',
        quantity: 5,
        unit_price: 1800, // $18.00
        total_price: 9000 // $90.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Shrimp Cocktail Appetizer',
        description: 'Fresh jumbo shrimp with cocktail sauce',
        category: 'appetizer',
        quantity: 45,
        unit_price: 450, // $4.50
        total_price: 20250 // $202.50
      },
      {
        quote_request_id: quoteData.id,
        title: 'Artisan Cheese Board',
        description: 'Selection of local cheeses with crackers and fruit',
        category: 'appetizer',
        quantity: 3,
        unit_price: 2500, // $25.00
        total_price: 7500 // $75.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Garlic Mashed Potatoes',
        description: 'Creamy mashed potatoes with roasted garlic',
        category: 'side',
        quantity: 45,
        unit_price: 350, // $3.50
        total_price: 15750 // $157.50
      },
      {
        quote_request_id: quoteData.id,
        title: 'Roasted Seasonal Vegetables',
        description: 'Chef selection of seasonal vegetables',
        category: 'side',
        quantity: 45,
        unit_price: 400, // $4.00
        total_price: 18000 // $180.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Wild Rice Pilaf',
        description: 'Long grain wild rice with herbs',
        category: 'side',
        quantity: 45,
        unit_price: 300, // $3.00
        total_price: 13500 // $135.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Chocolate Birthday Cake',
        description: 'Three-layer chocolate cake with buttercream frosting',
        category: 'dessert',
        quantity: 1,
        unit_price: 8500, // $85.00
        total_price: 8500 // $85.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Individual Fruit Tarts',
        description: 'Mini fruit tarts with pastry cream',
        category: 'dessert',
        quantity: 45,
        unit_price: 450, // $4.50
        total_price: 20250 // $202.50
      },
      {
        quote_request_id: quoteData.id,
        title: 'Professional Wait Staff',
        description: '2 professional servers for dinner service and cleanup',
        category: 'service',
        quantity: 2,
        unit_price: 15000, // $150.00
        total_price: 30000 // $300.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Table and Chair Rental',
        description: 'Round tables and chiavari chairs for 45 guests',
        category: 'equipment',
        quantity: 1,
        unit_price: 12000, // $120.00
        total_price: 12000 // $120.00
      },
      {
        quote_request_id: quoteData.id,
        title: 'Elegant Table Linens',
        description: 'Burgundy and gold table linens and napkins',
        category: 'equipment',
        quantity: 1,
        unit_price: 8000, // $80.00
        total_price: 8000 // $80.00
      }
    ];

    // Insert all line items
    const { data: lineItemsData, error: lineItemsError } = await supabase
      .from('quote_line_items')
      .insert(lineItems)
      .select();

    if (lineItemsError) {
      console.error('Error inserting line items:', lineItemsError);
      throw lineItemsError;
    }

    console.log('Successfully created line items:', lineItemsData.length);

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = Math.round(subtotal * 0.0875); // 8.75% SC tax
    const totalAmount = subtotal + taxAmount;

    // Update quote request with calculated totals
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        estimated_total: totalAmount,
        final_total: totalAmount
      })
      .eq('id', quoteData.id);

    if (updateError) {
      console.error('Error updating quote totals:', updateError);
      throw updateError;
    }

    const result = {
      success: true,
      message: 'Test data generated successfully',
      data: {
        quoteId: quoteData.id,
        customerEmail: testQuoteData.email,
        eventName: testQuoteData.event_name,
        guestCount: testQuoteData.guest_count,
        eventDate: testQuoteData.event_date,
        subtotal: subtotal / 100, // Convert to dollars for display
        tax: taxAmount / 100,
        total: totalAmount / 100,
        lineItemsCount: lineItemsData.length
      }
    };

    console.log('Test data generation completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in generate-test-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      details: error 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}