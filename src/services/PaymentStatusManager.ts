/**
 * PaymentStatusManager - Centralized payment state machine
 * Single source of truth for payment status management
 * 
 * Status Flow:
 * draft → sent → approved → paid
 *              ↓
 *           overdue (if past due_date)
 */

import { supabase } from '@/integrations/supabase/client';

export type InvoiceWorkflowStatus = 
  | 'draft'
  | 'sent'
  | 'approved'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'pending_review';

interface PaymentStatusUpdate {
  invoice_id: string;
  new_status: InvoiceWorkflowStatus;
  changed_by: string;
  change_reason?: string;
  metadata?: any;
}

interface PaymentMilestoneStatus {
  milestone_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class PaymentStatusManager {
  /**
   * Get current payment status with validation
   */
  async getCurrentStatus(invoiceId: string): Promise<InvoiceWorkflowStatus | null> {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('workflow_status')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      console.error('Error fetching invoice status:', error);
      return null;
    }

    return invoice.workflow_status as InvoiceWorkflowStatus;
  }

  /**
   * Update invoice workflow status with validation
   */
  async updateStatus(update: PaymentStatusUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const currentStatus = await this.getCurrentStatus(update.invoice_id);
      
      if (!currentStatus) {
        return { success: false, error: 'Invoice not found' };
      }

      // Validate status transition
      const isValidTransition = this.isValidTransition(currentStatus, update.new_status);
      if (!isValidTransition) {
        return { 
          success: false, 
          error: `Invalid status transition: ${currentStatus} → ${update.new_status}` 
        };
      }

      // Update invoice status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          workflow_status: update.new_status,
          status_changed_by: update.changed_by,
          last_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', update.invoice_id);

      if (updateError) throw updateError;

      // Log status change
      await this.logStatusChange(
        update.invoice_id,
        currentStatus,
        update.new_status,
        update.changed_by,
        update.change_reason,
        update.metadata
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Validate status transition rules
   */
  private isValidTransition(from: InvoiceWorkflowStatus, to: InvoiceWorkflowStatus): boolean {
    const validTransitions: Record<InvoiceWorkflowStatus, InvoiceWorkflowStatus[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['approved', 'pending_review', 'overdue', 'cancelled'],
      pending_review: ['sent', 'approved', 'cancelled'],
      approved: ['paid', 'overdue', 'cancelled'],
      paid: ['cancelled'], // Can only cancel paid invoices
      overdue: ['paid', 'cancelled'],
      cancelled: [] // Terminal state
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Update payment milestone status
   */
  async updateMilestoneStatus(
    update: PaymentMilestoneStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('payment_milestones')
        .update({
          status: update.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.milestone_id);

      if (error) throw error;

      // If milestone completed, check if all milestones are complete
      if (update.status === 'completed') {
        await this.checkAndUpdateInvoicePaymentStatus(update.milestone_id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating milestone status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Check if all milestones are paid and update invoice accordingly
   */
  private async checkAndUpdateInvoicePaymentStatus(milestoneId: string): Promise<void> {
    // Get invoice from milestone
    const { data: milestone } = await supabase
      .from('payment_milestones')
      .select('invoice_id')
      .eq('id', milestoneId)
      .single();

    if (!milestone) return;

    // Get all milestones for this invoice
    const { data: allMilestones } = await supabase
      .from('payment_milestones')
      .select('status')
      .eq('invoice_id', milestone.invoice_id);

    if (!allMilestones) return;

    // Check if all milestones are completed
    const allCompleted = allMilestones.every(m => m.status === 'completed');

    if (allCompleted) {
      await this.updateStatus({
        invoice_id: milestone.invoice_id,
        new_status: 'paid',
        changed_by: 'system',
        change_reason: 'All payment milestones completed'
      });
    }
  }

  /**
   * Get payment progress for an invoice
   */
  async getPaymentProgress(invoiceId: string): Promise<{
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    percentage_paid: number;
  } | null> {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

      if (!invoice) return null;

      const { data: milestones } = await supabase
        .from('payment_milestones')
        .select('amount_cents, status')
        .eq('invoice_id', invoiceId);

      if (!milestones) return null;

      const paid_amount = milestones
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.amount_cents, 0);

      const pending_amount = invoice.total_amount - paid_amount;
      const percentage_paid = (paid_amount / invoice.total_amount) * 100;

      return {
        total_amount: invoice.total_amount,
        paid_amount,
        pending_amount,
        percentage_paid
      };
    } catch (error) {
      console.error('Error getting payment progress:', error);
      return null;
    }
  }

  /**
   * Mark invoice as overdue if past due date
   */
  async checkAndMarkOverdue(invoiceId: string): Promise<{ success: boolean }> {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('workflow_status, due_date')
        .eq('id', invoiceId)
        .single();

      if (!invoice || !invoice.due_date) {
        return { success: false };
      }

      const isPastDue = new Date(invoice.due_date) < new Date();
      const isUnpaid = ['sent', 'approved'].includes(invoice.workflow_status);

      if (isPastDue && isUnpaid) {
        await this.updateStatus({
          invoice_id: invoiceId,
          new_status: 'overdue',
          changed_by: 'system',
          change_reason: 'Payment past due date'
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error checking overdue status:', error);
      return { success: false };
    }
  }

  /**
   * Log status change to workflow_state_log
   */
  private async logStatusChange(
    invoiceId: string,
    previousStatus: InvoiceWorkflowStatus,
    newStatus: InvoiceWorkflowStatus,
    changedBy: string,
    changeReason?: string,
    metadata?: any
  ): Promise<void> {
    await supabase.from('workflow_state_log').insert({
      entity_type: 'invoices',
      entity_id: invoiceId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      change_reason: changeReason || `Status updated: ${previousStatus} → ${newStatus}`,
      metadata: metadata || {}
    });
  }

  /**
   * Get status display information
   */
  getStatusInfo(status: InvoiceWorkflowStatus): {
    label: string;
    description: string;
    color: 'default' | 'secondary' | 'destructive' | 'outline';
  } {
    const statusMap = {
      draft: {
        label: 'Draft',
        description: 'Invoice is being prepared',
        color: 'outline' as const
      },
      sent: {
        label: 'Sent',
        description: 'Awaiting customer approval',
        color: 'secondary' as const
      },
      pending_review: {
        label: 'Under Review',
        description: 'Customer requested changes',
        color: 'secondary' as const
      },
      approved: {
        label: 'Approved',
        description: 'Awaiting payment',
        color: 'default' as const
      },
      paid: {
        label: 'Paid',
        description: 'Payment completed',
        color: 'default' as const
      },
      overdue: {
        label: 'Overdue',
        description: 'Payment past due date',
        color: 'destructive' as const
      },
      cancelled: {
        label: 'Cancelled',
        description: 'Invoice cancelled',
        color: 'outline' as const
      }
    };

    return statusMap[status] || statusMap.draft;
  }
}
