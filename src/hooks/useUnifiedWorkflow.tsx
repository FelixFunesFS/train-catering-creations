import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowStateManager, QuoteWorkflowStatus, InvoiceWorkflowStatus } from '@/services/WorkflowStateManager';

interface WorkflowSyncOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useUnifiedWorkflow() {
  const { toast } = useToast();

  const updateQuoteStatus = useCallback(async (
    quoteId: string,
    newStatus: QuoteWorkflowStatus,
    changedBy: string = 'admin',
    reason?: string
  ) => {
    const result = await WorkflowStateManager.updateQuoteStatus(quoteId, newStatus, changedBy, reason);
    
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Quote status changed to ${WorkflowStateManager.getStatusLabel(newStatus)}`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    return result;
  }, [toast]);

  const updateInvoiceStatus = useCallback(async (
    invoiceId: string,
    newStatus: InvoiceWorkflowStatus,
    changedBy: string = 'admin',
    reason?: string
  ) => {
    const result = await WorkflowStateManager.updateInvoiceStatus(invoiceId, newStatus, changedBy, reason);
    
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Invoice status changed to ${WorkflowStateManager.getStatusLabel(newStatus)}`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    return result;
  }, [toast]);

  const validateConsistency = useCallback(async (quoteId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_workflow_consistency', { p_quote_id: quoteId });

      if (error) throw error;

      return {
        isConsistent: data[0]?.is_consistent ?? true,
        issues: data[0]?.issues ?? []
      };
    } catch (error) {
      console.error('Error validating workflow consistency:', error);
      return { isConsistent: false, issues: [] };
    }
  }, []);

  const ensureStepCompletion = useCallback(async (
    quoteId: string,
    stepId: string,
    stepName: string,
    completedBy: string = 'admin'
  ) => {
    try {
      const { data: existing } = await supabase
        .from('workflow_step_completion')
        .select('id')
        .eq('quote_request_id', quoteId)
        .eq('step_id', stepId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('workflow_step_completion')
          .insert({
            quote_request_id: quoteId,
            step_id: stepId,
            step_name: stepName,
            completed_by: completedBy,
            notes: 'Auto-completed during workflow sync'
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error ensuring step completion:', error);
      return { success: false, error };
    }
  }, []);

  const getAvailableQuoteTransitions = useCallback((currentStatus: QuoteWorkflowStatus) => {
    return WorkflowStateManager.getNextQuoteStatuses(currentStatus);
  }, []);

  const getAvailableInvoiceTransitions = useCallback((currentStatus: InvoiceWorkflowStatus) => {
    return WorkflowStateManager.getNextInvoiceStatuses(currentStatus);
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    return WorkflowStateManager.getStatusLabel(status);
  }, []);

  return {
    updateQuoteStatus,
    updateInvoiceStatus,
    validateConsistency,
    ensureStepCompletion,
    getAvailableQuoteTransitions,
    getAvailableInvoiceTransitions,
    getStatusLabel,
  };
}
