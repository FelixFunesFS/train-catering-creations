import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  DollarSign,
  FileText,
  Send,
  Calendar,
  CreditCard,
  Utensils,
  RefreshCw,
  Info
} from 'lucide-react';

interface ConsolidatedWorkflowManagerProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  phase: 'quote' | 'approved' | 'execution';
  required: boolean;
  estimatedTime?: string;
}

interface NextAction {
  action: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  canExecute: boolean;
  requirements?: string[];
  estimatedTime?: string;
}

export function ConsolidatedWorkflowManager({ quote, invoice, onRefresh }: ConsolidatedWorkflowManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCompletedSteps();
  }, [quote?.id]);

  const loadCompletedSteps = async () => {
    if (!quote?.id) return;

    try {
      const { data, error } = await supabase
        .from('workflow_step_completion')
        .select('step_id')
        .eq('quote_request_id', quote.id);

      if (error) throw error;
      setCompletedSteps(data.map(item => item.step_id));
    } catch (error) {
      console.error('Error loading completed steps:', error);
    }
  };

  const getAllWorkflowSteps = (): WorkflowStep[] => [
    {
      id: 'pricing_completed',
      title: 'Set Pricing',
      description: 'Create detailed pricing breakdown',
      icon: DollarSign,
      phase: 'quote',
      required: true,
      estimatedTime: '10-15 min'
    },
    {
      id: 'quote_reviewed',
      title: 'Review Quote',
      description: 'Verify all details and pricing',
      icon: FileText,
      phase: 'quote',
      required: true,
      estimatedTime: '5-10 min'
    },
    {
      id: 'quote_sent',
      title: 'Send Quote',
      description: 'Send quote to customer for approval',
      icon: Send,
      phase: 'quote',
      required: true,
      estimatedTime: '2-3 min'
    },
    {
      id: 'payment_processed',
      title: 'Process Payment',
      description: 'Handle invoice and payment collection',
      icon: CreditCard,
      phase: 'approved',
      required: true,
      estimatedTime: '5-10 min'
    },
    {
      id: 'menu_finalized',
      title: 'Finalize Menu',
      description: 'Confirm final menu details with customer',
      icon: Utensils,
      phase: 'execution',
      required: true,
      estimatedTime: '15-20 min'
    },
    {
      id: 'event_scheduled',
      title: 'Schedule Event',
      description: 'Coordinate logistics and timeline',
      icon: Calendar,
      phase: 'execution',
      required: true,
      estimatedTime: '10-15 min'
    }
  ];

  const getCurrentPhase = () => {
    const status = quote?.workflow_status || quote?.status;
    if (['pending', 'under_review', 'quoted'].includes(status)) return 'quote';
    if (['confirmed', 'approved'].includes(status)) return 'approved';
    return 'execution';
  };

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    
    const currentPhase = getCurrentPhase();
    const allSteps = getAllWorkflowSteps();
    const step = allSteps.find(s => s.id === stepId);
    
    if (!step) return 'upcoming';
    
    // Phase-based logic for current step
    if (step.phase === 'quote' && currentPhase === 'quote') {
      if (stepId === 'pricing_completed') return quote?.estimated_total > 0 ? 'completed' : 'current';
      if (stepId === 'quote_reviewed') return quote?.status === 'reviewed' ? 'current' : 'upcoming';
      if (stepId === 'quote_sent') return quote?.status === 'quoted' ? 'current' : 'upcoming';
    }
    
    if (step.phase === currentPhase) return 'current';
    return step.phase === 'quote' ? 'completed' : 'upcoming';
  };

  const getNextAction = (): NextAction | null => {
    const status = quote?.workflow_status || quote?.status;
    
    if (status === 'pending' || !quote?.estimated_total) {
      return {
        action: 'set_pricing',
        title: 'Set Pricing',
        description: 'Complete the pricing breakdown to continue',
        icon: DollarSign,
        canExecute: true,
        requirements: ['Add line items with quantities and prices'],
        estimatedTime: '10-15 minutes'
      };
    }
    
    if (status === 'pending' && quote?.estimated_total > 0) {
      return {
        action: 'mark_reviewed',
        title: 'Mark as Reviewed',
        description: 'Confirm quote is ready to send',
        icon: CheckCircle,
        canExecute: true,
        estimatedTime: '2-3 minutes'
      };
    }
    
    if (status === 'reviewed') {
      return {
        action: 'create_estimate',
        title: 'Create Estimate',
        description: 'Generate professional estimate document',
        icon: FileText,
        canExecute: true,
        estimatedTime: '5-10 minutes'
      };
    }
    
    if (status === 'quoted' && !invoice) {
      return {
        action: 'create_invoice',
        title: 'Create Invoice',
        description: 'Generate invoice for approved quote',
        icon: CreditCard,
        canExecute: true,
        estimatedTime: '5-10 minutes'
      };
    }
    
    return null;
  };

  const handleWorkflowAction = async (action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (action === 'set_pricing') {
        // Focus on pricing tab - this is handled by parent component
        toast({
          title: "Complete Pricing",
          description: "Please complete the pricing breakdown in the pricing section",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('update-quote-workflow', {
        body: { quote_id: quote.id, action }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data?.message || "Workflow updated successfully",
      });

      // Refresh quote data
      onRefresh?.();
      loadCompletedSteps();
    } catch (error: any) {
      console.error('Workflow action failed:', error);
      setError(error.message || 'Failed to update workflow');
      toast({
        title: "Error",
        description: error.message || "Failed to update workflow",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const allSteps = getAllWorkflowSteps();
    const completed = allSteps.filter(step => getStepStatus(step.id) === 'completed').length;
    return Math.round((completed / allSteps.length) * 100);
  };

  const nextAction = getNextAction();
  const currentPhase = getCurrentPhase();
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex gap-2">
            <Badge variant={currentPhase === 'quote' ? 'default' : 'outline'}>
              Quote Phase
            </Badge>
            <Badge variant={currentPhase === 'approved' ? 'default' : 'outline'}>
              Approved Phase
            </Badge>
            <Badge variant={currentPhase === 'execution' ? 'default' : 'outline'}>
              Execution Phase
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getAllWorkflowSteps()
              .filter(step => step.phase === currentPhase)
              .map((step) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : status === 'current' ? (
                        <Circle className="h-5 w-5 text-blue-500 fill-current" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <Badge variant={status === 'completed' ? 'default' : status === 'current' ? 'secondary' : 'outline'}>
                      {status}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Next Action */}
      {nextAction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <nextAction.icon className="h-5 w-5" />
              Next Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setError(null)}
                    className="ml-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <nextAction.icon className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{nextAction.title}</h4>
                  <p className="text-sm text-muted-foreground">{nextAction.description}</p>
                  {nextAction.estimatedTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Est. time: {nextAction.estimatedTime}
                    </p>
                  )}
                </div>
                <Badge variant={nextAction.canExecute ? "default" : "secondary"}>
                  {nextAction.canExecute ? "Ready" : "Blocked"}
                </Badge>
              </div>

              {nextAction.requirements && nextAction.requirements.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Requirements:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {nextAction.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {nextAction.action !== 'set_pricing' && nextAction.action !== 'await_approval' && (
                <Button
                  onClick={() => handleWorkflowAction(nextAction.action)}
                  disabled={loading || !nextAction.canExecute}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <nextAction.icon className="h-4 w-4 mr-2" />
                      {nextAction.title}
                    </>
                  )}
                </Button>
              )}

              {nextAction.action === 'set_pricing' && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Complete the pricing form above to continue with the workflow.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}