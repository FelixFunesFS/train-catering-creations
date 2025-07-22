
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { WeddingMenuCard } from "@/components/WeddingMenuCard";

interface MenuItem {
  title: string;
  description: string;
  delay: number;
  featured?: boolean;
}

interface CollapsibleMenuSectionProps {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  className?: string;
}

export const CollapsibleMenuSection = ({
  id,
  title,
  subtitle,
  items,
  defaultExpanded = false,
  className
}: CollapsibleMenuSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const displayItems = isExpanded ? items : items.slice(0, 3);
  const hasMoreItems = items.length > 3;
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section id={id} className={cn("space-y-6 lg:space-y-8", className)}>
      <div ref={headerRef} className={`text-center mb-6 lg:mb-8 ${headerAnimationClass}`}>
        <h2 className="text-2xl sm:text-3xl font-elegant text-foreground mb-3 sm:mb-4">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground italic max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {displayItems.map((item, index) => (
          <WeddingMenuCard
            key={`${item.title}-${index}`}
            title={item.title}
            description={item.description}
            delay={200 + (index * 100)}
            featured={item.featured}
          />
        ))}
      </div>
      
      {hasMoreItems && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-300 hover:scale-105 touch-target-comfortable"
          >
            <span className="font-medium">
              {isExpanded ? 'Show Less' : `Show ${items.length - 3} More Items`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </section>
  );
};
