import React from "react";
import { cn } from "@/lib/utils";

interface CompactMenuItemProps {
  name: string;
  className?: string;
}

export const CompactMenuItem = ({ 
  name, 
  className 
}: CompactMenuItemProps) => {
  return (
    <div className={cn(
      "group relative bg-background/20 hover:bg-background/40 border border-border/10 hover:border-primary/30 rounded-lg p-4 transition-all duration-200 hover:shadow-sm touch-target-comfortable min-h-[48px] flex items-center",
      className
    )}>
      {/* Item Name */}
      <div className="flex-1">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-base leading-relaxed">
          {name}
        </h4>
      </div>
    </div>
  );
};
