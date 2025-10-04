import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileEdit, DollarSign, Check, FileSignature, CreditCard, ChevronRight } from 'lucide-react';

type Step = 'select' | 'pricing' | 'government' | 'contract' | 'payment' | 'confirmed' | 'completed';

interface WorkflowStepsProps {
  currentStep: Step;
  isGovernmentContract?: boolean;
  requiresContract?: boolean;
}

export function WorkflowSteps({ currentStep, isGovernmentContract, requiresContract }: WorkflowStepsProps) {
  // Build dynamic steps based on event configuration
  const buildSteps = (): Array<{step: Step, label: string, icon: any}> => {
    const baseSteps: Array<{step: Step, label: string, icon: any}> = [
      { step: 'select', label: 'Select Quote', icon: FileEdit },
      { step: 'pricing', label: 'Pricing & Estimate', icon: DollarSign },
    ];

    // Add government contract step if needed
    if (isGovernmentContract) {
      baseSteps.push({ step: 'government', label: 'Government Setup', icon: FileSignature });
    }

    // Add contract step if required
    if (requiresContract) {
      baseSteps.push({ step: 'contract', label: 'Contract', icon: FileSignature });
    }

    // Add payment and completion steps
    baseSteps.push(
      { step: 'payment', label: 'Payment', icon: CreditCard },
      { step: 'confirmed', label: 'Confirmed', icon: Check },
      { step: 'completed', label: 'Complete', icon: Check }
    );

    return baseSteps;
  };

  const steps = buildSteps();

  const getStepStatus = (step: string) => {
    const stepOrder = ['select', 'pricing', 'government', 'contract', 'payment', 'confirmed', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Unified Workflow Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {steps.map(({ step, label, icon: Icon }, index) => {
            const status = getStepStatus(step);
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  status === 'current' ? 'bg-primary text-primary-foreground' :
                  status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
        {isGovernmentContract && (
          <p className="text-xs text-muted-foreground">
            <strong>Government Contract:</strong> Additional compliance steps required
          </p>
        )}
        {!requiresContract && (
          <p className="text-xs text-muted-foreground">
            <strong>T&C Only:</strong> No separate contract - Terms included in estimate
          </p>
        )}
      </CardContent>
    </Card>
  );
}
