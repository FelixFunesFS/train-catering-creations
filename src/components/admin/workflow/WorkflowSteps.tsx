import React from 'react';
import { FileEdit, DollarSign, Check, CreditCard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'select' | 'pricing' | 'payment' | 'confirmed' | 'completed';

interface WorkflowStepsProps {
  currentStep: Step;
}

export function WorkflowSteps({ currentStep }: WorkflowStepsProps) {
  const steps: Array<{step: Step, label: string, icon: any}> = [
    { step: 'select', label: 'Select Quote', icon: FileEdit },
    { step: 'pricing', label: 'Pricing & Estimate', icon: DollarSign },
    { step: 'payment', label: 'Payment', icon: CreditCard },
    { step: 'confirmed', label: 'Confirmed', icon: Check },
    { step: 'completed', label: 'Complete', icon: Check }
  ];

  const getStepStatus = (step: string) => {
    const stepOrder = ['select', 'pricing', 'payment', 'confirmed', 'completed'];
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
    </div>
  );
}