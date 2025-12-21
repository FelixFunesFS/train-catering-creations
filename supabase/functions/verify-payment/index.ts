import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { createErrorResponse } from '../_shared/security.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

interface VerifyPaymentRequest {
  session_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id }: VerifyPaymentRequest = await req.json();
    
    if (!session_id) {
      throw new Error('Session ID is required');
    }

    console.log('Verifying payment for session');

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session) {
      throw new Error('Session not found');
    }

    console.log('Session status:', session.payment_status);

    // Update payment transaction in database
    const { data: transaction, error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: session.payment_status === 'paid' ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('stripe_session_id', session_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating transaction');
      throw new Error('Failed to update payment record');
    }

    // If payment was successful, update invoice status
    if (session.payment_status === 'paid' && transaction) {
      const { error: invoiceUpdateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', transaction.invoice_id);

      if (invoiceUpdateError) {
        console.error('Error updating invoice status');
      } else {
        console.log('Invoice marked as paid');
      }

      // Add payment to history
      const { error: historyError } = await supabase
        .from('payment_history')
        .insert({
          invoice_id: transaction.invoice_id,
          amount: transaction.amount,
          status: 'completed',
          payment_method: 'stripe',
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (historyError) {
        console.error('Error adding payment history');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_status: session.payment_status,
        transaction_id: transaction.id,
        invoice_id: transaction.invoice_id,
        amount_total: session.amount_total,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return createErrorResponse(error, 'verify-payment', corsHeaders);
  }
};

serve(handler);
