import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { WorkflowStepsDisplay } from './WorkflowStepsDisplay';
import { NextStepsGuidance } from './NextStepsGuidance';
import { CustomerApprovalTracker } from './CustomerApprovalTracker';
import { InvoiceWorkflowManager } from './InvoiceWorkflowManager';
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
  DollarSign,
  Calendar,
  Settings,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface WorkflowPhaseManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function WorkflowPhaseManager({ quote, invoice, onRefresh }: WorkflowPhaseManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

  // Determine current phase based on quote status
  const getCurrentPhase = (): 'quote' | 'transition' | 'invoice' => {
    const status = quote?.workflow_status || quote?.status || 'pending';
    
    // Pre-approval: Quote phase only
    if (['pending', 'under_review', 'estimated', 'sent'].includes(status)) {
      return 'quote';
    }
    
    // Customer approved but not yet confirmed: Transition phase
    if (status === 'approved') {
      return 'transition';
    }
    
    // Post-approval: Invoice phase
    if (['confirmed', 'in_progress', 'completed'].includes(status)) {
      return 'invoice';
    }
    
    return 'quote';
  };

  const getQuoteWorkflowSteps = () => {
    return [
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
        title: 'Customer Decision', 
        status: getStepStatus('approved'),
        description: 'Waiting for customer approval response'
      }
    ];
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

  const getQuoteNextAction = () => {
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

  const currentPhase = getCurrentPhase();
  const quoteSteps = getQuoteWorkflowSteps();
  const quoteNextAction = getQuoteNextAction();
  const currentStepIndex = quoteSteps.findIndex(step => step.status === 'current');
  const quoteProgress = currentStepIndex >= 0 ? (currentStepIndex / (quoteSteps.length - 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Phase Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Workflow Management
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
        <CardContent>
          {/* Breadcrumb-style Phase Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={currentPhase === 'quote' ? 'default' : 'outline'}>
              Quote Phase
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentPhase === 'transition' ? 'default' : currentPhase === 'invoice' ? 'default' : 'outline'}>
              Customer Decision
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentPhase === 'invoice' ? 'default' : 'outline'}>
              Event Execution
            </Badge>
          </div>

          {/* Phase-specific Content */}
          {currentPhase === 'quote' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quote Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(quoteProgress)}%</span>
              </div>
              <Progress value={quoteProgress} className="h-2" />
              
              {showHelp && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  You're in the Quote Phase. Complete all quote steps before customer approval to proceed to event execution.
                </div>
              )}
            </div>
          )}

          {currentPhase === 'transition' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-100">Customer Approved!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Ready to proceed with event execution planning</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditional Workflow Display */}
      {currentPhase === 'quote' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WorkflowStepsDisplay steps={quoteSteps} />
            
            {quote?.estimated_total && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Estimated Total:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${(quote.estimated_total / 100).toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentPhase === 'transition' && (
        <CustomerApprovalTracker 
          quote={quote}
          onConfirm={() => handleWorkflowAction('confirm_event')}
          loading={loading}
        />
      )}

      {currentPhase === 'invoice' && (
        <InvoiceWorkflowManager 
          quote={quote}
          invoice={invoice}
          onRefresh={onRefresh}
        />
      )}

      {/* Next Steps - Only for Quote Phase */}
      {currentPhase === 'quote' && (
        <NextStepsGuidance
          nextAction={quoteNextAction}
          loading={loading}
          error={error}
          onExecuteAction={handleWorkflowAction}
          onRetry={handleRetry}
          showHelp={showHelp}
        />
      )}
    </div>
  );
}