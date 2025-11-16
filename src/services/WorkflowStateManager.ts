import { supabase } from '@/integrations/supabase/client';

// Unified workflow status types
export type QuoteWorkflowStatus = 
  | 'pending' | 'under_review' | 'quoted' | 'estimated' | 'approved' 
  | 'awaiting_payment' | 'paid' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type InvoiceWorkflowStatus =
  | 'draft' | 'pending_review' | 'sent' | 'viewed' | 'approved' 
  | 'payment_pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export type WorkflowStatus = QuoteWorkflowStatus | InvoiceWorkflowStatus;

interface StatusTransition {
  from: string;
  to: string;
  allowedRoles: ('admin' | 'customer' | 'system')[];
  requiredConditions?: () => Promise<boolean>;
}

const QUOTE_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'under_review', allowedRoles: ['admin', 'system'] },
  { from: 'under_review', to: 'quoted', allowedRoles: ['admin'] },
  { from: 'quoted', to: 'estimated', allowedRoles: ['admin'] },
  { from: 'estimated', to: 'approved', allowedRoles: ['customer', 'admin'] },
  { from: 'approved', to: 'awaiting_payment', allowedRoles: ['admin', 'system'] },
  { from: 'awaiting_payment', to: 'paid', allowedRoles: ['system'] },
  { from: 'paid', to: 'confirmed', allowedRoles: ['admin', 'system'] },
  { from: 'confirmed', to: 'completed', allowedRoles: ['admin', 'system'] },
  { from: '*', to: 'cancelled', allowedRoles: ['admin'] },
];

const INVOICE_TRANSITIONS: StatusTransition[] = [
  { from: 'draft', to: 'sent', allowedRoles: ['admin'] },
  { from: 'sent', to: 'viewed', allowedRoles: ['customer', 'system'] },
  { from: 'viewed', to: 'approved', allowedRoles: ['customer'] },
  { from: 'approved', to: 'payment_pending', allowedRoles: ['admin', 'system'] },
  { from: 'payment_pending', to: 'partially_paid', allowedRoles: ['system'] },
  { from: 'payment_pending', to: 'paid', allowedRoles: ['system'] },
  { from: 'partially_paid', to: 'paid', allowedRoles: ['system'] },
  { from: 'paid', to: 'overdue', allowedRoles: ['system'] },
  { from: '*', to: 'cancelled', allowedRoles: ['admin'] },
];

export class WorkflowStateManager {
  /**
   * Validate if a status transition is allowed
   */
  static isValidTransition(
    entityType: 'quote' | 'invoice',
    currentStatus: string,
    newStatus: string,
    role: 'admin' | 'customer' | 'system' = 'admin'
  ): boolean {
    const transitions = entityType === 'quote' ? QUOTE_TRANSITIONS : INVOICE_TRANSITIONS;
    
    return transitions.some(
      t => (t.from === currentStatus || t.from === '*') && 
           t.to === newStatus && 
           t.allowedRoles.includes(role)
    );
  }

  /**
   * Update quote workflow status with validation
   */
  static async updateQuoteStatus(
    quoteId: string,
    newStatus: WorkflowStatus,
    changedBy: string = 'admin',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current status
      const { data: quote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('workflow_status')
        .eq('id', quoteId)
        .single();

      if (fetchError) throw fetchError;

      const currentStatus = quote.workflow_status;

      // Validate transition
      if (!this.isValidTransition('quote', currentStatus, newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`
        };
      }

      // Update status
      const updateData: any = {
        workflow_status: newStatus,
        last_status_change: new Date().toISOString(),
        status_changed_by: changedBy
      };
      
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update(updateData)
        .eq('id', quoteId);

      if (updateError) throw updateError;

      // Log the change
      await this.logStatusChange({
        entityType: 'quote_requests',
        entityId: quoteId,
        previousStatus: currentStatus,
        newStatus,
        changedBy,
        changeReason: reason
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating quote status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update invoice workflow status with validation
   */
  static async updateInvoiceStatus(
    invoiceId: string,
    newStatus: WorkflowStatus,
    changedBy: string = 'admin',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('workflow_status')
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      const currentStatus = invoice.workflow_status;

      // Validate transition
      if (!this.isValidTransition('invoice', currentStatus, newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`
        };
      }

      // Update status
      const updateData: any = {
        workflow_status: newStatus,
        last_status_change: new Date().toISOString(),
        status_changed_by: changedBy
      };
      
      const { error: updateError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      // Log the change
      await this.logStatusChange({
        entityType: 'invoices',
        entityId: invoiceId,
        previousStatus: currentStatus,
        newStatus,
        changedBy,
        changeReason: reason
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating invoice status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log status changes
   */
  private static async logStatusChange(params: {
    entityType: string;
    entityId: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    changeReason?: string;
  }) {
    try {
      await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: params.entityType,
          entity_id: params.entityId,
          previous_status: params.previousStatus,
          new_status: params.newStatus,
          changed_by: params.changedBy,
          change_reason: params.changeReason
        });
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  }

  /**
   * Get next available statuses for a quote
   */
  static getNextQuoteStatuses(currentStatus: WorkflowStatus): WorkflowStatus[] {
    return QUOTE_TRANSITIONS
      .filter(t => t.from === currentStatus || t.from === '*')
      .map(t => t.to as WorkflowStatus);
  }

  /**
   * Get next available statuses for an invoice
   */
  static getNextInvoiceStatuses(currentStatus: WorkflowStatus): WorkflowStatus[] {
    return INVOICE_TRANSITIONS
      .filter(t => t.from === currentStatus || t.from === '*')
      .map(t => t.to as WorkflowStatus);
  }
  
  /**
   * Get customer-friendly label for any status
   */
  static getStatusLabel(status: string): string {
    // This calls the database function we just created
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}
