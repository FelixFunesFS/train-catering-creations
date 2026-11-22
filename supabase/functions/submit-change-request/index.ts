import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { validateCustomerChangeRequest } from '../_shared/customerChangeRequest.ts';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try {
    const text = await req.text();
    if (text.length > 32000) return json({ error: 'Request too large' }, 413);
    body = validateCustomerChangeRequest(JSON.parse(text));
  } catch { return json({ error: 'Invalid request' }, 400); }
  if (!body) return json({ error: 'Invalid request' }, 400);
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Submission is unavailable. Please try again later.' }, 503);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: id, error } = await db.rpc('submit_customer_change_request', {
    p_invoice_id: body.invoice_id,
    p_access_token: body.access_token,
    p_request_type: body.request_type,
    p_requested_changes: body.requested_changes,
    p_customer_comments: body.customer_comments ?? null,
    p_priority: body.priority ?? 'medium',
  });
  if (error) {
    if (error.code === '42501') return json({ error: 'Invalid or expired estimate link' }, 403);
    if (error.code === '22023') return json({ error: 'Invalid request details' }, 400);
    console.error('[submit-change-request] submission failed', error.code);
    return json({ error: 'Unable to submit your request. Please try again.' }, 500);
  }
  // Preserve admin notifications, but delivery failure does not undo a saved request.
  const { data: saved } = await db.from('change_requests').select('customer_email').eq('id', id).single();
  const { error: notificationError } = await db.functions.invoke('send-admin-notification', {
    body: { invoiceId: body.invoice_id, notificationType: 'change_request', metadata: {
      requestType: body.request_type, customerComments: body.customer_comments, customerEmail: saved?.customer_email,
    } },
  });
  if (notificationError) console.error('[submit-change-request] notification unavailable');
  return json({ id });
});