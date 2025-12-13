import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentDataService, PaymentFilters, InvoicePaymentSummary } from '@/services/PaymentDataService';
import { toast } from 'sonner';

/**
 * Hook for fetching invoices with optional filters
 */
export function useInvoices(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => PaymentDataService.getInvoices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching a single invoice by ID
 */
export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceId ? PaymentDataService.getInvoiceById(invoiceId) : null,
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching overdue invoices
 */
export function useOverdueInvoices() {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: () => PaymentDataService.getOverdueInvoices(),
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
 * Hook for recording a manual payment
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      invoiceId, 
      amount, 
      paymentMethod, 
      notes 
    }: { 
      invoiceId: string; 
      amount: number; 
      paymentMethod: string; 
      notes?: string;
    }) => PaymentDataService.recordManualPayment(invoiceId, amount, paymentMethod, notes),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['ar-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  });
}
