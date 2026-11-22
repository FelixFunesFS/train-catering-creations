export interface CustomerChangeRequestBody {
  invoice_id: string;
  access_token: string;
  request_type: 'modification' | 'cancellation' | 'date_change' | 'guest_count_change';
  requested_changes: Record<string, unknown>;
  customer_comments?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/** Whitelist customer-editable fields; never accept identity or review/status fields. */
export function validateCustomerChangeRequest(value: unknown): CustomerChangeRequestBody | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const b = value as Record<string, unknown>;
  const allowed = ['invoice_id', 'access_token', 'request_type', 'requested_changes', 'customer_comments', 'priority'];
  if (Object.keys(b).some((k) => !allowed.includes(k))) return null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof b.invoice_id !== 'string' || !uuid.test(b.invoice_id) || typeof b.access_token !== 'string' || !uuid.test(b.access_token)) return null;
  if (!['modification', 'cancellation', 'date_change', 'guest_count_change'].includes(b.request_type as string)) return null;
  if (b.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(b.priority as string)) return null;
  if (b.customer_comments !== undefined && (typeof b.customer_comments !== 'string' || b.customer_comments.length > 5000)) return null;
  if (!b.requested_changes || typeof b.requested_changes !== 'object' || Array.isArray(b.requested_changes)) return null;
  try { if (new TextEncoder().encode(JSON.stringify(b.requested_changes)).length > 20000) return null; }
  catch { return null; }
  return b as unknown as CustomerChangeRequestBody;
}