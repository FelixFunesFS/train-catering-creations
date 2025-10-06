import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type EstimateStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'ready_to_send' 
  | 'sent' 
  | 'viewed' 
  | 'customer_approved' 
  | 'customer_requested_changes'
  | 'revised'
  | 'expired'
  | 'cancelled';

export type QuoteStatus = 
  | 'pending'
  | 'under_review' 
  | 'quoted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

interface StatusTransition {
  from: EstimateStatus | QuoteStatus;
  to: EstimateStatus | QuoteStatus;
  allowedBy: 'admin' | 'customer' | 'system';
  requiresNotification: boolean;
  description: string;
}

interface StatusUpdate {
  entityType: 'quote' | 'invoice';
  entityId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  updateReason?: string;
  metadata?: any;
}

const ESTIMATE_TRANSITIONS: StatusTransition[] = [
  { from: 'draft', to: 'pending_review', allowedBy: 'admin', requiresNotification: false, description: 'Submit for review' },
  { from: 'pending_review', to: 'ready_to_send', allowedBy: 'admin', requiresNotification: false, description: 'Approve for sending' },
  { from: 'pending_review', to: 'draft', allowedBy: 'admin', requiresNotification: false, description: 'Return to draft' },
  { from: 'ready_to_send', to: 'sent', allowedBy: 'admin', requiresNotification: true, description: 'Send to customer' },
  { from: 'sent', to: 'viewed', allowedBy: 'system', requiresNotification: false, description: 'Customer viewed estimate' },
  { from: 'viewed', to: 'customer_approved', allowedBy: 'customer', requiresNotification: true, description: 'Customer approved' },
  { from: 'viewed', to: 'customer_requested_changes', allowedBy: 'customer', requiresNotification: true, description: 'Customer requested changes' },
  { from: 'customer_requested_changes', to: 'revised', allowedBy: 'admin', requiresNotification: true, description: 'Estimate revised' },
  { from: 'revised', to: 'sent', allowedBy: 'admin', requiresNotification: true, description: 'Send revised estimate' },
  { from: 'sent', to: 'expired', allowedBy: 'system', requiresNotification: true, description: 'Estimate expired' },
];

const QUOTE_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'under_review', allowedBy: 'admin', requiresNotification: false, description: 'Start review' },
  { from: 'under_review', to: 'quoted', allowedBy: 'admin', requiresNotification: true, description: 'Send quote to customer' },
  { from: 'quoted', to: 'confirmed', allowedBy: 'customer', requiresNotification: true, description: 'Customer confirmed' },
  { from: 'confirmed', to: 'completed', allowedBy: 'admin', requiresNotification: false, description: 'Event completed' },
];

export function useUnifiedStatusManagement() {
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateStatusTransition = useCallback((
    entityType: 'quote' | 'invoice',
    currentStatus: string,
    newStatus: string,
    userRole: 'admin' | 'customer' | 'system'
  ): { isValid: boolean; transition?: StatusTransition; error?: string } => {
    const transitions = entityType === 'invoice' ? ESTIMATE_TRANSITIONS : QUOTE_TRANSITIONS;
    
    const validTransition = transitions.find(t => 
      t.from === currentStatus && 
      t.to === newStatus && 
      t.allowedBy === userRole
    );

    if (!validTransition) {
      return {
        isValid: false,
        error: `Invalid status transition from ${currentStatus} to ${newStatus} for ${userRole}`
      };
    }

    return {
      isValid: true,
      transition: validTransition
    };
  }, []);

  const updateStatus = useCallback(async (
    entityType: 'quote' | 'invoice',
    entityId: string,
    newStatus: string,
    updatedBy: string = 'admin',
    updateReason?: string,
    metadata?: any
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Get current status
      const table = entityType === 'quote' ? 'quote_requests' : 'invoices';
      const { data: currentEntity, error: fetchError } = await supabase
        .from(table)
        .select('workflow_status')
        .eq('id', entityId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!currentEntity) throw new Error('Entity not found');

      const currentStatus = currentEntity.workflow_status;

      // Validate transition
      const validation = validateStatusTransition(
        entityType, 
        currentStatus, 
        newStatus, 
        updatedBy as any
      );

      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Update entity status
      const updateData: any = {
        workflow_status: newStatus,
        last_status_change: new Date().toISOString(),
        status_changed_by: updatedBy
      };

      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', entityId);

      if (updateError) throw updateError;

      // Log status change
      await logStatusChange({
        entityType,
        entityId,
        previousStatus: currentStatus,
        newStatus,
        updatedBy,
        updateReason,
        metadata
      });

      // Send notifications if required
      if (validation.transition?.requiresNotification) {
        await sendStatusNotification(entityType, entityId, newStatus, validation.transition);
      }

      toast({
        title: "Status Updated",
        description: `${entityType} status changed to ${newStatus}`,
      });

      return { success: true };

    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: `Failed to update status: ${errorMessage}`,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [validateStatusTransition, toast]);

  const logStatusChange = async (statusUpdate: StatusUpdate) => {
    try {
      const { error } = await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: statusUpdate.entityType,
          entity_id: statusUpdate.entityId,
          previous_status: statusUpdate.previousStatus,
          new_status: statusUpdate.newStatus,
          changed_by: statusUpdate.updatedBy,
          change_reason: statusUpdate.updateReason,
          metadata: statusUpdate.metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  };

  const sendStatusNotification = async (
    entityType: 'quote' | 'invoice',
    entityId: string,
    newStatus: string,
    transition: StatusTransition
  ) => {
    try {
      // Get entity details for notification
      const table = entityType === 'quote' ? 'quote_requests' : 'invoices';
      const { data: entity, error } = await supabase
        .from(table)
        .select(`
          *,
          ${entityType === 'quote' ? '' : 'quote_requests!quote_request_id(*)'}
        `)
        .eq('id', entityId)
        .maybeSingle();

      if (error || !entity) return;

      // Determine notification recipient
      const customerEmail = entityType === 'quote' 
        ? (entity as any).email 
        : (entity as any).quote_requests?.email;

      if (!customerEmail) return;

      // Send notification via edge function
      await supabase.functions.invoke('send-status-notification', {
        body: {
          entityType,
          entityId,
          customerEmail,
          newStatus,
          transition: transition.description,
          entityData: entity
        }
      });

    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  };

  const getStatusHistory = useCallback(async (
    entityType: 'quote' | 'invoice',
    entityId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('workflow_state_log')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching status history:', error);
      return [];
    }
  }, []);

  const getAvailableTransitions = useCallback((
    entityType: 'quote' | 'invoice',
    currentStatus: string,
    userRole: 'admin' | 'customer' | 'system'
  ): StatusTransition[] => {
    const transitions = entityType === 'invoice' ? ESTIMATE_TRANSITIONS : QUOTE_TRANSITIONS;
    
    return transitions.filter(t => 
      t.from === currentStatus && 
      t.allowedBy === userRole
    );
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colorMap: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'pending_review': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'ready_to_send': 'bg-green-100 text-green-800',
      'sent': 'bg-blue-100 text-blue-800',
      'viewed': 'bg-purple-100 text-purple-800',
      'quoted': 'bg-blue-100 text-blue-800',
      'customer_approved': 'bg-green-100 text-green-800',
      'customer_requested_changes': 'bg-orange-100 text-orange-800',
      'revised': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }, []);

  return {
    updateStatus,
    getStatusHistory,
    getAvailableTransitions,
    getStatusColor,
    validateStatusTransition,
    statusHistory,
    loading,
    
    // Status constants
    ESTIMATE_STATUSES: ESTIMATE_TRANSITIONS.map(t => t.to).filter((v, i, a) => a.indexOf(v) === i),
    QUOTE_STATUSES: QUOTE_TRANSITIONS.map(t => t.to).filter((v, i, a) => a.indexOf(v) === i)
  };
}