import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ReminderResult {
  type: string;
  count: number;
  emails_sent: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automated reminder check...');
    const results: ReminderResult[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check for unpaid invoices with events coming up in 7 days
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: upcomingUnpaidEvents } = await supabase
      .from('quote_requests')
      .select('id, email, contact_name, event_name, event_date')
      .eq('status', 'confirmed')
      .gte('event_date', sevenDaysFromNow.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    let urgentPaymentReminders = 0;
    if (upcomingUnpaidEvents) {
      for (const event of upcomingUnpaidEvents) {
        // Get invoice for this quote
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, status, total_amount')
          .eq('quote_request_id', event.id);
        
        const invoice = invoices?.[0];
        
        if (invoice && invoice.status !== 'paid') {
          // Check if we already sent a reminder today
          const { data: recentReminder } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('invoice_id', invoice.id)
            .eq('reminder_type', 'payment_urgent')
            .gte('sent_at', today.toISOString())
            .maybeSingle();

          if (!recentReminder) {
            // Log the reminder (email sending is optional - requires send-reminder-email function)
            await supabase.from('reminder_logs').insert({
              invoice_id: invoice.id,
              reminder_type: 'payment_urgent',
              recipient_email: event.email,
              urgency: 'high'
            });

            console.log(`Logged urgent payment reminder for ${event.email}`);
            urgentPaymentReminders++;
          }
        }
      }
    }

    results.push({
      type: 'urgent_payment',
      count: upcomingUnpaidEvents?.length || 0,
      emails_sent: urgentPaymentReminders
    });

    // 2. Check for events 2 weeks out - final confirmation reminder
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const { data: upcomingConfirmedEvents } = await supabase
      .from('quote_requests')
      .select('id, email, contact_name, event_name, event_date')
      .eq('status', 'confirmed')
      .gte('event_date', twoWeeksFromNow.toISOString().split('T')[0])
      .lte('event_date', twoWeeksFromNow.toISOString().split('T')[0]);

    let finalConfirmationReminders = 0;
    if (upcomingConfirmedEvents) {
      for (const event of upcomingConfirmedEvents) {
        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', event.id)
          .eq('reminder_type', 'final_confirmation')
          .gte('sent_at', today.toISOString())
          .maybeSingle();

        if (!recentReminder) {
          await supabase.from('reminder_logs').insert({
            invoice_id: event.id,
            reminder_type: 'final_confirmation',
            recipient_email: event.email,
            urgency: 'medium'
          });

          console.log(`Logged final confirmation for ${event.email}`);
          finalConfirmationReminders++;
        }
      }
    }

    results.push({
      type: 'final_confirmation',
      count: upcomingConfirmedEvents?.length || 0,
      emails_sent: finalConfirmationReminders
    });

    // 3. Check for overdue invoices
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('id, total_amount, due_date, quote_request_id')
      .in('status', ['sent', 'viewed', 'approved'])
      .lt('due_date', today.toISOString().split('T')[0]);

    let overdueReminders = 0;
    if (overdueInvoices) {
      for (const invoice of overdueInvoices) {
        const { data: quote } = await supabase
          .from('quote_requests')
          .select('email, contact_name, event_name')
          .eq('id', invoice.quote_request_id)
          .maybeSingle();

        if (quote) {
          const { data: recentReminder } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('invoice_id', invoice.id)
            .eq('reminder_type', 'overdue_payment')
            .gte('sent_at', today.toISOString())
            .maybeSingle();

          if (!recentReminder) {
            await supabase.from('reminder_logs').insert({
              invoice_id: invoice.id,
              reminder_type: 'overdue_payment',
              recipient_email: quote.email,
              urgency: 'high'
            });

            console.log(`Logged overdue reminder for ${quote.email}`);
            overdueReminders++;
          }
        }
      }
    }

    results.push({
      type: 'overdue_payment',
      count: overdueInvoices?.length || 0,
      emails_sent: overdueReminders
    });

    console.log('Reminder check completed:', results);

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        total_logged: results.reduce((sum, r) => sum + r.emails_sent, 0)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in automated reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
