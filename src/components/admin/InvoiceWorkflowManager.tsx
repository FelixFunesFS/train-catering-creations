import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { WorkflowStepsDisplay } from './WorkflowStepsDisplay';
import { NextStepsGuidance } from './NextStepsGuidance';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Receipt,
  Send,
  Eye,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  ArrowRight
} from 'lucide-react';

interface InvoiceWorkflowManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function InvoiceWorkflowManager({ quote, invoice, onRefresh }: InvoiceWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getInvoiceWorkflowSteps = () => {
    return [
      { 
        id: 'confirmed', 
        title: 'Event Confirmed', 
        status: 'completed' as const, 
        description: 'Customer approved and event details confirmed'
      },
      { 
        id: 'draft', 
        title: 'Invoice Generated', 
        status: getInvoiceStepStatus('draft'),
        description: 'Official invoice created from approved quote'
      },
      { 
        id: 'sent', 
        title: 'Invoice Sent', 
        status: getInvoiceStepStatus('sent'),
        description: 'Invoice sent to customer for payment'
      },
      { 
        id: 'viewed', 
        title: 'Customer Viewed', 
        status: getInvoiceStepStatus('viewed'),
        description: 'Customer opened and viewed the invoice'
      },
      { 
        id: 'paid', 
        title: 'Payment Received', 
        status: getInvoiceStepStatus('paid'),
        description: 'Customer completed payment'
      },
      { 
        id: 'in_progress', 
        title: 'Event Execution', 
        status: getInvoiceStepStatus('in_progress'),
        description: 'Event preparation and execution phase'
      },
      { 
        id: 'completed', 
        title: 'Event Completed', 
        status: getInvoiceStepStatus('completed'),
        description: 'Event successfully completed'
      }
    ];
  };

  const getInvoiceStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const currentStep = invoice?.workflow_status || quote?.workflow_status || 'confirmed';
    const stepOrder = ['confirmed', 'draft', 'sent', 'viewed', 'paid', 'in_progress', 'completed'];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getInvoiceNextAction = () => {
    const currentStatus = invoice?.workflow_status || invoice?.status || 'draft';
    
    switch (currentStatus) {
      case 'draft':
        return {
          action: 'send_invoice',
          title: 'Send Invoice to Customer',
          description: 'Email the invoice to customer for payment',
          icon: Send,
          variant: 'default' as const,
          canExecute: true,
          requirements: ['Invoice has been reviewed and approved'],
          helpText: 'This will send the official invoice to the customer via email.'
        };
      case 'sent':
        return {
          action: 'await_payment',
          title: 'Awaiting Payment',
          description: 'Waiting for customer to complete payment',
          icon: Clock,
          variant: 'outline' as const,
          canExecute: false,
          helpText: 'Monitor payment status. Customer will be notified of payment options.'
        };
      case 'viewed':
        return {
          action: 'await_payment',
          title: 'Customer Viewed Invoice',
          description: 'Customer has seen the invoice, awaiting payment',
          icon: Eye,
          variant: 'outline' as const,
          canExecute: false,
          helpText: 'Customer has opened the invoice. Payment should be processed soon.'
        };
      case 'paid':
        return {
          action: 'start_preparation',
          title: 'Begin Event Preparation',
          description: 'Start event planning and preparation activities',
          icon: Calendar,
          variant: 'default' as const,
          canExecute: true,
          requirements: ['Payment has been received and confirmed'],
          helpText: 'This moves the event into active preparation phase.'
        };
      case 'in_progress':
        return {
          action: 'complete_event',
          title: 'Mark Event Complete',
          description: 'Finalize event completion and close workflow',
          icon: CheckCircle,
          variant: 'default' as const,
          canExecute: true,
          requirements: ['Event has been successfully executed'],
          helpText: 'This completes the entire workflow for this event.'
        };
      default:
        return null;
    }
  };

  const handleInvoiceAction = async (action: string) => {
    if (!action || ['await_payment', 'await_approval'].includes(action)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (action === 'send_invoice' && invoice?.id) {
        // Use the send-invoice edge function
        result = await supabase.functions.invoke('send-invoice', {
          body: { invoice_id: invoice.id }
        });
      } else {
        // Use the general workflow update function
        result = await supabase.functions.invoke('update-quote-workflow', {
          body: { 
            quote_id: quote.id,
            action: action,
            user_id: 'admin'
          }
        });
      }

      if (result.error) throw result.error;
      
      const actionMessages = {
        'send_invoice': 'Invoice has been sent to customer via email',
        'start_preparation': 'Event preparation phase has begun',
        'complete_event': 'Event has been marked as completed'
      };
      
      toast({
        title: "Success",
        description: actionMessages[action as keyof typeof actionMessages] || "Action completed successfully",
      });
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Invoice action error:', error);
      const errorMessage = error.message || 'Failed to complete action. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    onRefresh?.();
  };

  const invoiceSteps = getInvoiceWorkflowSteps();
  const invoiceNextAction = getInvoiceNextAction();
  const currentStepIndex = invoiceSteps.findIndex(step => step.status === 'current');
  const invoiceProgress = currentStepIndex >= 0 ? (currentStepIndex / (invoiceSteps.length - 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Invoice Workflow Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice & Event Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Event Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(invoiceProgress)}%</span>
            </div>
            <Progress value={invoiceProgress} className="h-2" />
          </div>

          {/* Workflow Steps */}
          <WorkflowStepsDisplay steps={invoiceSteps} />

          {/* Invoice Summary */}
          {invoice && (
            <div className="pt-4 border-t space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Invoice Total:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${(invoice.total_amount / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Invoice Status:</span>
                  <StatusBadge status={invoice.workflow_status || invoice.status} />
                </div>
                
                {invoice.sent_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sent Date:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(invoice.sent_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {invoice.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Paid Date:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(invoice.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps for Invoice Phase */}
      <NextStepsGuidance
        nextAction={invoiceNextAction}
        loading={loading}
        error={error}
        onExecuteAction={handleInvoiceAction}
        onRetry={handleRetry}
      />
    </div>
  );
}