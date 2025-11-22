import { Check, Circle, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FormSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  isComplete: boolean;
  isRequired: boolean;
}

export const FormSectionHeader = ({ 
  icon: Icon, 
  title, 
  isComplete, 
  isRequired 
}: FormSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          isComplete 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {isComplete ? (
            <Check className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-elegant text-foreground">
            {title}
          </h3>
          {isRequired && !isComplete && (
            <span className="text-xs text-muted-foreground">
              Required
            </span>
          )}
        </div>
      </div>

      {isComplete && (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          ✓ Complete
        </Badge>
      )}
    </div>
  );
};
