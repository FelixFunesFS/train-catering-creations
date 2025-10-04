import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileEdit, DollarSign, Check, Send, ChevronRight } from 'lucide-react';

type Step = 'select' | 'template' | 'pricing' | 'review' | 'contract' | 'payment' | 'confirmed' | 'completed';

interface WorkflowStepsProps {
  currentStep: Step;
}

const steps = [
  { step: 'select' as const, label: 'Select Quote', icon: FileEdit },
  { step: 'pricing' as const, label: 'Pricing', icon: DollarSign },
  { step: 'contract' as const, label: 'Contract', icon: FileEdit },
  { step: 'payment' as const, label: 'Payment', icon: DollarSign },
  { step: 'confirmed' as const, label: 'Confirmed', icon: Check },
  { step: 'completed' as const, label: 'Complete', icon: Check }
];

export function WorkflowSteps({ currentStep }: WorkflowStepsProps) {
  const getStepStatus = (step: string) => {
    const stepOrder = ['select', 'template', 'pricing', 'review', 'contract', 'payment', 'confirmed', 'completed'];
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
        <div className="flex items-center gap-4 mb-6">
          {steps.map(({ step, label, icon: Icon }, index) => {
            const status = getStepStatus(step);
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  status === 'current' ? 'bg-primary text-primary-foreground' :
                  status === 'completed' ? 'bg-muted text-muted-foreground' :
                  'bg-background text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
