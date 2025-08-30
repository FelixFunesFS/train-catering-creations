import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
  Send,
  CreditCard,
  Star,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface EnhancedQuoteWorkflowProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function EnhancedQuoteWorkflow({ quote, invoice, onRefresh }: EnhancedQuoteWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getWorkflowSteps = () => {
    const steps = [
      { 
        id: 'pending', 
        title: 'Quote Submitted', 
        status: 'completed', 
        description: 'Customer submitted quote request'
      },
      { 
        id: 'under_review', 
        title: 'Under Review', 
        status: quote?.workflow_status === 'pending' ? 'current' : getStepStatus('under_review'),
        description: 'Admin reviewing quote details'
      },
      { 
        id: 'quoted', 
        title: 'Estimate Created', 
        status: getStepStatus('quoted'),
        description: 'Pricing calculated and estimate generated'
      },
      { 
        id: 'sent', 
        title: 'Quote Sent', 
        status: getStepStatus('sent'),
        description: 'Quote sent to customer for approval'
      },
      { 
        id: 'approved', 
        title: 'Customer Approved', 
        status: getStepStatus('approved'),
        description: 'Customer approved the quote'
      },
      { 
        id: 'confirmed', 
        title: 'Event Confirmed', 
        status: getStepStatus('confirmed'),
        description: 'Event details finalized and ready for execution'
      }
    ];

    return steps;
  };

  const getStepStatus = (stepId: string) => {
    const currentStep = quote?.workflow_status || 'pending';
    const stepOrder = ['pending', 'under_review', 'quoted', 'sent', 'approved', 'confirmed', 'in_progress', 'completed'];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getNextAction = () => {
    const currentStatus = quote?.workflow_status || quote?.status || 'pending';
    
    switch (currentStatus) {
      case 'pending':
        return {
          action: 'mark_reviewed',
          title: 'Mark as Reviewed',
          description: 'Mark this quote as reviewed to proceed with estimation',
          icon: CheckCircle,
          variant: 'default' as const,
          canExecute: true
        };
      case 'under_review':
        return {
          action: 'create_estimate',
          title: 'Create Estimate',
          description: 'Generate pricing estimate for this quote',
          icon: FileText,
          variant: 'default' as const,
          canExecute: validateQuoteForEstimate()
        };
      case 'quoted':
        return {
          action: 'send_quote',
          title: 'Send Quote to Customer',
          description: 'Email the quote to customer for approval',
          icon: Send,
          variant: 'default' as const,
          canExecute: quote?.estimated_total > 0
        };
      case 'sent':
        return {
          action: 'await_approval',
          title: 'Awaiting Customer Approval',
          description: 'Waiting for customer to approve the quote',
          icon: Clock,
          variant: 'outline' as const,
          canExecute: false
        };
      case 'approved':
        return {
          action: 'confirm_event',
          title: 'Confirm Event Details',
          description: 'Finalize event logistics and generate invoice',
          icon: Star,
          variant: 'default' as const,
          canExecute: true
        };
      default:
        return null;
    }
  };

  const validateQuoteForEstimate = () => {
    return quote?.guest_count > 0 && quote?.event_date && quote?.service_type;
  };

  const handleWorkflowAction = async (action: string) => {
    if (!action || action === 'await_approval') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('update-quote-workflow', {
        body: { 
          quote_id: quote.id,
          action: action,
          user_id: 'admin'
        }
      });

      if (functionError) throw functionError;
      
      const actionMessages = {
        'mark_reviewed': 'Quote has been marked as reviewed',
        'create_estimate': 'Pricing estimate has been generated successfully',
        'send_quote': 'Quote has been sent to customer via email',
        'confirm_event': 'Event details have been confirmed'
      };
      
      toast({
        title: "Success",
        description: actionMessages[action as keyof typeof actionMessages] || "Action completed successfully",
      });
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Workflow action error:', error);
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

  const steps = getWorkflowSteps();
  const nextAction = getNextAction();
  const currentStepIndex = steps.findIndex(step => step.status === 'current');
  const progress = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Admin Workflow Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Workflow Progress</span>
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
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className="pt-4 border-t">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Next Action Required</h4>
                <p className="text-sm text-muted-foreground">{nextAction.description}</p>
              </div>
              
              {!nextAction.canExecute && nextAction.action !== 'await_approval' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please ensure all required fields are completed before proceeding.
                  </AlertDescription>
                </Alert>
              )}
              
              {nextAction.action !== 'await_approval' && (
                <Button
                  onClick={() => handleWorkflowAction(nextAction.action)}
                  disabled={loading || !nextAction.canExecute}
                  variant={nextAction.variant}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <nextAction.icon className="h-4 w-4 mr-2" />
                  )}
                  {nextAction.title}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status and Info */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <StatusBadge status={quote?.workflow_status || quote?.status || 'pending'} />
          </div>
          
          {quote?.estimated_total && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimated Total:</span>
              <span className="text-sm font-semibold text-green-600">
                ${(quote.estimated_total / 100).toFixed(2)}
              </span>
            </div>
          )}
          
          {invoice && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invoice Status:</span>
              <StatusBadge status={invoice.status} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}