import { supabase } from '@/integrations/supabase/client';

export interface InvoicePaymentSummary {
  invoice_id: string;
  invoice_number: string | null;
  total_amount: number;
  subtotal: number;
  tax_amount: number | null;
  due_date: string | null;
  workflow_status: string;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  last_reminder_sent_at: string | null;
  reminder_count: number | null;
  invoice_created_at: string;
  quote_id: string | null;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  location: string;
  guest_count: number;
  guest_count_with_restrictions: string | null;
  special_requests: string | null;
  event_type: string;
  service_type: string;
  compliance_level: string | null;
  requires_po_number: boolean | null;
  total_paid: number;
  balance_remaining: number;
  days_overdue: number;
  milestones: PaymentMilestone[];
}

export interface PaymentMilestone {
  id: string;
  milestone_type: string;
  amount_cents: number;
  percentage: number;
  due_date: string | null;
  status: string;
}

export interface ARAgingBucket {
  label: string;
  count: number;
  amount: number;
}

export interface PaymentFilters {
  status?: string;
  overdue?: boolean;
  searchTerm?: string;
  dateRange?: { start: Date; end: Date };
}

/**
 * Centralized service for all payment/invoice data queries
 * Uses the invoice_payment_summary database view for consistent data access
 */
export class PaymentDataService {
  /**
   * Fetch all invoices with payment data from the invoice_payment_summary view
   * This ensures accurate total_paid and balance_remaining values
   */
  static async getInvoices(filters?: PaymentFilters): Promise<InvoicePaymentSummary[]> {
    let query = supabase
      .from('invoice_payment_summary')
      .select('*')
      .order('invoice_created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('workflow_status', filters.status as any);
    }

    if (filters?.overdue) {
      query = query.gt('days_overdue', 0);
    }

    if (filters?.dateRange) {
      query = query
        .gte('invoice_created_at', filters.dateRange.start.toISOString())
        .lte('invoice_created_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices from view:', error);
      throw error;
    }

    // Transform to InvoicePaymentSummary format
    return (data || []).map(inv => ({
      invoice_id: inv.invoice_id || '',
      invoice_number: inv.invoice_number,
      total_amount: inv.total_amount || 0,
      subtotal: inv.subtotal || 0,
      tax_amount: inv.tax_amount,
      due_date: inv.due_date,
      workflow_status: inv.workflow_status || 'draft',
      sent_at: inv.sent_at,
      viewed_at: inv.viewed_at,
      paid_at: inv.paid_at,
      last_reminder_sent_at: inv.last_reminder_sent_at,
      reminder_count: inv.reminder_count,
      invoice_created_at: inv.invoice_created_at || '',
      quote_id: inv.quote_id,
      contact_name: inv.contact_name || '',
      email: inv.email || '',
      phone: inv.phone || '',
      event_name: inv.event_name || '',
      event_date: inv.event_date || '',
      location: inv.location || '',
      guest_count: inv.guest_count || 0,
      guest_count_with_restrictions: inv.guest_count_with_restrictions,
      special_requests: inv.special_requests,
      event_type: inv.event_type || '',
      service_type: inv.service_type || '',
      compliance_level: inv.compliance_level,
      requires_po_number: inv.requires_po_number,
      total_paid: Number(inv.total_paid) || 0,
      balance_remaining: Number(inv.balance_remaining) || 0,
      days_overdue: inv.days_overdue || 0,
      milestones: Array.isArray(inv.milestones) ? inv.milestones.map((m: any) => ({
        id: m.id,
        milestone_type: m.milestone_type,
        amount_cents: m.amount_cents,
        percentage: m.percentage,
        due_date: m.due_date,
        status: m.status
      })) : []
    } as InvoicePaymentSummary)).filter(inv => {
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return inv.contact_name.toLowerCase().includes(term) ||
               inv.event_name.toLowerCase().includes(term) ||
               inv.email.toLowerCase().includes(term) ||
               (inv.invoice_number?.toLowerCase().includes(term) || false);
      }
      return true;
    });
  }

  /**
   * Get invoice by ID with full payment data from the invoice_payment_summary view
   * This ensures accurate total_paid and balance_remaining values
   */
  static async getInvoiceById(invoiceId: string): Promise<InvoicePaymentSummary | null> {
    const { data, error } = await supabase
      .from('invoice_payment_summary')
      .select('*')
      .eq('invoice_id', invoiceId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching invoice from view:', error);
      return null;
    }

    if (!data) return null;

    return {
      invoice_id: data.invoice_id || '',
      invoice_number: data.invoice_number,
      total_amount: data.total_amount || 0,
      subtotal: data.subtotal || 0,
      tax_amount: data.tax_amount,
      due_date: data.due_date,
      workflow_status: data.workflow_status || 'draft',
      sent_at: data.sent_at,
      viewed_at: data.viewed_at,
      paid_at: data.paid_at,
      last_reminder_sent_at: data.last_reminder_sent_at,
      reminder_count: data.reminder_count,
      invoice_created_at: data.invoice_created_at || '',
      quote_id: data.quote_id,
      contact_name: data.contact_name || '',
      email: data.email || '',
      phone: data.phone || '',
      event_name: data.event_name || '',
      event_date: data.event_date || '',
      location: data.location || '',
      guest_count: data.guest_count || 0,
      guest_count_with_restrictions: data.guest_count_with_restrictions,
      special_requests: data.special_requests,
      event_type: data.event_type || '',
      service_type: data.service_type || '',
      compliance_level: data.compliance_level,
      requires_po_number: data.requires_po_number,
      total_paid: Number(data.total_paid) || 0,
      balance_remaining: Number(data.balance_remaining) || 0,
      days_overdue: data.days_overdue || 0,
      milestones: Array.isArray(data.milestones) ? data.milestones.map((m: any) => ({
        id: m.id,
        milestone_type: m.milestone_type,
        amount_cents: m.amount_cents,
        percentage: m.percentage,
        due_date: m.due_date,
        status: m.status
      })) : []
    };
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices(): Promise<InvoicePaymentSummary[]> {
    const invoices = await this.getInvoices();
    return invoices.filter(inv => inv.days_overdue > 0);
  }

  /**
   * Get AR aging buckets
   */
  static async getARAgingBuckets(): Promise<ARAgingBucket[]> {
    const invoices = await this.getInvoices();
    
    const buckets: ARAgingBucket[] = [
      { label: 'Current', count: 0, amount: 0 },
      { label: '1-30 Days', count: 0, amount: 0 },
      { label: '31-60 Days', count: 0, amount: 0 },
      { label: '61-90 Days', count: 0, amount: 0 },
      { label: '90+ Days', count: 0, amount: 0 }
    ];

    invoices.forEach(inv => {
      if (inv.balance_remaining <= 0) return;
      
      const days = inv.days_overdue;
      let bucketIndex = 0;
      
      if (days <= 0) bucketIndex = 0;
      else if (days <= 30) bucketIndex = 1;
      else if (days <= 60) bucketIndex = 2;
      else if (days <= 90) bucketIndex = 3;
      else bucketIndex = 4;

      buckets[bucketIndex].count++;
      buckets[bucketIndex].amount += inv.balance_remaining;
    });

    return buckets;
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(): Promise<{
    totalOutstanding: number;
    totalOverdue: number;
    pendingCount: number;
    overdueCount: number;
  }> {
    const invoices = await this.getInvoices();

    const outstanding = invoices.filter(inv => 
      !['paid', 'cancelled'].includes(inv.workflow_status)
    );

    const overdue = invoices.filter(inv => inv.days_overdue > 0);

    return {
      totalOutstanding: outstanding.reduce((sum, inv) => sum + inv.balance_remaining, 0),
      totalOverdue: overdue.reduce((sum, inv) => sum + inv.balance_remaining, 0),
      pendingCount: outstanding.length,
      overdueCount: overdue.length
    };
  }

  /**
   * Get revenue for date range (for reporting)
   */
  static async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    paidInvoices: number;
    averageInvoiceValue: number;
  }> {
    const { data, error } = await supabase
      .from('invoices')
      .select('total_amount, workflow_status')
      .eq('workflow_status', 'paid')
      .gte('paid_at', startDate.toISOString())
      .lte('paid_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching revenue:', error);
      throw error;
    }

    const totalRevenue = (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidInvoices = data?.length || 0;

    return {
      totalRevenue,
      paidInvoices,
      averageInvoiceValue: paidInvoices > 0 ? totalRevenue / paidInvoices : 0
    };
  }

  /**
   * Void pending transactions for an invoice
   * Used when invoice is paid via alternate method
   */
  static async voidPendingTransactions(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status: 'voided',
        failed_reason: 'Voided: Invoice paid via alternate method',
        processed_at: new Date().toISOString()
      })
      .eq('invoice_id', invoiceId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error voiding pending transactions:', error);
      // Don't throw - this is a cleanup action
    }
  }

  /**
   * Void a specific transaction
   */
  static async voidTransaction(transactionId: string, reason?: string): Promise<void> {
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status: 'voided',
        failed_reason: reason || 'Manually voided',
        processed_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Error voiding transaction:', error);
      throw error;
    }
  }

  /**
   * Record a manual payment
   */
  static async recordManualPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    notes?: string,
    sendConfirmationEmail: boolean = true
  ): Promise<void> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const { error } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_type: 'manual',
        payment_method: paymentMethod,
        customer_email: invoice.email,
        status: 'completed',
        description: notes || `Manual payment - ${paymentMethod}`,
        processed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording payment:', error);
      throw error;
    }

    // Also write to payment_history for reporting consistency (mirrors webhook behavior)
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        notes: notes || `Manual payment - ${paymentMethod}`,
        transaction_date: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error writing to payment_history:', historyError);
      // Don't throw - payment_history is for reporting only
    }

    // Update invoice status if fully paid
    const newBalance = invoice.balance_remaining - amount;
    const isFullPayment = newBalance <= 0;
    
    if (isFullPayment) {
      await supabase
        .from('invoices')
        .update({ 
          workflow_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      // Auto-void any pending transactions (orphaned checkout sessions)
      await this.voidPendingTransactions(invoiceId);
    } else if (invoice.workflow_status !== 'partially_paid') {
      await supabase
        .from('invoices')
        .update({ workflow_status: 'partially_paid' })
        .eq('id', invoiceId);
    }

    // Send confirmation email if requested and quote exists
    if (sendConfirmationEmail && invoice.quote_id) {
      try {
        await supabase.functions.invoke('send-customer-portal-email', {
          body: {
            quote_request_id: invoice.quote_id,
            type: 'payment_confirmation',
            metadata: {
              amount: amount,
              payment_method: paymentMethod,
              is_full_payment: isFullPayment,
              remaining_balance: isFullPayment ? 0 : newBalance
            }
          }
        });
        console.log('Payment confirmation email sent');
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
        // Don't throw - payment was recorded successfully, email is secondary
      }
    }
  }

  /**
   * Get payment transactions with optional filtering
   */
  static async getPaymentTransactions(invoiceId?: string): Promise<PaymentTransaction[]> {
    let query = supabase
      .from('payment_transactions')
      .select(`
        id,
        invoice_id,
        amount,
        payment_method,
        payment_type,
        status,
        processed_at,
        created_at,
        description,
        customer_email,
        stripe_payment_intent_id,
        failed_reason
      `)
      .order('created_at', { ascending: false });

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    const { data: transactionsData, error } = await query;
    if (error) throw error;

    if (!transactionsData || transactionsData.length === 0) {
      return [];
    }

    // Fetch invoice details for each transaction
    const invoiceIds = [...new Set(transactionsData.map(t => t.invoice_id).filter(Boolean))];
    
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('id, invoice_number, quote_request_id')
      .in('id', invoiceIds);

    const quoteIds = invoicesData?.map(i => i.quote_request_id).filter(Boolean) || [];
    
    const { data: quotesData } = await supabase
      .from('quote_requests')
      .select('id, contact_name, event_name')
      .in('id', quoteIds);

    // Merge data
    return transactionsData.map(payment => {
      const invoice = invoicesData?.find(i => i.id === payment.invoice_id);
      const quote = quotesData?.find(q => q.id === invoice?.quote_request_id);
      return {
        ...payment,
        invoice_number: invoice?.invoice_number || null,
        contact_name: quote?.contact_name || null,
        event_name: quote?.event_name || null
      };
    });
  }
}

export interface PaymentTransaction {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string | null;
  payment_type: string;
  status: string;
  processed_at: string | null;
  created_at: string;
  description: string | null;
  customer_email: string;
  stripe_payment_intent_id: string | null;
  failed_reason: string | null;
  invoice_number: string | null;
  contact_name: string | null;
  event_name: string | null;
}
