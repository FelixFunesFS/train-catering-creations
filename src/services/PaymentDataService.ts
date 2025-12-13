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
   * Fetch all invoices with payment data
   */
  static async getInvoices(filters?: PaymentFilters): Promise<InvoicePaymentSummary[]> {
    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        subtotal,
        tax_amount,
        due_date,
        workflow_status,
        sent_at,
        viewed_at,
        paid_at,
        last_reminder_sent_at,
        reminder_count,
        created_at,
        quote_request_id,
        quote_requests!left (
          id,
          contact_name,
          email,
          phone,
          event_name,
          event_date,
          location,
          guest_count,
          event_type,
          service_type,
          compliance_level,
          requires_po_number
        ),
        payment_milestones!left (
          id,
          milestone_type,
          amount_cents,
          percentage,
          due_date,
          status
        ),
        payment_transactions!left (
          amount,
          status
        )
      `)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('workflow_status', filters.status as any);
    }

    if (filters?.overdue) {
      query = query.eq('workflow_status', 'overdue');
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    // Transform to InvoicePaymentSummary format
    return (data || []).map(inv => {
      const qr = inv.quote_requests as any;
      const milestones = (inv.payment_milestones || []) as any[];
      const transactions = (inv.payment_transactions || []) as any[];
      
      const totalPaid = transactions
        .filter((t: any) => t.status === 'completed')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const today = new Date();
      const dueDate = inv.due_date ? new Date(inv.due_date) : null;
      const daysOverdue = dueDate && dueDate < today && !['paid', 'cancelled'].includes(inv.workflow_status)
        ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        total_amount: inv.total_amount,
        subtotal: inv.subtotal,
        tax_amount: inv.tax_amount,
        due_date: inv.due_date,
        workflow_status: inv.workflow_status,
        sent_at: inv.sent_at,
        viewed_at: inv.viewed_at,
        paid_at: inv.paid_at,
        last_reminder_sent_at: inv.last_reminder_sent_at,
        reminder_count: inv.reminder_count,
        invoice_created_at: inv.created_at,
        quote_id: inv.quote_request_id,
        contact_name: qr?.contact_name || '',
        email: qr?.email || '',
        phone: qr?.phone || '',
        event_name: qr?.event_name || '',
        event_date: qr?.event_date || '',
        location: qr?.location || '',
        guest_count: qr?.guest_count || 0,
        event_type: qr?.event_type || '',
        service_type: qr?.service_type || '',
        compliance_level: qr?.compliance_level,
        requires_po_number: qr?.requires_po_number,
        total_paid: totalPaid,
        balance_remaining: inv.total_amount - totalPaid,
        days_overdue: daysOverdue,
        milestones: milestones.map(m => ({
          id: m.id,
          milestone_type: m.milestone_type,
          amount_cents: m.amount_cents,
          percentage: m.percentage,
          due_date: m.due_date,
          status: m.status
        }))
      } as InvoicePaymentSummary;
    }).filter(inv => {
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
   * Get invoice by ID with full payment data
   */
  static async getInvoiceById(invoiceId: string): Promise<InvoicePaymentSummary | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        subtotal,
        tax_amount,
        due_date,
        workflow_status,
        sent_at,
        viewed_at,
        paid_at,
        last_reminder_sent_at,
        reminder_count,
        created_at,
        quote_request_id,
        quote_requests!left (
          id,
          contact_name,
          email,
          phone,
          event_name,
          event_date,
          location,
          guest_count,
          event_type,
          service_type,
          compliance_level,
          requires_po_number
        ),
        payment_milestones!left (
          id,
          milestone_type,
          amount_cents,
          percentage,
          due_date,
          status
        ),
        payment_transactions!left (
          amount,
          status
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !data) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    const qr = data.quote_requests as any;
    const milestones = (data.payment_milestones || []) as any[];
    const transactions = (data.payment_transactions || []) as any[];
    
    const totalPaid = transactions
      .filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const today = new Date();
    const dueDate = data.due_date ? new Date(data.due_date) : null;
    const daysOverdue = dueDate && dueDate < today && !['paid', 'cancelled'].includes(data.workflow_status)
      ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      invoice_id: data.id,
      invoice_number: data.invoice_number,
      total_amount: data.total_amount,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      due_date: data.due_date,
      workflow_status: data.workflow_status,
      sent_at: data.sent_at,
      viewed_at: data.viewed_at,
      paid_at: data.paid_at,
      last_reminder_sent_at: data.last_reminder_sent_at,
      reminder_count: data.reminder_count,
      invoice_created_at: data.created_at,
      quote_id: data.quote_request_id,
      contact_name: qr?.contact_name || '',
      email: qr?.email || '',
      phone: qr?.phone || '',
      event_name: qr?.event_name || '',
      event_date: qr?.event_date || '',
      location: qr?.location || '',
      guest_count: qr?.guest_count || 0,
      event_type: qr?.event_type || '',
      service_type: qr?.service_type || '',
      compliance_level: qr?.compliance_level,
      requires_po_number: qr?.requires_po_number,
      total_paid: totalPaid,
      balance_remaining: data.total_amount - totalPaid,
      days_overdue: daysOverdue,
      milestones: milestones.map(m => ({
        id: m.id,
        milestone_type: m.milestone_type,
        amount_cents: m.amount_cents,
        percentage: m.percentage,
        due_date: m.due_date,
        status: m.status
      }))
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
      .eq('is_draft', false)
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
   * Record a manual payment
   */
  static async recordManualPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    notes?: string
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

    // Update invoice status if fully paid
    const newBalance = invoice.balance_remaining - amount;
    if (newBalance <= 0) {
      await supabase
        .from('invoices')
        .update({ 
          workflow_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    } else if (invoice.workflow_status !== 'partially_paid') {
      await supabase
        .from('invoices')
        .update({ workflow_status: 'partially_paid' })
        .eq('id', invoiceId);
    }
  }
}
