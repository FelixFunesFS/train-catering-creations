import { Check, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStage = 
  | 'submitted' 
  | 'under_review' 
  | 'quoted' 
  | 'approved' 
  | 'event_day';

interface WorkflowStep {
  id: WorkflowStage;
  label: string;
  description: string;
  estimatedTime?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'submitted',
    label: 'Quote Submitted',
    description: 'Your request has been received',
    estimatedTime: 'Completed'
  },
  {
    id: 'under_review',
    label: 'Under Review',
    description: 'Our team is reviewing your details',
    estimatedTime: '24-48 hours'
  },
  {
    id: 'quoted',
    label: 'Quote Sent',
    description: 'Detailed estimate delivered',
    estimatedTime: '1-2 days'
  },
  {
    id: 'approved',
    label: 'Approved & Paid',
    description: 'Contract signed and payment received',
    estimatedTime: 'Your timeline'
  },
  {
    id: 'event_day',
    label: 'Event Day',
    description: 'Exceptional catering delivered',
    estimatedTime: 'Event date'
  }
];

interface QuoteWorkflowProgressProps {
  currentStage: WorkflowStage;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const QuoteWorkflowProgress = ({ 
  currentStage, 
  className,
  orientation = 'horizontal' 
}: QuoteWorkflowProgressProps) => {
  const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === currentStage);

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  status === 'completed' && "bg-primary text-primary-foreground",
                  status === 'current' && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  status === 'pending' && "bg-muted text-muted-foreground"
                )}>
                  {status === 'completed' && <Check className="w-5 h-5" />}
                  {status === 'current' && <Clock className="w-5 h-5" />}
                  {status === 'pending' && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-12 my-1 transition-colors duration-300",
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h4 className={cn(
                  "font-semibold transition-colors",
                  status === 'current' && "text-primary",
                  status === 'pending' && "text-muted-foreground"
                )}>
                  {step.label}
                </h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.estimatedTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {status === 'completed' ? '✓ ' : ''}{step.estimatedTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div className={cn(
                    "flex-1 h-0.5 transition-colors duration-300",
                    index <= currentIndex ? "bg-primary" : "bg-muted"
                  )} />
                )}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  status === 'completed' && "bg-primary text-primary-foreground",
                  status === 'current' && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  status === 'pending' && "bg-muted text-muted-foreground"
                )}>
                  {status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
                  {status === 'current' && <Clock className="w-5 h-5" />}
                  {status === 'pending' && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 transition-colors duration-300",
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
              <div className="mt-3 text-center max-w-[120px]">
                <p className={cn(
                  "text-xs font-medium transition-colors",
                  status === 'current' && "text-primary",
                  status === 'pending' && "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.estimatedTime && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                    {step.estimatedTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
