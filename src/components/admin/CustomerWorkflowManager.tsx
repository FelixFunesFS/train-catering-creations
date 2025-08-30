import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Eye, 
  CreditCard, 
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface CustomerWorkflowManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function CustomerWorkflowManager({ quote, invoice, onRefresh }: CustomerWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getWorkflowStatus = () => {
    if (!quote) return { step: 0, status: 'unknown', nextAction: null };
    
    const steps = [
      { key: 'submitted', label: 'Quote Submitted', status: 'completed' },
      { key: 'reviewed', label: 'Under Review', status: quote.status === 'pending' ? 'active' : 'completed' },
      { key: 'estimated', label: 'Estimate Sent', status: invoice?.status === 'sent' ? 'completed' : quote.status === 'reviewed' ? 'active' : 'pending' },
      { key: 'approved', label: 'Estimate Approved', status: invoice?.status === 'approved' ? 'completed' : 'pending' },
      { key: 'paid', label: 'Payment Complete', status: invoice?.status === 'paid' ? 'completed' : 'pending' },
      { key: 'confirmed', label: 'Event Confirmed', status: quote.status === 'confirmed' ? 'completed' : 'pending' }
    ];

    let currentStep = 0;
    let nextAction = null;

    // Determine current step and next action
    if (quote.status === 'pending') {
      currentStep = 1;
      nextAction = { type: 'send_welcome', label: 'Send Welcome Email' };
    } else if (quote.status === 'reviewed' && !invoice) {
      currentStep = 2;
      nextAction = { type: 'create_invoice', label: 'Create Estimate' };
    } else if (invoice?.is_draft) {
      currentStep = 2;
      nextAction = { type: 'send_estimate', label: 'Send Estimate' };
    } else if (invoice?.status === 'sent') {
      currentStep = 3;
      nextAction = { type: 'send_reminder', label: 'Send Reminder' };
    } else if (invoice?.status === 'approved') {
      currentStep = 4;
      nextAction = { type: 'send_payment_reminder', label: 'Send Payment Reminder' };
    } else if (invoice?.status === 'paid') {
      currentStep = 5;
      nextAction = { type: 'confirm_event', label: 'Confirm Event' };
    }

    return { steps, currentStep, nextAction };
  };

  const handleAction = async (actionType: string) => {
    setLoading(true);
    try {
      switch (actionType) {
        case 'send_welcome':
          await supabase.functions.invoke('send-customer-portal-email', {
            body: { 
              quote_request_id: quote.id,
              type: 'welcome'
            }
          });
          toast({
            title: "Welcome Email Sent",
            description: "Customer has been sent portal access instructions",
          });
          break;

        case 'create_invoice':
          await supabase.functions.invoke('generate-invoice-from-quote', {
            body: { quote_request_id: quote.id }
          });
          toast({
            title: "Estimate Created",
            description: "Estimate has been generated and is ready to send",
          });
          break;

        case 'send_estimate':
          await supabase.functions.invoke('send-customer-portal-email', {
            body: { 
              quote_request_id: quote.id,
              type: 'estimate_ready'
            }
          });
          toast({
            title: "Estimate Email Sent",
            description: "Customer has been notified that their estimate is ready",
          });
          break;

        case 'send_reminder':
        case 'send_payment_reminder':
          await supabase.functions.invoke('send-customer-portal-email', {
            body: { 
              quote_request_id: quote.id,
              type: 'payment_reminder'
            }
          });
          toast({
            title: "Reminder Sent",
            description: "Customer has been sent a payment reminder",
          });
          break;

        case 'confirm_event':
          await supabase
            .from('quote_requests')
            .update({ status: 'confirmed' })
            .eq('id', quote.id);
          toast({
            title: "Event Confirmed",
            description: "Event has been marked as confirmed",
          });
          break;
      }
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = () => {
    const portalUrl = `/customer/portal?quote=${quote.id}&email=${encodeURIComponent(quote.email)}`;
    window.open(portalUrl, '_blank');
  };

  const { steps, currentStep, nextAction } = getWorkflowStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Customer Journey
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openCustomerPortal}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Portal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step.status === 'completed' ? 'bg-green-100 text-green-800' :
                  step.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-400'}
              `}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  step.status === 'completed' ? 'text-green-800' :
                  step.status === 'active' ? 'text-blue-800' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              <Badge variant={
                step.status === 'completed' ? 'default' :
                step.status === 'active' ? 'secondary' :
                'outline'
              }>
                {step.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Next Action</h4>
                <p className="text-sm text-muted-foreground">{nextAction.label}</p>
              </div>
              <Button
                onClick={() => handleAction(nextAction.type)}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {nextAction.label}
              </Button>
            </div>
          </div>
        )}

        {/* Customer Portal Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Customer Portal Access</h4>
              <p className="text-sm text-muted-foreground">
                Code: <span className="font-mono">{quote.id.substring(0, 8).toUpperCase()}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('send_welcome')}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Resend Access
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {invoice?.status === 'sent' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Estimate sent - waiting for customer approval
            </p>
          </div>
        )}

        {invoice?.status === 'approved' && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              Estimate approved - waiting for payment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}