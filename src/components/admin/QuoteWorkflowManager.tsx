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
  FileText,
  Send,
  CreditCard,
  Star
} from 'lucide-react';

interface QuoteWorkflowManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function QuoteWorkflowManager({ quote, invoice, onRefresh }: QuoteWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
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
        status: quote?.workflow_status === 'pending' ? 'current' : 'completed',
        description: 'Admin reviewing quote details'
      },
      { 
        id: 'estimated', 
        title: 'Estimate Created', 
        status: getStepStatus('estimated'),
        description: 'Pricing calculated and estimate generated'
      },
      { 
        id: 'quoted', 
        title: 'Quote Sent', 
        status: getStepStatus('quoted'),
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
        description: 'Event details finalized'
      }
    ];

    return steps;
  };

  const getStepStatus = (stepId: string) => {
    const currentStep = quote?.workflow_status || 'pending';
    const stepOrder = ['pending', 'under_review', 'estimated', 'quoted', 'approved', 'confirmed', 'in_progress', 'completed'];
    
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
          variant: 'default' as const
        };
      case 'under_review':
        return {
          action: 'create_estimate',
          title: 'Create Estimate',
          description: 'Generate pricing estimate for this quote',
          icon: FileText,
          variant: 'default' as const
        };
      case 'estimated':
        return {
          action: 'send_quote',
          title: 'Send Quote to Customer',
          description: 'Email the quote to customer for approval',
          icon: Send,
          variant: 'default' as const
        };
      case 'quoted':
        return {
          action: 'await_approval',
          title: 'Awaiting Customer Approval',
          description: 'Waiting for customer to approve the quote',
          icon: Clock,
          variant: 'outline' as const
        };
      case 'approved':
        return {
          action: 'confirm_event',
          title: 'Confirm Event Details',
          description: 'Finalize event logistics and generate invoice',
          icon: Star,
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
        case 'mark_reviewed':
          await supabase
            .from('quote_requests')
            .update({ 
              workflow_status: 'under_review',
              status_changed_by: 'admin'
            })
            .eq('id', quote.id);
          
          toast({
            title: "Quote Reviewed",
            description: "Quote has been marked as reviewed",
          });
          break;

        case 'create_estimate':
          await supabase.functions.invoke('generate-estimate', {
            body: { quote_request_id: quote.id }
          });
          
          toast({
            title: "Estimate Created",
            description: "Pricing estimate has been generated",
          });
          break;

        case 'send_quote':
          await supabase.functions.invoke('send-quote-email', {
            body: { quote_request_id: quote.id }
          });
          
          toast({
            title: "Quote Sent",
            description: "Quote has been sent to customer",
          });
          break;

        case 'confirm_event':
          await supabase
            .from('quote_requests')
            .update({ 
              workflow_status: 'confirmed',
              status_changed_by: 'admin'
            })
            .eq('id', quote.id);
          
          toast({
            title: "Event Confirmed",
            description: "Event details have been confirmed",
          });
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
          <ArrowRight className="h-5 w-5" />
          Quote Workflow Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
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

        {/* Next Action */}
        {nextAction && nextAction.action !== 'await_approval' && (
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
            <StatusBadge status={quote?.workflow_status || quote?.status || 'pending'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}