import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactMenuItemProps {
  name: string;
  isPopular?: boolean;
  className?: string;
}

export const CompactMenuItem = ({ 
  name, 
  isPopular = false,
  className 
}: CompactMenuItemProps) => {
  return (
    <div className={cn(
      "group relative bg-background/20 hover:bg-background/40 border border-border/10 hover:border-primary/30 rounded-lg p-4 transition-all duration-200 hover:shadow-sm touch-target-comfortable min-h-[48px] flex items-center",
      isPopular && "ring-1 ring-primary/20 bg-primary/5",
      className
    )}>
      {/* Popular Star */}
      {isPopular && (
        <div className="absolute top-2 right-2 p-1 bg-primary/15 text-primary rounded-full">
          <Star className="h-3 w-3 fill-current" />
        </div>
      )}

      {/* Item Name */}
      <div className="flex-1 pr-8">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-base leading-relaxed">
          {name}
        </h4>
      </div>
    </div>
  );
};