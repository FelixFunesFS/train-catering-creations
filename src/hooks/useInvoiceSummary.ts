import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentDataService, InvoicePaymentSummary } from '@/services/PaymentDataService';

/**
 * Hook for fetching invoice summary with accurate payment data
 * Uses the invoice_payment_summary database view for real-time balance calculations
 * Configured with staleTime: 0 for payment-critical contexts
 */
export function useInvoiceSummary(invoiceId: string | undefined | null) {
  return useQuery({
    queryKey: ['invoice-summary', invoiceId],
    queryFn: () => PaymentDataService.getInvoiceById(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 0, // Always fetch fresh for payment contexts
    gcTime: 1000 * 60 * 1, // 1 minute cache
  });
}

/**
 * Hook to force refetch of invoice summary data
 */
export function useInvalidateInvoiceSummary() {
  const queryClient = useQueryClient();
  
  return (invoiceId?: string) => {
    if (invoiceId) {
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', invoiceId] });
    }
    queryClient.invalidateQueries({ queryKey: ['invoice-summary'] });
  };
}
