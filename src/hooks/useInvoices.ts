import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentDataService, PaymentFilters } from '@/services/PaymentDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceWorkflowStatus = Database['public']['Enums']['invoice_workflow_status'];

// Query keys factory for consistent cache management
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  byQuote: (quoteId: string) => [...invoiceKeys.all, 'quote', quoteId] as const,
  byStatus: (status: InvoiceWorkflowStatus) => [...invoiceKeys.all, 'status', status] as const,
  overdue: () => [...invoiceKeys.all, 'overdue'] as const,
  lineItems: (invoiceId: string) => [...invoiceKeys.detail(invoiceId), 'line-items'] as const,
  milestones: (invoiceId: string) => [...invoiceKeys.detail(invoiceId), 'milestones'] as const,
};

/**
 * Hook for fetching invoices with optional filters
 */
export function useInvoices(filters?: PaymentFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters as Record<string, unknown> || {}),
    queryFn: () => PaymentDataService.getInvoices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching a single invoice by ID
 */
export function useInvoice(invoiceId: string | undefined | null) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId || ''),
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Invoice | null;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching invoice by quote ID
 */
export function useInvoiceByQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.byQuote(quoteId || ''),
    queryFn: async () => {
      if (!quoteId) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Invoice | null;
    },
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching invoice with line items
 */
export function useInvoiceWithLineItems(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(invoiceId || ''), 'with-line-items'],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();
      
      if (invoiceError) throw invoiceError;
      if (!invoice) return null;

      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });
      
      if (lineItemsError) throw lineItemsError;

      return { invoice: invoice as Invoice, lineItems: lineItems || [] };
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching invoice with milestones
 */
export function useInvoiceWithMilestones(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(invoiceId || ''), 'with-milestones'],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();
      
      if (invoiceError) throw invoiceError;
      if (!invoice) return null;

      const { data: milestones, error: milestonesError } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('due_date', { ascending: true });
      
      if (milestonesError) throw milestonesError;

      return { invoice: invoice as Invoice, milestones: milestones || [] };
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching overdue invoices
 */
export function useOverdueInvoices() {
  return useQuery({
    queryKey: invoiceKeys.overdue(),
    queryFn: () => PaymentDataService.getOverdueInvoices(),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching invoices by status
 */
export function useInvoicesByStatus(status: InvoiceWorkflowStatus) {
  return useQuery({
    queryKey: invoiceKeys.byStatus(status),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('workflow_status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching payment statistics
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: () => PaymentDataService.getPaymentStats(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

/**
 * Hook for fetching revenue by date range
 */
export function useRevenue(startDate: Date | null, endDate: Date | null) {
  return useQuery({
    queryKey: ['revenue', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => startDate && endDate 
      ? PaymentDataService.getRevenueByDateRange(startDate, endDate) 
      : Promise.resolve({ totalRevenue: 0, paidInvoices: 0, averageInvoiceValue: 0 }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for fetching payment transactions with optional invoice filter
 */
export function usePaymentTransactions(invoiceId?: string) {
  return useQuery({
    queryKey: ['payment-transactions', invoiceId],
    queryFn: () => PaymentDataService.getPaymentTransactions(invoiceId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for updating an invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      updates,
    }: {
      invoiceId: string;
      updates: Partial<Invoice>;
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast({
        title: 'Invoice updated',
        description: 'Invoice has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for updating invoice status
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      status,
      reason,
    }: {
      invoiceId: string;
      status: InvoiceWorkflowStatus;
      reason?: string;
    }) => {
      // Get current status for logging
      const { data: current } = await supabase
        .from('invoices')
        .select('workflow_status')
        .eq('id', invoiceId)
        .maybeSingle();

      const previousStatus = current?.workflow_status;

      // Update invoice status
      const { data, error } = await supabase
        .from('invoices')
        .update({
          workflow_status: status,
          last_status_change: new Date().toISOString(),
          status_changed_by: 'admin',
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      // Log the status change
      await supabase.from('workflow_state_log').insert({
        entity_type: 'invoice',
        entity_id: invoiceId,
        previous_status: previousStatus,
        new_status: status,
        changed_by: 'admin',
        change_reason: reason,
      });

      return data as Invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast({
        title: 'Status updated',
        description: `Invoice status changed to ${data.workflow_status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for recording a manual payment
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      invoiceId, 
      amount, 
      paymentMethod, 
      notes,
      sendConfirmationEmail = true
    }: { 
      invoiceId: string; 
      amount: number; 
      paymentMethod: string; 
      notes?: string;
      sendConfirmationEmail?: boolean;
    }) => PaymentDataService.recordManualPayment(invoiceId, amount, paymentMethod, notes, sendConfirmationEmail),
    onSuccess: (_, variables) => {
      // Remove queries entirely to force fresh fetch (not just invalidate)
      queryClient.removeQueries({ queryKey: invoiceKeys.all });
      queryClient.removeQueries({ queryKey: ['payments'] });
      queryClient.removeQueries({ queryKey: ['payment-transactions'] });
      queryClient.removeQueries({ queryKey: ['invoice-summary'] });
      queryClient.removeQueries({ queryKey: ['ar-dashboard'] });
      
      // Then invalidate to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
      
      toast({
        title: 'Payment recorded',
        description: variables.sendConfirmationEmail 
          ? 'Payment recorded and confirmation email sent.'
          : 'Payment has been recorded successfully.',
      });
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error recording payment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

/**
 * Hook for sending invoice email
 */
export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      emailType = 'estimate',
    }: {
      invoiceId: string;
      emailType?: 'estimate' | 'invoice' | 'reminder';
    }) => {
      // Update sent_at timestamp
      const { error } = await supabase
        .from('invoices')
        .update({
          sent_at: new Date().toISOString(),
          workflow_status: 'sent',
        })
        .eq('id', invoiceId);

      if (error) throw error;
      return { invoiceId, emailType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast({
        title: 'Email sent',
        description: `${data.emailType} email has been sent successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error sending email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for deleting an invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      // First delete related records
      await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);
      await supabase.from('payment_milestones').delete().eq('invoice_id', invoiceId);
      await supabase.from('payment_transactions').delete().eq('invoice_id', invoiceId);

      // Delete invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      return invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast({
        title: 'Invoice deleted',
        description: 'Invoice has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
