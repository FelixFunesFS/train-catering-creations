import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowSyncOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useWorkflowSync() {
  const { toast } = useToast();

  const syncQuoteWithInvoice = useCallback(async (
    quoteId: string,
    options: WorkflowSyncOptions = {}
  ) => {
    try {
      // Get quote and invoice data
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (invoiceError) throw invoiceError;

      // Determine correct statuses based on workflow state
      let quoteUpdate: any = {};
      let invoiceUpdate: any = {};

      // Sync quote workflow_status with invoice workflow_status
      if (invoice) {
        if (invoice.workflow_status === 'sent' && quote.workflow_status !== 'estimated') {
          quoteUpdate.workflow_status = 'estimated';
        }
        
        if (invoice.workflow_status === 'paid' && quote.workflow_status !== 'confirmed') {
          quoteUpdate.workflow_status = 'confirmed';
        }
      }

      // Apply updates
      if (Object.keys(quoteUpdate).length > 0) {
        quoteUpdate.updated_at = new Date().toISOString();
        quoteUpdate.status_changed_by = 'system_sync';

        const { error: updateError } = await supabase
          .from('quote_requests')
          .update(quoteUpdate)
          .eq('id', quoteId);

        if (updateError) throw updateError;
      }

      if (invoice && Object.keys(invoiceUpdate).length > 0) {
        invoiceUpdate.updated_at = new Date().toISOString();
        invoiceUpdate.status_changed_by = 'system_sync';

        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoiceUpdate)
          .eq('id', invoice.id);

        if (updateError) throw updateError;
      }

      const message = 'Workflow status synchronized successfully';
      options.onSuccess?.(message);
      toast({
        title: "Status Synchronized",
        description: message,
      });

      return { success: true, quote, invoice };

    } catch (error) {
      console.error('Error syncing workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      options.onError?.(errorMessage);
      toast({
        title: "Sync Error",
        description: `Failed to sync workflow: ${errorMessage}`,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    }
  }, [toast]);

  const ensureStepCompletion = useCallback(async (
    quoteId: string,
    stepId: string,
    stepName: string,
    completedBy: string = 'admin'
  ) => {
    try {
      // Check if step already completed
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
            notes: 'Step marked as completed during sync'
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error ensuring step completion:', error);
      return { success: false, error };
    }
  }, []);

  const validateWorkflowConsistency = useCallback(async (quoteId: string) => {
    try {
      // Get all related data
      const { data: quote } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      const { data: completedSteps } = await supabase
        .from('workflow_step_completion')
        .select('step_id')
        .eq('quote_request_id', quoteId);

      if (!quote) return { success: false, error: 'Quote not found' };

      const issues: string[] = [];
      const fixes: (() => Promise<any>)[] = [];

      // Check pricing completion
      if (quote.estimated_total > 0) {
        const hasPricingStep = completedSteps?.some(s => s.step_id === 'pricing_completed');
        if (!hasPricingStep) {
          issues.push('Pricing step not marked as completed');
          fixes.push(() => ensureStepCompletion(quoteId, 'pricing_completed', 'Pricing Completed'));
        }
      }

      // Check estimate sent
      if (quote.workflow_status === 'estimated' || invoice?.workflow_status === 'sent') {
        const hasEstimateSent = completedSteps?.some(s => s.step_id === 'estimate_sent');
        if (!hasEstimateSent) {
          issues.push('Estimate sent step not marked as completed');
          fixes.push(() => ensureStepCompletion(quoteId, 'estimate_sent', 'Estimate Sent'));
        }
      }

      // Apply fixes
      for (const fix of fixes) {
        await fix();
      }

      return {
        success: true,
        issues: issues.length > 0 ? issues : null,
        fixed: fixes.length
      };

    } catch (error) {
      console.error('Error validating workflow consistency:', error);
      return { success: false, error };
    }
  }, [ensureStepCompletion]);

  return {
    syncQuoteWithInvoice,
    ensureStepCompletion,
    validateWorkflowConsistency
  };
}