import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type WorkflowStep = 'select' | 'template' | 'pricing' | 'review' | 'contract' | 'payment' | 'confirmed' | 'completed';

interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  stepData: {
    selectedTemplate?: string;
    contractGenerated?: boolean;
    paymentReceived?: boolean;
    eventConfirmed?: boolean;
  };
}

export function useWorkflowState(quoteId: string | undefined) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'select',
    completedSteps: [],
    stepData: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load workflow state from database
  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      return;
    }

    loadWorkflowState();
  }, [quoteId]);

  const loadWorkflowState = async () => {
    if (!quoteId) return;

    try {
      const { data, error } = await supabase
        .from('workflow_state')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWorkflowState({
          currentStep: data.current_step as WorkflowStep,
          completedSteps: (data.completed_steps || []) as WorkflowStep[],
          stepData: (data.step_data || {}) as any
        });
      } else {
        // Smart resume - determine step based on existing data
        await resumeWorkflow();
      }
    } catch (error) {
      console.error('Error loading workflow state:', error);
    } finally {
      setLoading(false);
    }
  };

  const resumeWorkflow = async () => {
    if (!quoteId) return;

    try {
      // Check what exists
      const { data: quote } = await supabase
        .from('quote_requests')
        .select('status, workflow_status, event_type')
        .eq('id', quoteId)
        .single();

      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      const { data: contract } = await supabase
        .from('contracts')
        .select('status')
        .eq('invoice_id', invoice?.id)
        .maybeSingle();

      // Determine appropriate step
      let step: WorkflowStep = 'pricing';
      const completed: WorkflowStep[] = ['select'];

      if (quote?.event_type?.includes('wedding')) {
        step = 'template';
      }

      if (invoice) {
        completed.push('pricing', 'review');
        step = 'review';
      }

      if (invoice?.status === 'sent' || contract) {
        completed.push('contract');
        step = 'contract';
      }

      if (contract?.status === 'signed') {
        completed.push('payment');
        step = 'payment';
      }

      if (quote?.status === 'confirmed') {
        completed.push('confirmed');
        step = 'confirmed';
      }

      if (quote?.status === 'completed') {
        completed.push('completed');
        step = 'completed';
      }

      setWorkflowState({
        currentStep: step,
        completedSteps: completed,
        stepData: {}
      });

    } catch (error) {
      console.error('Error resuming workflow:', error);
    }
  };

  const saveWorkflowState = async (newState: Partial<WorkflowState>) => {
    if (!quoteId) return;

    setSaving(true);
    try {
      const updatedState = { ...workflowState, ...newState };
      
      const { error } = await supabase
        .from('workflow_state')
        .upsert({
          quote_request_id: quoteId,
          current_step: updatedState.currentStep,
          completed_steps: updatedState.completedSteps,
          step_data: updatedState.stepData,
          last_updated: new Date().toISOString(),
          updated_by: 'admin'
        }, {
          onConflict: 'quote_request_id'
        });

      if (error) throw error;

      setWorkflowState(updatedState);
    } catch (error) {
      console.error('Error saving workflow state:', error);
      toast({
        title: "Save Error",
        description: "Failed to save workflow progress",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const advanceToStep = useCallback(async (nextStep: WorkflowStep) => {
    const newCompletedSteps = Array.from(new Set([...workflowState.completedSteps, workflowState.currentStep]));
    
    await saveWorkflowState({
      currentStep: nextStep,
      completedSteps: newCompletedSteps
    });
  }, [workflowState, quoteId]);

  const updateStepData = useCallback(async (data: any) => {
    await saveWorkflowState({
      stepData: { ...workflowState.stepData, ...data }
    });
  }, [workflowState, quoteId]);

  const goToStep = useCallback(async (step: WorkflowStep) => {
    await saveWorkflowState({
      currentStep: step
    });
  }, [quoteId]);

  return {
    currentStep: workflowState.currentStep,
    completedSteps: workflowState.completedSteps,
    stepData: workflowState.stepData,
    loading,
    saving,
    advanceToStep,
    updateStepData,
    goToStep,
    refreshState: loadWorkflowState
  };
}
