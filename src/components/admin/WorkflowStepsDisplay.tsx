import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
}

interface WorkflowStepsDisplayProps {
  steps: WorkflowStep[];
  showHidden?: boolean;
  onToggleHidden?: () => void;
}

export function WorkflowStepsDisplay({ steps, showHidden = false, onToggleHidden }: WorkflowStepsDisplayProps) {
  const visibleSteps = showHidden ? steps : steps.filter((step, index) => {
    const currentIndex = steps.findIndex(s => s.status === 'current');
    return index <= currentIndex + 1 || step.status === 'completed';
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Workflow Steps</h4>
        {onToggleHidden && (
          <button
            onClick={onToggleHidden}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHidden ? 'Hide future steps' : 'Show all steps'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleSteps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              step.status === 'completed' 
                ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300'
                : step.status === 'current'
                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
                : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
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
                <h5 className={`font-medium transition-colors ${
                  step.status === 'current' ? 'text-blue-700 dark:text-blue-300' : ''
                }`}>
                  {step.title}
                </h5>
                {step.status === 'current' && (
                  <Badge variant="default" className="text-xs">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {!showHidden && steps.some((step, index) => {
        const currentIndex = steps.findIndex(s => s.status === 'current');
        return index > currentIndex + 1 && step.status === 'upcoming';
      }) && (
        <div className="text-center pt-2">
          <button
            onClick={onToggleHidden}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            + {steps.length - visibleSteps.length} more steps
          </button>
        </div>
      )}
    </div>
  );
}