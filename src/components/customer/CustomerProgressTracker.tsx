import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  FileText,
  CreditCard,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'blocked';
  completedAt?: string;
  estimatedDuration?: string;
  icon?: React.ReactNode;
  subSteps?: {
    label: string;
    completed: boolean;
  }[];
}

interface CustomerProgressTrackerProps {
  steps: ProgressStep[];
  currentStepId?: string;
  compact?: boolean;
  showSubSteps?: boolean;
}

export function CustomerProgressTracker({
  steps,
  currentStepId,
  compact = false,
  showSubSteps = true
}: CustomerProgressTrackerProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  const currentStep = steps.find(step => step.status === 'current');

  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-amber-600 animate-pulse" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200';
      case 'current':
        return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200';
      case 'blocked':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getStatusBadge = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Progress Overview</span>
            <Badge variant="secondary">{Math.round(progressPercentage)}%</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${getStepColor(step)}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {getStepIcon(step)}
                    <span className="text-sm font-medium truncate">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {currentStep && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Currently: {currentStep.label}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {currentStep.description}
                    </p>
                    {currentStep.estimatedDuration && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Estimated time: {currentStep.estimatedDuration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Event Progress Tracker</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{completedSteps} of {steps.length} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Detailed Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${getStepColor(step)}
                  ${step.status === 'current' ? 'shadow-md' : ''}
                `}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">{step.label}</h4>
                          <p className="text-sm opacity-90 mb-2">{step.description}</p>
                          
                          {step.completedAt && (
                            <p className="text-xs opacity-75">
                              Completed {formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}
                            </p>
                          )}
                          
                          {step.status === 'current' && step.estimatedDuration && (
                            <p className="text-xs opacity-75">
                              Estimated time: {step.estimatedDuration}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {getStatusBadge(step)}
                        </div>
                      </div>

                      {/* Sub-steps */}
                      {showSubSteps && step.subSteps && step.subSteps.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium opacity-75">Tasks:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.subSteps.map((subStep, subIndex) => (
                              <div key={subIndex} className="flex items-center gap-2">
                                {subStep.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className={`text-xs ${subStep.completed ? 'line-through opacity-60' : ''}`}>
                                  {subStep.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-6 -bottom-4 w-0.5 h-8 bg-border" />
                )}
                
                {/* Mobile connection arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next Step Preview */}
          {currentStep && (
            <div className="mt-6 p-4 bg-gradient-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">What's happening now?</h4>
                  <p className="text-sm text-foreground/80 mb-2">
                    {currentStep.description}
                  </p>
                  {currentStep.estimatedDuration && (
                    <p className="text-xs text-primary/70">
                      This typically takes {currentStep.estimatedDuration}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}