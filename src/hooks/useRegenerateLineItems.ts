import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { QuoteUpdateService } from '@/services/QuoteUpdateService';

/**
 * Hook to regenerate invoice line items from quote data
 * Uses smart price preservation for existing items
 */
export function useRegenerateLineItems() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const service = new QuoteUpdateService();

  return useMutation({
    mutationFn: async ({ invoiceId, quoteId }: { invoiceId: string; quoteId: string }) => {
      await service.updateInvoiceLineItems(invoiceId, quoteId, {});
      return { invoiceId };
    },
    onSuccess: ({ invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['line-items', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ 
        title: 'Line items regenerated', 
        description: 'Prices preserved where possible. New items set to $0.' 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error regenerating line items', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });
}
