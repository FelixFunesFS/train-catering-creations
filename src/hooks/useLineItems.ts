import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineItemsService, LineItemInput, LineItem } from '@/services/LineItemsService';
import { toast } from 'sonner';
import { useInvoiceTotalSync } from './useInvoiceTotalSync';

/**
 * Hook for fetching line items for an invoice
 */
export function useLineItems(invoiceId: string | null) {
  return useQuery({
    queryKey: ['line-items', invoiceId],
    queryFn: () => invoiceId ? LineItemsService.getLineItemsByInvoice(invoiceId) : [],
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for creating line items
 * Automatically syncs invoice totals after creation
 */
export function useCreateLineItems() {
  const queryClient = useQueryClient();
  const { syncInvoiceTotals } = useInvoiceTotalSync();

  return useMutation({
    mutationFn: ({ invoiceId, items }: { invoiceId: string; items: LineItemInput[] }) =>
      LineItemsService.createLineItems(invoiceId, items),
    onSuccess: async (_, variables) => {
      // Sync invoice totals (waits for DB trigger, then verifies with RPC)
      await syncInvoiceTotals(variables.invoiceId);
      toast.success('Line items created');
    },
    onError: (error) => {
      console.error('Error creating line items:', error);
      toast.error('Failed to create line items');
    }
  });
}

/**
 * Hook for updating a single line item
 * Uses optimistic updates for responsive UI
 */
export function useUpdateLineItem() {
  const queryClient = useQueryClient();
  const { syncInvoiceTotals } = useInvoiceTotalSync();

  return useMutation({
    mutationFn: ({ lineItemId, updates, invoiceId }: { 
      lineItemId: string; 
      updates: Partial<LineItemInput>;
      invoiceId: string;
    }) => LineItemsService.updateLineItem(lineItemId, updates),
    
    // Optimistic update - update cache BEFORE API call completes
    onMutate: async (variables) => {
      // Cancel any in-flight queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['line-items', variables.invoiceId] });
      
      // Snapshot previous data for rollback
      const previousItems = queryClient.getQueryData(['line-items', variables.invoiceId]);
      
      // Optimistically update cache
      queryClient.setQueryData(['line-items', variables.invoiceId], (old: LineItem[] | undefined) => {
        if (!old) return old;
        return old.map(item => 
          item.id === variables.lineItemId 
            ? { ...item, ...variables.updates }
            : item
        );
      });
      
      return { previousItems };
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(['line-items', variables.invoiceId], context.previousItems);
      }
      console.error('Error updating line item:', error);
      toast.error('Failed to update line item');
    },
    
    onSuccess: async (_, variables) => {
      // Sync invoice totals after successful update
      await syncInvoiceTotals(variables.invoiceId, { delay: 100 });
    },
  });
}

/**
 * Hook for deleting a single line item
 * Automatically syncs invoice totals after deletion
 */
export function useDeleteLineItem() {
  const queryClient = useQueryClient();
  const { syncInvoiceTotals } = useInvoiceTotalSync();

  return useMutation({
    mutationFn: ({ lineItemId, invoiceId }: { lineItemId: string; invoiceId: string }) =>
      LineItemsService.deleteLineItem(lineItemId),
    onSuccess: async (_, variables) => {
      // Sync invoice totals (waits for DB trigger, then verifies with RPC)
      await syncInvoiceTotals(variables.invoiceId);
      toast.success('Line item deleted');
    },
    onError: (error) => {
      console.error('Error deleting line item:', error);
      toast.error('Failed to delete line item');
    }
  });
}

/**
 * Hook for replacing all line items for an invoice
 * Automatically syncs invoice totals after replacement
 */
export function useReplaceLineItems() {
  const queryClient = useQueryClient();
  const { syncInvoiceTotals } = useInvoiceTotalSync();

  return useMutation({
    mutationFn: ({ invoiceId, items }: { invoiceId: string; items: LineItemInput[] }) =>
      LineItemsService.replaceLineItems(invoiceId, items),
    onSuccess: async (_, variables) => {
      // Sync invoice totals (waits for DB trigger, then verifies with RPC)
      await syncInvoiceTotals(variables.invoiceId);
      toast.success('Line items updated');
    },
    onError: (error) => {
      console.error('Error replacing line items:', error);
      toast.error('Failed to update line items');
    }
  });
}
