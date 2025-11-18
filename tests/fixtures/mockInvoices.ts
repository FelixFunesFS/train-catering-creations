import type { Database } from '@/integrations/supabase/types';

type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type LineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert'];
type MilestoneInsert = Database['public']['Tables']['payment_milestones']['Insert'];

/**
 * Create invoice data for a quote
 */
export function createInvoiceForQuote(
  quoteId: string,
  overrides?: Partial<InvoiceInsert>
): InvoiceInsert {
  return {
    quote_request_id: quoteId,
    document_type: 'estimate',
    workflow_status: 'draft',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    currency: 'USD',
    is_draft: true,
    ...overrides,
  };
}

/**
 * Create line items for common menu selections
 */
export function createStandardLineItems(invoiceId: string): LineItemInsert[] {
  return [
    {
      invoice_id: invoiceId,
      title: 'Main Meal Package',
      description: 'BBQ Chicken, Pulled Pork, Mac & Cheese, Collard Greens, Sweet Tea, Lemonade',
      category: 'meal',
      quantity: 50,
      unit_price: 0,
      total_price: 0,
    },
    {
      invoice_id: invoiceId,
      title: 'Delivery & Setup',
      description: 'Professional delivery and buffet setup at your venue',
      category: 'service',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    },
    {
      invoice_id: invoiceId,
      title: 'Disposable Supplies',
      description: 'Plates, Cups, Napkins, Utensils',
      category: 'supplies',
      quantity: 50,
      unit_price: 0,
      total_price: 0,
    },
  ];
}

/**
 * Create line items with pricing (for testing payment calculations)
 */
export function createPricedLineItems(invoiceId: string, guestCount: number = 50): LineItemInsert[] {
  const perPersonRate = 18; // $18 per person
  const deliveryFee = 150;
  const suppliesCost = 75;
  
  return [
    {
      invoice_id: invoiceId,
      title: 'Main Meal Package',
      description: 'BBQ Chicken, Pulled Pork, Mac & Cheese, Collard Greens, Sweet Tea, Lemonade',
      category: 'meal',
      quantity: guestCount,
      unit_price: perPersonRate,
      total_price: guestCount * perPersonRate,
    },
    {
      invoice_id: invoiceId,
      title: 'Delivery & Setup',
      description: 'Professional delivery and buffet setup at your venue',
      category: 'service',
      quantity: 1,
      unit_price: deliveryFee,
      total_price: deliveryFee,
    },
    {
      invoice_id: invoiceId,
      title: 'Disposable Supplies',
      description: 'Plates, Cups, Napkins, Utensils',
      category: 'supplies',
      quantity: guestCount,
      unit_price: suppliesCost / guestCount,
      total_price: suppliesCost,
    },
  ];
}

/**
 * Create payment milestones (50% deposit + 50% final)
 */
export function createStandardMilestones(
  invoiceId: string,
  totalAmountCents: number,
  eventDate: Date
): MilestoneInsert[] {
  const depositDueDate = new Date();
  depositDueDate.setDate(depositDueDate.getDate() + 7); // Due in 7 days

  const finalDueDate = new Date(eventDate);
  finalDueDate.setDate(finalDueDate.getDate() - 7); // Due 7 days before event

  return [
    {
      invoice_id: invoiceId,
      milestone_type: 'deposit',
      description: '50% Deposit',
      percentage: 50,
      amount_cents: Math.floor(totalAmountCents / 2),
      due_date: depositDueDate.toISOString(),
      status: 'pending',
      is_due_now: true,
    },
    {
      invoice_id: invoiceId,
      milestone_type: 'final',
      description: 'Final Payment',
      percentage: 50,
      amount_cents: Math.ceil(totalAmountCents / 2),
      due_date: finalDueDate.toISOString(),
      status: 'pending',
      is_due_now: false,
    },
  ];
}

/**
 * Create Net30 milestone for government contracts
 */
export function createNet30Milestone(
  invoiceId: string,
  totalAmountCents: number,
  invoiceDate: Date
): MilestoneInsert[] {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30); // Net 30 terms

  return [
    {
      invoice_id: invoiceId,
      milestone_type: 'net30',
      description: 'Net 30 Payment',
      percentage: 100,
      amount_cents: totalAmountCents,
      due_date: dueDate.toISOString(),
      status: 'pending',
      is_due_now: false,
      is_net30: true,
    },
  ];
}

/**
 * Calculate invoice totals with tax
 */
export function calculateInvoiceTotals(
  lineItems: LineItemInsert[],
  isGovernment: boolean = false
) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
  const taxRate = isGovernment ? 0 : 0.08; // 8% tax unless government
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
  };
}

/**
 * Complete invoice with line items and milestones
 */
export interface CompleteInvoiceFixture {
  invoice: InvoiceInsert;
  lineItems: LineItemInsert[];
  milestones: MilestoneInsert[];
}

/**
 * Create a complete priced invoice ready for testing
 */
export function createCompleteInvoice(
  quoteId: string,
  guestCount: number = 50,
  eventDate: Date,
  isGovernment: boolean = false
): Omit<CompleteInvoiceFixture, 'invoice'> & { invoiceData: Partial<InvoiceInsert> } {
  // This returns data structures but NOT with invoice_id set
  // Caller must insert invoice first, then use its ID for line items
  
  const lineItems = createPricedLineItems('placeholder', guestCount);
  const totals = calculateInvoiceTotals(lineItems, isGovernment);
  const totalCents = totals.total_amount * 100; // Convert to cents

  const milestones = isGovernment
    ? createNet30Milestone('placeholder', totalCents, new Date())
    : createStandardMilestones('placeholder', totalCents, eventDate);

  return {
    invoiceData: {
      quote_request_id: quoteId,
      document_type: 'estimate',
      workflow_status: 'draft',
      currency: 'USD',
      is_draft: false,
      ...totals,
    },
    lineItems,
    milestones,
  };
}

/**
 * Invoice scenarios for different workflow states
 */
export const invoiceScenarios = {
  draft: { workflow_status: 'draft' as const, is_draft: true },
  sent: { workflow_status: 'sent' as const, is_draft: false, sent_at: new Date().toISOString() },
  viewed: { workflow_status: 'viewed' as const, is_draft: false, viewed_at: new Date().toISOString() },
  approved: { workflow_status: 'approved' as const, is_draft: false, reviewed_at: new Date().toISOString() },
  paymentPending: { workflow_status: 'payment_pending' as const, is_draft: false },
  partiallyPaid: { workflow_status: 'partially_paid' as const, is_draft: false },
  paid: { workflow_status: 'paid' as const, is_draft: false, paid_at: new Date().toISOString() },
};
