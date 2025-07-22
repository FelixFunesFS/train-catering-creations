
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface MenuSectionProps {
  title: string;
  subtitle: string;
  color: string;
  items: string[];
  defaultExpanded?: boolean;
}

export const CollapsibleMenuSection = ({
  title,
  subtitle,
  color,
  items,
  defaultExpanded = false
}: MenuSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const displayItems = isExpanded ? items : items.slice(0, 6);
  const hasMoreItems = items.length > 6;

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <div className={cn("rounded-lg p-4 sm:p-6 border transition-all duration-300", color)}>
      <div ref={headerRef} className={`text-center mb-4 sm:mb-6 ${headerAnimationClass}`}>
        <h3 className="text-lg sm:text-xl font-elegant text-foreground mb-2 relative">
          {title}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary/60 rounded-full" />
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground italic">{subtitle}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {displayItems.map((item, index) => (
          <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-background/50 transition-all duration-200 group cursor-default border border-transparent hover:border-primary/20">
            <h4 className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
          </div>
        ))}
      </div>
      
      {hasMoreItems && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-300 hover:scale-105 touch-target-comfortable text-sm"
          >
            <span className="font-medium">
              {isExpanded ? 'Show Less' : `Show ${items.length - 6} More`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
