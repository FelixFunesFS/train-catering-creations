import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateQuoteConfirmationEmail, generateAdminQuoteNotification } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Quote notification request:', requestData);

    // Generate professional branded emails using centralized templates
    const adminEmailHtml = generateAdminQuoteNotification(requestData);
    const customerEmailHtml = generateQuoteConfirmationEmail(requestData);

    console.log('Sending admin email...');
    const { error: adminEmailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject: `New Quote Request: ${requestData.event_name}`,
        html: adminEmailHtml,
        from: 'soultrainseatery@gmail.com'
      }
    });

    if (adminEmailError) {
      console.error('Failed to send admin email:', adminEmailError);
      throw new Error(`Admin email failed: ${adminEmailError.message}`);
    }

    console.log('Sending customer confirmation email...');
    const { error: customerEmailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: requestData.email,
        subject: `Quote Request Received - ${requestData.event_name}`,
        html: customerEmailHtml,
        from: 'soultrainseatery@gmail.com'
      }
    });

    if (customerEmailError) {
      console.error('Failed to send customer email:', customerEmailError);
      throw new Error(`Customer email failed: ${customerEmailError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Quote notifications sent successfully via Gmail" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-quote-notification:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);