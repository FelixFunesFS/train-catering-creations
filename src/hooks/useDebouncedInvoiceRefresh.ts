import { useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook that provides debounced invoice refresh to prevent
 * UI flicker during rapid line item edits while ensuring
 * invoice totals eventually sync from database triggers.
 */
export function useDebouncedInvoiceRefresh(invoiceId: string | null | undefined, delay = 2000) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleRefresh = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Schedule new refresh after delay of inactivity
    timeoutRef.current = setTimeout(() => {
      if (invoiceId) {
        // Refresh invoice totals (calculated by DB trigger)
        queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
    }, delay);
  }, [invoiceId, queryClient, delay]);

  const cancelRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Force immediate refresh (e.g., when closing editor)
  const forceRefresh = useCallback(() => {
    cancelRefresh();
    if (invoiceId) {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['line-items', invoiceId] });
      // Also invalidate events and quotes for data flow to calendar/summary views
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  }, [invoiceId, queryClient, cancelRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scheduleRefresh, cancelRefresh, forceRefresh };
}
