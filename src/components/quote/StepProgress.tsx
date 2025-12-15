import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const StepProgress = ({ currentStep, totalSteps, stepTitles }: StepProgressProps) => {
  return (
    <div className="w-full">
      {/* Mobile: Dots + Text */}
      <div className="flex flex-col items-center gap-3">
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                index < currentStep
                  ? "bg-primary"
                  : index === currentStep
                  ? "bg-primary ring-4 ring-primary/20"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Step Counter & Title */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm font-medium">{stepTitles[currentStep]}</span>
        </div>
      </div>
    </div>
  );
};
