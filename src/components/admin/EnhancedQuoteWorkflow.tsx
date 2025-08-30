import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { WorkflowStepsDisplay } from './WorkflowStepsDisplay';
import { NextStepsGuidance } from './NextStepsGuidance';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Send,
  Star,
  Eye,
  Settings
} from 'lucide-react';

interface EnhancedQuoteWorkflowProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function EnhancedQuoteWorkflow({ quote, invoice, onRefresh }: EnhancedQuoteWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

  const getWorkflowSteps = () => {
    const steps = [
      { 
        id: 'pending', 
        title: 'Quote Submitted', 
        status: 'completed' as const, 
        description: 'Customer submitted quote request'
      },
      { 
        id: 'under_review', 
        title: 'Under Review', 
        status: quote?.workflow_status === 'pending' ? 'current' as const : getStepStatus('under_review'),
        description: 'Admin reviewing quote details'
      },
      { 
        id: 'estimated', 
        title: 'Estimate Created', 
        status: getStepStatus('estimated'),
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

  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const currentStep = quote?.workflow_status || 'pending';
    const stepOrder = ['pending', 'under_review', 'estimated', 'sent', 'approved', 'confirmed', 'in_progress', 'completed'];
    
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
          canExecute: true,
          requirements: ['Quote details have been reviewed'],
          helpText: 'This step confirms that an admin has reviewed the quote request details.'
        };
      case 'under_review':
        return {
          action: 'create_estimate',
          title: 'Create Estimate',
          description: 'Generate pricing estimate for this quote',
          icon: FileText,
          variant: 'default' as const,
          canExecute: validateQuoteForEstimate(),
          requirements: [
            'Guest count must be specified',
            'Event date must be set',
            'Service type must be selected'
          ],
          helpText: 'This will calculate pricing and create a draft invoice for the quote.'
        };
      case 'estimated':
        return {
          action: 'send_quote',
          title: 'Send Quote to Customer',
          description: 'Email the quote to customer for approval',
          icon: Send,
          variant: 'default' as const,
          canExecute: quote?.estimated_total > 0,
          requirements: ['Estimated total must be calculated'],
          helpText: 'This will send the quote details and pricing to the customer via email.'
        };
      case 'sent':
        return {
          action: 'await_approval',
          title: 'Awaiting Customer Approval',
          description: 'Waiting for customer to approve the quote',
          icon: Clock,
          variant: 'outline' as const,
          canExecute: false,
          helpText: 'No action needed. Customer will respond via their portal or direct communication.'
        };
      case 'approved':
        return {
          action: 'confirm_event',
          title: 'Confirm Event Details',
          description: 'Finalize event logistics and generate invoice',
          icon: Star,
          variant: 'default' as const,
          canExecute: true,
          requirements: ['Customer has approved the quote'],
          helpText: 'This finalizes all event details and creates the official invoice.'
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
    <div className="space-y-6">
      {/* Main Workflow Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Admin Workflow Manager
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              <StatusBadge status={quote?.workflow_status || quote?.status || 'pending'} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Workflow Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Workflow Steps */}
          <WorkflowStepsDisplay 
            steps={steps}
            showHidden={showAllSteps}
            onToggleHidden={() => setShowAllSteps(!showAllSteps)}
          />

          {/* Status and Info */}
          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <NextStepsGuidance
        nextAction={nextAction}
        loading={loading}
        error={error}
        onExecuteAction={handleWorkflowAction}
        onRetry={handleRetry}
        showHelp={showHelp}
      />
    </div>
  );
}