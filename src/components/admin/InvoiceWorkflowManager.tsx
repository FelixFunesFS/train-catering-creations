import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Send,
  Eye,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface InvoiceWorkflowManagerProps {
  invoice: any;
  onRefresh?: () => void;
}

export function InvoiceWorkflowManager({ invoice, onRefresh }: InvoiceWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getWorkflowSteps = () => {
    const steps = [
      { 
        id: 'draft', 
        title: 'Invoice Created', 
        status: 'completed',
        description: 'Invoice generated from approved quote'
      },
      { 
        id: 'pending_review', 
        title: 'Pending Review', 
        status: getStepStatus('pending_review'),
        description: 'Invoice details under review'
      },
      { 
        id: 'sent', 
        title: 'Sent to Customer', 
        status: getStepStatus('sent'),
        description: 'Invoice emailed to customer'
      },
      { 
        id: 'viewed', 
        title: 'Customer Viewed', 
        status: getStepStatus('viewed'),
        description: 'Customer opened the invoice'
      },
      { 
        id: 'approved', 
        title: 'Customer Approved', 
        status: getStepStatus('approved'),
        description: 'Customer approved invoice for payment'
      },
      { 
        id: 'paid', 
        title: 'Payment Received', 
        status: getStepStatus('paid'),
        description: 'Payment successfully processed'
      }
    ];

    return steps;
  };

  const getStepStatus = (stepId: string) => {
    const currentStep = invoice?.workflow_status || invoice?.status || 'draft';
    const stepOrder = ['draft', 'pending_review', 'sent', 'viewed', 'approved', 'paid'];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getNextAction = () => {
    const currentStatus = invoice?.workflow_status || invoice?.status || 'draft';
    
    switch (currentStatus) {
      case 'draft':
        return {
          action: 'finalize_invoice',
          title: 'Finalize Invoice',
          description: 'Review and finalize invoice for sending',
          icon: CheckCircle,
          variant: 'default' as const
        };
      case 'pending_review':
        return {
          action: 'send_invoice',
          title: 'Send to Customer',
          description: 'Email invoice to customer',
          icon: Send,
          variant: 'default' as const
        };
      case 'sent':
        return {
          action: 'check_status',
          title: 'Check Status',
          description: 'Wait for customer to view invoice',
          icon: Eye,
          variant: 'outline' as const
        };
      case 'viewed':
        return {
          action: 'follow_up',
          title: 'Follow Up',
          description: 'Send reminder about payment',
          icon: Send,
          variant: 'outline' as const
        };
      case 'approved':
        return {
          action: 'create_payment_link',
          title: 'Create Payment Link',
          description: 'Generate secure payment link',
          icon: CreditCard,
          variant: 'default' as const
        };
      default:
        return null;
    }
  };

  const handleWorkflowAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'finalize_invoice':
          await supabase
            .from('invoices')
            .update({ 
              workflow_status: 'pending_review',
              status_changed_by: 'admin',
              is_draft: false
            })
            .eq('id', invoice.id);
          
          toast({
            title: "Invoice Finalized",
            description: "Invoice is ready for sending",
          });
          break;

        case 'send_invoice':
          await supabase.functions.invoke('send-invoice-email', {
            body: { invoice_id: invoice.id }
          });
          
          toast({
            title: "Invoice Sent",
            description: "Invoice has been sent to customer",
          });
          break;

        case 'follow_up':
          await supabase.functions.invoke('send-invoice-reminder', {
            body: { invoice_id: invoice.id }
          });
          
          toast({
            title: "Reminder Sent",
            description: "Payment reminder sent to customer",
          });
          break;

        case 'create_payment_link':
          const { data } = await supabase.functions.invoke('create-payment-link', {
            body: { 
              invoice_id: invoice.id,
              amount: invoice.total_amount 
            }
          });
          
          if (data?.url) {
            navigator.clipboard.writeText(data.url);
            toast({
              title: "Payment Link Created",
              description: "Link copied to clipboard",
            });
          }
          break;
      }
      
      onRefresh?.();
    } catch (error) {
      console.error('Workflow action error:', error);
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = getWorkflowSteps();
  const nextAction = getNextAction();
  const currentStepIndex = steps.findIndex(step => step.status === 'current');
  const progress = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Invoice Workflow Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step.status === 'completed' 
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : step.status === 'current'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : step.status === 'current' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${
                    step.status === 'current' ? 'text-blue-700' : ''
                  }`}>
                    {step.title}
                  </h4>
                  {step.status === 'current' && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        {invoice && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="font-semibold">
                  ${((invoice.total_amount || 0) / 100).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date:</span>
                <div className="font-semibold">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Action */}
        {nextAction && nextAction.action !== 'check_status' && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Next Action</h4>
                <p className="text-sm text-muted-foreground">{nextAction.description}</p>
              </div>
              <Button
                onClick={() => handleWorkflowAction(nextAction.action)}
                disabled={loading}
                variant={nextAction.variant}
                size="sm"
              >
                <nextAction.icon className="h-4 w-4 mr-2" />
                {nextAction.title}
              </Button>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <StatusBadge status={invoice?.workflow_status || invoice?.status || 'draft'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}