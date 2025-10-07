import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body);
      logStep("Processing webhook without signature verification (development mode)");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Event type", { type: event.type });

    // Handle successful checkout session
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Checkout session completed", { 
        sessionId: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata 
      });

      if (session.payment_status === "paid") {
        const { invoice_id, milestone_id, quote_request_id } = session.metadata || {};

        // Update payment transaction
        const { error: txUpdateError } = await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string
          })
          .eq('stripe_session_id', session.id);

        if (txUpdateError) {
          logStep("Error updating transaction", { error: txUpdateError.message });
        } else {
          logStep("Transaction updated to completed");
        }

        // Update milestone if provided
        if (milestone_id) {
          const { error: milestoneError } = await supabaseClient
            .from('payment_milestones')
            .update({ status: 'paid' })
            .eq('id', milestone_id);

          if (milestoneError) {
            logStep("Error updating milestone", { error: milestoneError.message });
          } else {
            logStep("Milestone marked as paid");
          }
        }

        // Check if invoice is fully paid
        if (invoice_id) {
          const { data: invoice } = await supabaseClient
            .from('invoices')
            .select('total_amount')
            .eq('id', invoice_id)
            .single();

          const { data: transactions } = await supabaseClient
            .from('payment_transactions')
            .select('amount')
            .eq('invoice_id', invoice_id)
            .eq('status', 'completed');

          const totalPaid = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

          logStep("Payment check", { 
            invoiceTotal: invoice?.total_amount, 
            totalPaid,
            fullyPaid: totalPaid >= (invoice?.total_amount || 0)
          });

            if (invoice && totalPaid >= invoice.total_amount) {
            // Invoice is fully paid
            const { error: invoiceError } = await supabaseClient
              .from('invoices')
              .update({
                workflow_status: 'paid',
                paid_at: new Date().toISOString()
              })
              .eq('id', invoice_id);

            if (invoiceError) {
              logStep("Error updating invoice to paid", { error: invoiceError.message });
            } else {
              logStep("Invoice marked as paid");
            }

            // Update quote request to confirmed
            if (quote_request_id) {
              await supabaseClient
                .from('quote_requests')
                .update({ 
                  workflow_status: 'confirmed'
                })
                .eq('id', quote_request_id);
              
              logStep("Quote request marked as confirmed");
            }

            // Send admin notification for payment received
            try {
              await supabaseClient.functions.invoke('send-admin-notification', {
                body: {
                  invoiceId: invoice_id,
                  notificationType: 'payment_received',
                  metadata: {
                    amount: session.amount_total,
                    payment_type: 'full',
                    full_payment: true
                  }
                }
              });
              logStep("Admin notification sent");
            } catch (err) {
              logStep("Admin notification failed (non-critical)", { error: err });
            }

            // Send customer payment confirmation email
            try {
              await supabaseClient.functions.invoke('send-customer-portal-email', {
                body: {
                  quote_request_id: quote_request_id,
                  type: 'payment_confirmation',
                  metadata: {
                    amount: session.amount_total,
                    payment_type: 'full',
                    is_full_payment: true
                  }
                }
              });
              logStep("Customer payment confirmation sent");
            } catch (err) {
              logStep("Customer confirmation failed (non-critical)", { error: err });
            }
          } else {
            // Partial payment
            const { error: invoiceError } = await supabaseClient
              .from('invoices')
              .update({
                workflow_status: 'partially_paid'
              })
              .eq('id', invoice_id);

            if (invoiceError) {
              logStep("Error updating invoice", { error: invoiceError.message });
            }

            // Send customer deposit confirmation email
            try {
              await supabaseClient.functions.invoke('send-customer-portal-email', {
                body: {
                  quote_request_id: quote_request_id,
                  type: 'payment_confirmation',
                  metadata: {
                    amount: session.amount_total,
                    payment_type: 'deposit',
                    is_full_payment: false
                  }
                }
              });
              logStep("Customer deposit confirmation sent");
            } catch (err) {
              logStep("Customer deposit confirmation failed (non-critical)", { error: err });
            }
          }
        }

        // Log to payment history
        if (invoice_id) {
          await supabaseClient
            .from('payment_history')
            .insert({
              invoice_id: invoice_id,
              amount: session.amount_total || 0,
              status: 'completed',
              payment_method: 'stripe',
              stripe_payment_intent_id: session.payment_intent as string
            });
        }
      }
    }

    // Handle failed payments
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Payment failed", { sessionId: session.id });

      const { error: txUpdateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_reason: 'Payment failed'
        })
        .eq('stripe_session_id', session.id);

      if (txUpdateError) {
        logStep("Error updating failed transaction", { error: txUpdateError.message });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
