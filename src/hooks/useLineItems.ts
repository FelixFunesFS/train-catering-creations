import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineItemsService, LineItemInput, LineItem } from '@/services/LineItemsService';
import { toast } from 'sonner';

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
 */
export function useCreateLineItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, items }: { invoiceId: string; items: LineItemInput[] }) =>
      LineItemsService.createLineItems(invoiceId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['line-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
 */
export function useUpdateLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineItemId, updates, invoiceId }: { 
      lineItemId: string; 
      updates: Partial<LineItemInput>;
      invoiceId: string;
    }) => LineItemsService.updateLineItem(lineItemId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['line-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Line item updated');
    },
    onError: (error) => {
      console.error('Error updating line item:', error);
      toast.error('Failed to update line item');
    }
  });
}

/**
 * Hook for deleting a single line item
 */
export function useDeleteLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineItemId, invoiceId }: { lineItemId: string; invoiceId: string }) =>
      LineItemsService.deleteLineItem(lineItemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['line-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
 */
export function useReplaceLineItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, items }: { invoiceId: string; items: LineItemInput[] }) =>
      LineItemsService.replaceLineItems(invoiceId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['line-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Line items updated');
    },
    onError: (error) => {
      console.error('Error replacing line items:', error);
      toast.error('Failed to update line items');
    }
  });
}
