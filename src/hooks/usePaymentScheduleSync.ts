import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentScheduleSyncOptions {
  invoiceId: string | undefined;
  totalAmount: number;
  isGovernment: boolean;
  enabled?: boolean;
}

/**
 * Hook to auto-regenerate payment milestones when invoice total or government status changes
 * Preserves paid milestone statuses during regeneration
 */
export function usePaymentScheduleSync({
  invoiceId,
  totalAmount,
  isGovernment,
  enabled = true,
}: UsePaymentScheduleSyncOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Track previous values to detect changes
  const prevTotalRef = useRef<number>(totalAmount);
  const prevGovRef = useRef<boolean>(isGovernment);
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);

  const regenerateMilestones = useCallback(async () => {
    if (!invoiceId || isSyncing.current) return;
    
    isSyncing.current = true;
    
    try {
      const { error } = await supabase.functions.invoke('generate-payment-milestones', {
        body: { 
          invoice_id: invoiceId, 
          force_regenerate: true 
        }
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['invoice-with-milestones', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payment-milestones', invoiceId] });
      
      console.log('[PaymentScheduleSync] Milestones regenerated successfully');
    } catch (err: any) {
      console.error('[PaymentScheduleSync] Error regenerating milestones:', err);
      toast({
        title: 'Payment Schedule Update Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      isSyncing.current = false;
    }
  }, [invoiceId, queryClient, toast]);

  useEffect(() => {
    if (!enabled || !invoiceId) return;
    
    // Skip initial mount to avoid unnecessary regeneration
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevTotalRef.current = totalAmount;
      prevGovRef.current = isGovernment;
      return;
    }
    
    // Check if values have changed significantly
    const totalChanged = Math.abs(prevTotalRef.current - totalAmount) > 0;
    const govChanged = prevGovRef.current !== isGovernment;
    
    if (totalChanged || govChanged) {
      console.log('[PaymentScheduleSync] Detected changes', {
        totalChanged,
        govChanged,
        oldTotal: prevTotalRef.current,
        newTotal: totalAmount,
        oldGov: prevGovRef.current,
        newGov: isGovernment,
      });
      
      // Update refs
      prevTotalRef.current = totalAmount;
      prevGovRef.current = isGovernment;
      
      // Debounce regeneration slightly to avoid rapid-fire calls
      const timer = setTimeout(() => {
        regenerateMilestones();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [enabled, invoiceId, totalAmount, isGovernment, regenerateMilestones]);

  return {
    regenerateMilestones,
    isSyncing: isSyncing.current,
  };
}
