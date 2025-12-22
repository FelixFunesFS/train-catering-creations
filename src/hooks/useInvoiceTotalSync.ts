import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SyncOptions {
  /** Delay in ms to wait for DB triggers to complete (default: 200ms) */
  delay?: number;
  /** Whether to invalidate payment milestone queries (default: true) */
  invalidateMilestones?: boolean;
  /** Whether to show console logs for debugging (default: false) */
  debug?: boolean;
}

/**
 * Hook that provides a utility function to ensure invoice totals are synced
 * after any line item operation. This is the single source of truth for
 * invoice total recalculation.
 * 
 * Flow:
 * 1. Wait briefly for DB triggers to complete
 * 2. Call force_recalculate_invoice_totals RPC as verification
 * 3. Invalidate all related queries to refresh UI
 */
export function useInvoiceTotalSync() {
  const queryClient = useQueryClient();

  /**
   * Sync invoice totals after a line item change.
   * Call this after any create/update/delete line item operation.
   */
  const syncInvoiceTotals = async (
    invoiceId: string,
    options: SyncOptions = {}
  ): Promise<void> => {
    const { delay = 200, invalidateMilestones = true, debug = false } = options;

    if (!invoiceId) {
      console.warn('syncInvoiceTotals called without invoiceId');
      return;
    }

    try {
      // 1. Wait for DB trigger to complete (recalculate_invoice_totals)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // 2. Force recalculate as verification (belt & suspenders)
      const { error } = await supabase.rpc('force_recalculate_invoice_totals', {
        p_invoice_id: invoiceId
      });

      if (error) {
        console.error('Error in force_recalculate_invoice_totals:', error);
      } else if (debug) {
        console.log(`Invoice ${invoiceId} totals recalculated successfully`);
      }

      // 3. Invalidate all related queries to refresh UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['line-items', invoiceId] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['quotes'] }),
        ...(invalidateMilestones ? [
          queryClient.invalidateQueries({ queryKey: ['payment-milestones', invoiceId] }),
          queryClient.invalidateQueries({ queryKey: ['invoice-with-milestones', invoiceId] }),
        ] : []),
      ]);

      if (debug) {
        console.log(`Invoice ${invoiceId} queries invalidated`);
      }
    } catch (err) {
      console.error('Error syncing invoice totals:', err);
    }
  };

  return { syncInvoiceTotals };
}

/**
 * Standalone function version for use outside React components.
 * Requires passing queryClient explicitly.
 */
export async function syncInvoiceTotalsStandalone(
  invoiceId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  options: SyncOptions = {}
): Promise<void> {
  const { delay = 200, invalidateMilestones = true } = options;

  if (!invoiceId) return;

  try {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    await supabase.rpc('force_recalculate_invoice_totals', {
      p_invoice_id: invoiceId
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
      queryClient.invalidateQueries({ queryKey: ['invoices'] }),
      queryClient.invalidateQueries({ queryKey: ['line-items', invoiceId] }),
      queryClient.invalidateQueries({ queryKey: ['events'] }),
      queryClient.invalidateQueries({ queryKey: ['quotes'] }),
      ...(invalidateMilestones ? [
        queryClient.invalidateQueries({ queryKey: ['payment-milestones', invoiceId] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-with-milestones', invoiceId] }),
      ] : []),
    ]);
  } catch (err) {
    console.error('Error syncing invoice totals:', err);
  }
}
