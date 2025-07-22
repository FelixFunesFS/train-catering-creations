
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
  const displayItems = isExpanded ? items : items.slice(0, 8); // Show 8 items initially instead of 6
  const hasMoreItems = items.length > 8;

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <div className={cn("neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-2 sm:p-2.5 md:p-3 lg:p-4 transition-all duration-300", color)}>
      <div ref={headerRef} className={`text-center mb-2 sm:mb-3 md:mb-4 lg:mb-6 ${headerAnimationClass}`}>
        <h3 className="text-base sm:text-lg md:text-xl font-elegant text-foreground mb-1 sm:mb-2 relative">
          {title}
          <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-8 sm:w-10 md:w-12 h-0.5 bg-primary/60 rounded-full" />
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground italic">{subtitle}</p>
        )}
      </div>
      
      {/* Mobile 2-column, larger screens expand to more columns */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        {displayItems.map((item, index) => (
          <div 
            key={index} 
            className="neumorphic-card-1 hover:neumorphic-card-2 text-center py-2 sm:py-2.5 md:py-3 px-2 sm:px-2.5 md:px-3 rounded-md sm:rounded-lg transition-all duration-200 group cursor-default min-h-[44px] flex items-center justify-center"
          >
            <h4 className="text-xs sm:text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors leading-tight">{item}</h4>
          </div>
        ))}
      </div>
      
      {hasMoreItems && (
        <div className="flex justify-center mt-3 sm:mt-4 md:mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md sm:rounded-lg transition-all duration-300 hover:scale-105 touch-target-comfortable text-xs sm:text-sm min-h-[44px]"
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
