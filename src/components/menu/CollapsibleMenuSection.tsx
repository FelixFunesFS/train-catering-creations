
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
  const displayItems = isExpanded ? items : items.slice(0, 8);
  const hasMoreItems = items.length > 8;

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 50 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <div className={cn("rounded-lg p-3 sm:p-4 lg:p-5 border transition-all duration-300", color)}>
      <div ref={headerRef} className={`text-center mb-3 sm:mb-4 ${headerAnimationClass}`}>
        <h3 className="text-base sm:text-lg lg:text-xl font-elegant text-foreground mb-1.5 sm:mb-2 relative">
          {title}
          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary/60 rounded-full" />
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground italic">{subtitle}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {displayItems.map((item, index) => (
          <div key={index} className="text-center py-2 sm:py-2.5 px-2 rounded-md hover:bg-background/50 transition-all duration-200 group cursor-default border border-transparent hover:border-primary/20 min-h-[44px] flex items-center justify-center">
            <h4 className="text-xs sm:text-sm lg:text-base font-medium text-foreground group-hover:text-primary transition-colors leading-tight">{item}</h4>
          </div>
        ))}
      </div>
      
      {hasMoreItems && (
        <div className="flex justify-center mt-3 sm:mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm min-h-[44px]"
          >
            <span className="font-medium">
              {isExpanded ? 'Show Less' : `Show ${items.length - 8} More`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
