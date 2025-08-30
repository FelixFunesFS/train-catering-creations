import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/admin/StatusBadge';
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
  AlertTriangle,
  Phone,
  Mail,
  Users,
  MapPin
} from 'lucide-react';

interface StreamlinedWorkflowManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function StreamlinedWorkflowManager({ quote, invoice, onRefresh }: StreamlinedWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine current phase and step
  const getCurrentPhase = (): 'quote' | 'approved' | 'execution' => {
    const status = quote?.workflow_status || 'pending';
    
    if (['pending', 'under_review', 'estimated', 'sent'].includes(status)) {
      return 'quote';
    }
    
    if (status === 'approved') {
      return 'approved';
    }
    
    return 'execution';
  };

  const getAllWorkflowSteps = () => {
    return [
      // Quote Phase
      { 
        id: 'pending', 
        title: 'Quote Received', 
        phase: 'quote',
        status: 'completed' as const, 
        description: 'Customer submitted catering request'
      },
      { 
        id: 'under_review', 
        title: 'Review & Planning', 
        phase: 'quote',
        status: getStepStatus('under_review'),
        description: 'Admin reviewing details and planning service'
      },
      { 
        id: 'estimated', 
        title: 'Pricing Complete', 
        phase: 'quote',
        status: getStepStatus('estimated'),
        description: 'Manual pricing and estimate created'
      },
      { 
        id: 'sent', 
        title: 'Quote Sent', 
        phase: 'quote',
        status: getStepStatus('sent'),
        description: 'Quote emailed to customer for approval'
      },
      
      // Approval Phase
      { 
        id: 'approved', 
        title: 'Customer Approved', 
        phase: 'approved',
        status: getStepStatus('approved'),
        description: 'Customer approved quote, ready to proceed'
      },
      
      // Execution Phase
      { 
        id: 'confirmed', 
        title: 'Event Confirmed', 
        phase: 'execution',
        status: getStepStatus('confirmed'),
        description: 'Event details confirmed, planning begins'
      },
      { 
        id: 'in_progress', 
        title: 'Preparation & Service', 
        phase: 'execution',
        status: getStepStatus('in_progress'),
        description: 'Active event preparation and execution'
      },
      { 
        id: 'completed', 
        title: 'Event Complete', 
        phase: 'execution',
        status: getStepStatus('completed'),
        description: 'Successful event completion'
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

  const getNextAction = () => {
    const currentStatus = quote?.workflow_status || 'pending';
    
    const actions = {
      'pending': {
        action: 'mark_reviewed',
        title: 'Begin Review',
        description: 'Start reviewing this catering request',
        icon: Eye,
        variant: 'default' as const,
        canExecute: true,
        requirements: ['Quote details ready for review'],
        timeEstimate: '10-15 minutes'
      },
      'under_review': {
        action: 'create_estimate',
        title: 'Create Pricing',
        description: 'Complete manual pricing for this event',
        icon: DollarSign,
        variant: 'default' as const,
        canExecute: validateForPricing(),
        requirements: [
          'Guest count confirmed',
          'Menu preferences reviewed',
          'Service requirements understood'
        ],
        timeEstimate: '20-30 minutes'
      },
      'estimated': {
        action: 'send_quote',
        title: 'Send Quote',
        description: 'Email quote to customer for approval',
        icon: Send,
        variant: 'default' as const,
        canExecute: quote?.estimated_total > 0,
        requirements: ['Pricing completed and reviewed'],
        timeEstimate: '2-3 minutes'
      },
      'sent': {
        action: 'await_approval',
        title: 'Awaiting Customer',
        description: 'Customer reviewing quote',
        icon: Clock,
        variant: 'outline' as const,
        canExecute: false,
        timeEstimate: '1-3 business days (typical)'
      },
      'approved': {
        action: 'confirm_event',
        title: 'Confirm Event',
        description: 'Confirm details and begin planning',
        icon: CheckCircle,
        variant: 'default' as const,
        canExecute: true,
        requirements: ['Customer approval confirmed'],
        timeEstimate: '5-10 minutes'
      },
      'confirmed': {
        action: 'start_preparation',
        title: 'Begin Preparation',
        description: 'Start event preparation activities',
        icon: Calendar,
        variant: 'default' as const,
        canExecute: true,
        requirements: ['Event confirmed and scheduled'],
        timeEstimate: 'Ongoing until event'
      },
      'in_progress': {
        action: 'complete_event',
        title: 'Complete Event',
        description: 'Mark event as successfully completed',
        icon: CheckCircle,
        variant: 'default' as const,
        canExecute: true,
        requirements: ['Event successfully executed'],
        timeEstimate: '2-3 minutes'
      }
    };

    return actions[currentStatus as keyof typeof actions] || null;
  };

  const validateForPricing = () => {
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
        'mark_reviewed': 'Quote review has begun',
        'create_estimate': 'Ready for manual pricing - please complete pricing tab',
        'send_quote': 'Quote sent to customer successfully',
        'confirm_event': 'Event confirmed, planning phase initiated',
        'start_preparation': 'Event preparation phase has begun',
        'complete_event': 'Event marked as completed successfully'
      };
      
      toast({
        title: "Success",
        description: actionMessages[action as keyof typeof actionMessages] || "Action completed",
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

  const handleManualApproval = async () => {
    await handleWorkflowAction('manual_approval');
  };

  const currentPhase = getCurrentPhase();
  const allSteps = getAllWorkflowSteps();
  const currentPhaseSteps = allSteps.filter(step => 
    currentPhase === 'quote' ? step.phase === 'quote' :
    currentPhase === 'approved' ? step.phase === 'approved' :
    step.phase === 'execution'
  );
  
  const nextAction = getNextAction();
  const currentStepIndex = allSteps.findIndex(step => step.status === 'current');
  const overallProgress = currentStepIndex >= 0 ? (currentStepIndex / (allSteps.length - 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Event Workflow
            </div>
            <StatusBadge status={quote?.workflow_status || 'pending'} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Phase Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={currentPhase === 'quote' ? 'default' : 'outline'}>
                Quote Planning
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant={currentPhase === 'approved' ? 'default' : 'outline'}>
                Customer Approval
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant={currentPhase === 'execution' ? 'default' : 'outline'}>
                Event Execution
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Steps */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentPhase === 'quote' && 'Quote Planning Steps'}
            {currentPhase === 'approved' && 'Customer Approved - Ready to Proceed'}
            {currentPhase === 'execution' && 'Event Execution Steps'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPhase === 'approved' ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Customer has approved the quote! You can now confirm event details and begin execution planning.
                </AlertDescription>
              </Alert>

              {/* Customer & Event Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Event Details</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quote.guest_count} guests • {new Date(quote.event_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Approved Amount</span>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    ${(quote.estimated_total / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPhaseSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.status === 'current' ? (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.title}</h4>
                      {step.status === 'current' && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Action Card */}
      {nextAction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <nextAction.icon className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-lg">{nextAction.title}</h4>
              <p className="text-muted-foreground">{nextAction.description}</p>
              {nextAction.timeEstimate && (
                <p className="text-sm text-muted-foreground mt-1">
                  ⏱️ Estimated time: {nextAction.timeEstimate}
                </p>
              )}
            </div>

            {'requirements' in nextAction && nextAction.requirements && (
              <div>
                <p className="text-sm font-medium mb-2">Requirements:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {nextAction.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {nextAction.canExecute ? (
                <Button 
                  onClick={() => handleWorkflowAction(nextAction.action)}
                  disabled={loading}
                  variant={nextAction.variant}
                  size="lg"
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : nextAction.title}
                </Button>
              ) : (
                <Button variant="outline" disabled size="lg" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  {nextAction.title}
                </Button>
              )}
            </div>

            {/* Manual Override for Approval */}
            {quote?.workflow_status === 'sent' && (
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Manual Override</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  If customer approved via phone, email, or in-person, you can manually proceed:
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManualApproval}
                  disabled={loading}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Customer Approved Manually
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}