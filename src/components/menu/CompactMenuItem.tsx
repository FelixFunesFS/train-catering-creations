import React from "react";
import { cn } from "@/lib/utils";

interface CompactMenuItemProps {
  name: string;
  description?: string;
  isWeddingMode?: boolean;
  className?: string;
}

export const CompactMenuItem = ({ 
  name, 
  description,
  isWeddingMode = false,
  className 
}: CompactMenuItemProps) => {
  return (
    <div className={cn(
      "group relative rounded-lg transition-all duration-200 touch-target-comfortable flex items-center",
      isWeddingMode
        ? "p-4 min-h-[48px] bg-accent/20 border border-primary/20 hover:border-primary/40 hover:bg-accent/30 shadow-sm"
        : "p-2.5 sm:p-3 min-h-[40px] bg-background/20 hover:bg-background/40 border border-border/10 hover:border-primary/30 hover:shadow-sm",
      className
    )}>
      {/* Wedding mode decorative corner */}
      {isWeddingMode && (
        <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-primary/30 rounded-tr-lg pointer-events-none" />
      )}
      
      {/* Item Content */}
      <div className="flex-1">
        <h4 className={cn(
          "font-medium transition-colors",
          isWeddingMode 
            ? "text-base leading-relaxed text-foreground font-elegant group-hover:text-primary" 
            : "text-sm leading-snug text-foreground group-hover:text-primary"
        )}>
          {name}
        </h4>
        {description && (
          <p className={cn(
            "mt-1 leading-relaxed",
            isWeddingMode 
              ? "text-sm text-muted-foreground italic font-light"
              : "text-xs text-muted-foreground"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
