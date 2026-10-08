/**
 * Pre-approval (proposal) status. A sent/viewed estimate is an offer, not a
 * receivable: never show "deposit due" or "overdue" for it.
 * After the 7-day validity window it is only "expired" when the admin has
 * logged no customer contact since it was sent.
 */
export const PRE_APPROVAL_INVOICE_STATUSES = ['draft', 'pending_review', 'sent', 'viewed'] as const;
export const QUOTE_VALIDITY_DAYS = 7;

export type ProposalState = 'awaiting' | 'viewed' | 'in_discussion' | 'needs_follow_up';

export interface ProposalStatus {
  state: ProposalState;
  label: string;
  detail: string;
  daysSinceSent: number | null;
}

export function isPreApproval(invoiceStatus?: string | null): boolean {
  return !!invoiceStatus && (PRE_APPROVAL_INVOICE_STATUSES as readonly string[]).includes(invoiceStatus);
}

export function getProposalStatus(
  inv: { workflow_status: string; sent_at?: string | null; viewed_at?: string | null; last_customer_interaction?: string | null },
  now: Date = new Date(),
): ProposalStatus | null {
  if (!isPreApproval(inv.workflow_status)) return null;
  const sent = inv.sent_at ? new Date(inv.sent_at) : null;
  const days = sent ? Math.floor((now.getTime() - sent.getTime()) / 86400000) : null;
  const contact = inv.last_customer_interaction ? new Date(inv.last_customer_interaction) : null;
  const contactAfterSend = !!contact && (!sent || contact >= sent);

  if (days !== null && days > QUOTE_VALIDITY_DAYS) {
    if (contactAfterSend) {
      return { state: 'in_discussion', label: 'Follow-Up Logged', detail: 'In discussion with customer — approve or log payment when they commit', daysSinceSent: days };
    }
    return { state: 'needs_follow_up', label: 'No Response 7+ Days', detail: 'Log a call/note if you spoke with them, otherwise cancel the quote', daysSinceSent: days };
  }
  if (inv.viewed_at) return { state: 'viewed', label: 'Viewed by Customer', detail: 'Awaiting customer approval', daysSinceSent: days };
  return { state: 'awaiting', label: sent ? 'Estimate Sent' : 'Estimate Draft', detail: sent ? 'Awaiting customer approval (valid 7 days)' : 'Not sent yet', daysSinceSent: days };
}
