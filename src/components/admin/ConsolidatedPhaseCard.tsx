import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Circle,
  Clock,
  Info,
  ArrowRight
} from 'lucide-react';

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

interface ConsolidatedPhaseCardProps {
  currentPhase: 'quote' | 'approved' | 'execution';
  currentPhaseSteps: WorkflowStep[];
  getStepStatus: (stepId: string) => 'completed' | 'current' | 'upcoming';
  nextAction?: NextAction | null;
  onActionClick?: (action: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function ConsolidatedPhaseCard({
  currentPhase,
  currentPhaseSteps,
  getStepStatus,
  nextAction,
  onActionClick,
  loading = false,
  error = null
}: ConsolidatedPhaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Phase Steps */}
        <div className="space-y-3">
          {currentPhaseSteps.map((step) => {
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
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <Badge 
                  variant={status === 'completed' ? 'default' : status === 'current' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Next Action
            </h4>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <nextAction.icon className="h-4 w-4 mt-0.5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{nextAction.title}</h4>
                  <p className="text-xs text-muted-foreground">{nextAction.description}</p>
                  {nextAction.estimatedTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Est. time: {nextAction.estimatedTime}
                    </p>
                  )}
                </div>
                <Badge variant={nextAction.canExecute ? "default" : "secondary"} className="text-xs">
                  {nextAction.canExecute ? "Ready" : "Blocked"}
                </Badge>
              </div>

              {nextAction.requirements && nextAction.requirements.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-xs">Requirements:</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {nextAction.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {nextAction.action !== 'set_pricing' && onActionClick && (
                <Button
                  onClick={() => onActionClick(nextAction.action)}
                  disabled={loading || !nextAction.canExecute}
                  className="w-full"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Circle className="h-3 w-3 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <nextAction.icon className="h-3 w-3 mr-2" />
                      {nextAction.title}
                    </>
                  )}
                </Button>
              )}

              {nextAction.action === 'set_pricing' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Complete the pricing form above to continue with the workflow.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}