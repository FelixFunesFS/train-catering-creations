import React from 'react';
import { FileEdit, DollarSign, Check, FileSignature, CreditCard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map(({ step, label, icon: Icon }, index) => {
          const status = getStepStatus(step);
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm",
                status === 'current' && "bg-primary text-primary-foreground font-medium shadow-sm",
                status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100",
                status === 'upcoming' && "text-muted-foreground"
              )}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Compact metadata badges */}
      <div className="flex gap-2 mt-2">
        {isGovernmentContract && (
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-md border">
            🏛️ Government Contract
          </span>
        )}
        {!requiresContract && (
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-md border">
            📋 T&C Only
          </span>
        )}
      </div>
    </div>
  );
}
