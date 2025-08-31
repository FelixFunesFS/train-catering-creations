import { supabase } from '@/integrations/supabase/client';

export interface EstimateAction {
  id: string;
  label: string;
  icon: string;
  variant: 'default' | 'outline' | 'secondary' | 'destructive';
  isPrimary?: boolean;
  requiresConfirmation?: boolean;
}

export class EstimateActionService {
  static getAvailableActions(status: string): EstimateAction[] {
    const actionMap: Record<string, EstimateAction[]> = {
      draft: [
        { id: 'send', label: 'Send to Customer', icon: 'Send', variant: 'default', isPrimary: true },
        { id: 'preview', label: 'Preview', icon: 'Eye', variant: 'outline' },
        { id: 'edit', label: 'Edit', icon: 'Edit', variant: 'outline' },
      ],
      sent: [
        { id: 'follow-up', label: 'Follow Up', icon: 'MessageCircle', variant: 'default', isPrimary: true },
        { id: 'preview', label: 'Preview', icon: 'Eye', variant: 'outline' },
        { id: 'resend', label: 'Resend', icon: 'RefreshCw', variant: 'outline' },
        { id: 'edit', label: 'Edit', icon: 'Edit', variant: 'outline' },
      ],
      viewed: [
        { id: 'follow-up', label: 'Follow Up', icon: 'MessageCircle', variant: 'default', isPrimary: true },
        { id: 'generate-contract', label: 'Generate Contract', icon: 'FileCheck', variant: 'secondary' },
        { id: 'payment-link', label: 'Create Payment Link', icon: 'CreditCard', variant: 'secondary' },
      ],
      approved: [
        { id: 'generate-contract', label: 'Generate Contract', icon: 'FileCheck', variant: 'default', isPrimary: true },
        { id: 'payment-link', label: 'Create Payment Link', icon: 'CreditCard', variant: 'secondary' },
        { id: 'start-planning', label: 'Start Event Planning', icon: 'Calendar', variant: 'outline' },
      ],
      paid: [
        { id: 'start-planning', label: 'Start Event Planning', icon: 'Calendar', variant: 'default', isPrimary: true },
        { id: 'view-contract', label: 'View Contract', icon: 'FileText', variant: 'outline' },
      ],
    };

    return actionMap[status] || [];
  }

  static async executeAction(actionId: string, invoiceId: string, data?: any): Promise<{ success: boolean; message: string }> {
    try {
      switch (actionId) {
        case 'send':
          return await this.sendEstimate(invoiceId, data);
        case 'follow-up':
          return await this.sendFollowUp(invoiceId);
        case 'resend':
          return await this.resendEstimate(invoiceId);
        case 'generate-contract':
          return await this.generateContract(invoiceId);
        case 'payment-link':
          return await this.createPaymentLink(invoiceId);
        case 'start-planning':
          return await this.startPlanning(invoiceId);
        default:
          return { success: false, message: 'Unknown action' };
      }
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      return { success: false, message: 'Action failed' };
    }
  }

  private static async sendEstimate(invoiceId: string, emailData: any): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
      body: {
        invoice_id: invoiceId,
        custom_message: emailData?.message || '',
        subject: emailData?.subject || 'Your Estimate from Soul Train\'s Eatery'
      }
    });

    if (error) throw error;

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invoiceId);

    return { success: true, message: 'Estimate sent successfully' };
  }

  private static async sendFollowUp(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        invoice_id: invoiceId,
        template_type: 'follow_up'
      }
    });

    if (error) throw error;
    return { success: true, message: 'Follow-up email sent' };
  }

  private static async resendEstimate(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
      body: { invoice_id: invoiceId }
    });

    if (error) throw error;
    return { success: true, message: 'Estimate resent successfully' };
  }

  private static async generateContract(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'contract_generated' })
      .eq('id', invoiceId);

    if (error) throw error;
    return { success: true, message: 'Contract generated successfully' };
  }

  private static async createPaymentLink(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.functions.invoke('create-payment-link', {
      body: { invoice_id: invoiceId }
    });

    if (error) throw error;
    return { success: true, message: 'Payment link created' };
  }

  private static async startPlanning(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'planning' })
      .eq('id', invoiceId);

    if (error) throw error;
    return { success: true, message: 'Event planning started' };
  }

  static getStatusBadgeProps(status: string) {
    const statusMap: Record<string, { variant: any; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      sent: { variant: 'default', label: 'Sent' },
      viewed: { variant: 'outline', label: 'Viewed' },
      approved: { variant: 'default', label: 'Approved' },
      paid: { variant: 'default', label: 'Paid' },
      completed: { variant: 'default', label: 'Completed' },
    };

    return statusMap[status] || { variant: 'secondary', label: status };
  }
}