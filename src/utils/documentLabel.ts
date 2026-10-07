/**
 * Document lifecycle label derived from invoice workflow_status.
 * Keep in sync with getDocumentLabel in supabase/functions/generate-invoice-pdf/index.ts.
 *  - Pre-approval (draft/sent/viewed/etc): QUOTE
 *  - Approved / payment due / partial / overdue: INVOICE
 *  - Paid in full: RECEIPT
 */
export type DocumentKind = 'quote' | 'invoice' | 'receipt';

const INVOICE_STATUSES = ['approved', 'payment_pending', 'partially_paid', 'overdue'];

export function getDocumentKind(status?: string | null): DocumentKind {
  if (status === 'paid') return 'receipt';
  if (status && INVOICE_STATUSES.includes(status)) return 'invoice';
  return 'quote';
}

export function getDocumentLabel(status?: string | null) {
  const kind = getDocumentKind(status);
  switch (kind) {
    case 'receipt':
      return { kind, title: 'Invoice & Receipt (Paid in Full)', short: 'Receipt', file: 'Receipt' };
    case 'invoice':
      return { kind, title: 'Catering Invoice', short: 'Invoice', file: 'Invoice' };
    default:
      return { kind, title: 'Catering Quote', short: 'Quote', file: 'Quote' };
  }
}
