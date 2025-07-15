import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
  height?: string;
}

export const ScrollProgress = ({ className, height = "h-1" }: ScrollProgressProps) => {
  const progress = useScrollProgress();

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 bg-muted/20", height, className)}>
      <div
        className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};