import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface FormProgressBarProps {
  progress: number;
  completedCount: number;
  totalCount: number;
}

export const FormProgressBar = ({ progress, completedCount, totalCount }: FormProgressBarProps) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 py-4 px-6 rounded-t-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {completedCount} of {totalCount} Required Sections Complete
            </span>
          </div>
        </div>
        <div className="text-sm font-medium text-primary">
          {Math.round(progress)}%
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
