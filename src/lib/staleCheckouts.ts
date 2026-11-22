import { supabase } from '@/integrations/supabase/client';

/** Fire-and-forget: close any open Stripe payment pages for this invoice after a price change. */
export function expireStaleCheckouts(invoiceId: string | null | undefined): void {
  if (!invoiceId) return;
  supabase.functions
    .invoke('expire-stale-checkout-sessions', { body: { invoice_id: invoiceId } })
    .catch((err) => console.warn('Could not close open payment pages', err));
}
