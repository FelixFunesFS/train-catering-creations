import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
  isOptionalStep: boolean;
}

export const StepNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  canProceed,
  isOptionalStep,
}: StepNavigationProps) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Main Action Buttons */}
      <div className="flex gap-3">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base"
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed}
            className={cn(
              "flex-1 h-14 text-base bg-gradient-primary hover:opacity-90",
              isFirstStep ? "w-full" : ""
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Submit Quote Request
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed && !isOptionalStep}
            className={cn(
              "flex-1 h-14 text-base bg-gradient-primary hover:opacity-90",
              isFirstStep ? "w-full" : ""
            )}
          >
            Continue
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>

      {/* Keyboard Hint */}
      <p className="text-center text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter ↵</kbd> to continue
        {!isFirstStep && (
          <>
            {" • "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to go back
          </>
        )}
      </p>

      {/* Skip hint for optional steps */}
      {isOptionalStep && !canProceed && (
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip it
        </p>
      )}
    </div>
  );
};
