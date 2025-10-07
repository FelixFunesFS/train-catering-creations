import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Eye, 
  DollarSign, 
  FileText, 
  ArrowRight,
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatusStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
  timestamp?: string;
}

interface InvoiceStatusManagerProps {
  quote: any;
  invoice?: any;
  customer?: any;
  onUpdateStatus: (newStatus: string) => Promise<void>;
  onSendInvoice?: (invoiceId: string) => Promise<void>;
  onGenerateInvoice?: () => Promise<void>;
  loading?: boolean;
}

export function InvoiceStatusManager({
  quote,
  invoice,
  customer,
  onUpdateStatus,
  onSendInvoice,
  onGenerateInvoice,
  loading = false
}: InvoiceStatusManagerProps) {
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Determine current workflow step
  const getCurrentStep = (): number => {
    if (!customer) return 0;
    if (!invoice) return 1;
    if (invoice.status === 'draft') return 2;
    if (invoice.status === 'sent') return 3;
    if (invoice.status === 'paid') return 4;
    return 1;
  };

  const currentStep = getCurrentStep();
  const progressPercentage = (currentStep / 4) * 100;

  const steps: StatusStep[] = [
    {
      id: 'customer',
      label: 'Customer Setup',
      description: 'Create Stripe customer record',
      status: customer ? 'completed' : 'current',
      icon: <CheckCircle2 className="h-4 w-4" />,
      timestamp: customer?.created_at
    },
    {
      id: 'draft',
      label: 'Generate Invoice',
      description: 'Create invoice from quote data',
      status: invoice ? 'completed' : customer ? 'current' : 'pending',
      icon: <FileText className="h-4 w-4" />,
      timestamp: invoice?.created_at
    },
    {
      id: 'pricing',
      label: 'Set Pricing',
      description: 'Review and finalize pricing',
      status: invoice?.status === 'draft' ? 'current' : invoice ? 'completed' : 'pending',
      icon: <DollarSign className="h-4 w-4" />,
      timestamp: invoice?.updated_at
    },
    {
      id: 'sent',
      label: 'Send Invoice',
      description: 'Email invoice to customer',
      status: invoice?.status === 'sent' || invoice?.status === 'paid' ? 'completed' : 
             invoice?.status === 'draft' ? 'current' : 'pending',
      icon: <Send className="h-4 w-4" />,
      timestamp: invoice?.sent_at
    },
    {
      id: 'paid',
      label: 'Payment',
      description: 'Customer completes payment',
      status: invoice?.status === 'paid' ? 'completed' : 
             invoice?.status === 'sent' ? 'current' : 'pending',
      icon: <DollarSign className="h-4 w-4" />,
      timestamp: invoice?.paid_at
    }
  ];

  const handleAction = async (actionKey: string, action: () => Promise<void>) => {
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionKey}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionKey.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'current':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getNextAction = () => {
    if (!customer) {
      return {
        label: 'Create Customer',
        action: () => handleAction('createCustomer', async () => {
          // This would call the parent component's customer creation function
          toast({ title: "Customer creation not implemented", variant: "destructive" });
        }),
        variant: 'default' as const
      };
    }
    
    if (!invoice) {
      return {
        label: 'Generate Invoice',
        action: () => handleAction('generateInvoice', async () => {
          if (onGenerateInvoice) await onGenerateInvoice();
        }),
        variant: 'default' as const
      };
    }
    
    if (invoice.status === 'draft') {
      return {
        label: 'Send Invoice',
        action: () => handleAction('sendInvoice', async () => {
          if (onSendInvoice && invoice.id) await onSendInvoice(invoice.id);
        }),
        variant: 'default' as const
      };
    }
    
    return null;
  };

  const nextAction = getNextAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoice Workflow</span>
          <Badge variant="outline" className="text-xs">
            Step {currentStep + 1} of 5
          </Badge>
        </CardTitle>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status Alert */}
        {invoice?.workflow_status === 'draft' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Invoice created but pricing not finalized. Review line items and pricing before sending.
            </AlertDescription>
          </Alert>
        )}
        
        {quote.workflow_status === 'pending' && !invoice && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Quote is ready for invoicing. Generate an invoice to begin the billing process.
            </AlertDescription>
          </Alert>
        )}

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${step.status === 'completed' ? 'bg-success border-success text-success-foreground' :
                  step.status === 'current' ? 'bg-primary border-primary text-primary-foreground' :
                  'bg-background border-muted-foreground/30'}`}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.status === 'current' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${getStepColor(step.status)}`}>
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 w-6 flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {nextAction && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Next Step</h4>
                <p className="text-sm text-muted-foreground">
                  {nextAction.label} to continue the workflow
                </p>
              </div>
              <Button 
                onClick={nextAction.action}
                disabled={loading || Object.values(actionLoading).some(Boolean)}
                variant={nextAction.variant}
              >
                {Object.values(actionLoading).some(Boolean) ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                {nextAction.label}
              </Button>
            </div>
          </>
        )}

        {/* Invoice Details */}
        {invoice && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Invoice Number</label>
                <p className="font-medium">{invoice.invoice_number || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Total Amount</label>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(invoice.total_amount / 100)}
                </p>
              </div>
              {invoice.due_date && (
                <div>
                  <label className="text-muted-foreground">Due Date</label>
                  <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="text-muted-foreground">Status</label>
                <Badge variant="outline" className="mt-1">
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}