import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface MobileStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (index: number) => void;
}

export const MobileStepIndicator = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: MobileStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = index === currentStep;
        const isAccessible = index <= Math.max(...completedSteps, currentStep);

        return (
          <button
            key={step.id}
            onClick={() => isAccessible && onStepClick(index)}
            disabled={!isAccessible}
            className={cn(
              "flex items-center justify-center transition-all duration-300",
              isCurrent ? "scale-110" : "",
              !isAccessible && "opacity-40 cursor-not-allowed"
            )}
            aria-label={`Step ${index + 1}: ${step.title}`}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                isCurrent
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted && !isCurrent ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
