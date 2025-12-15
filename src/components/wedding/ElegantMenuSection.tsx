import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ElegantMenuItem } from "./ElegantMenuItem";
import { MenuOrnament } from "./MenuOrnament";

interface MenuItem {
  title: string;
  description: string;
  delay: number;
  featured?: boolean;
}

interface ElegantMenuSectionProps {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  className?: string;
}

export const ElegantMenuSection = ({
  id,
  title,
  subtitle,
  items,
  defaultExpanded = false,
  className
}: ElegantMenuSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const displayItems = isExpanded ? items : items.slice(0, 4);
  const hasMoreItems = items.length > 4;
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section 
      id={id} 
      className={cn(
        "relative",
        className
      )}
    >
      {/* Elegant Section Header */}
      <header ref={headerRef} className={cn("text-center mb-8 md:mb-12", headerAnimationClass)}>
        {/* Top Ornament */}
        <MenuOrnament variant="section" />
        
        {/* Section Title - Script/Elegant Font */}
        <h2 className="font-script text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-3 md:mb-4 tracking-wide">
          {title}
        </h2>
        
        {/* Subtitle - Refined italic */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-muted-foreground italic max-w-xl mx-auto leading-relaxed px-4">
          {subtitle}
        </p>
        
        {/* Decorative underline */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      </header>
      
      {/* Menu Items - Elegant List Layout */}
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <div className="divide-y divide-border/20">
          {displayItems.map((item, index) => (
            <ElegantMenuItem
              key={`${item.title}-${index}`}
              title={item.title}
              description={item.description}
              delay={100 + (index * 75)}
              featured={item.featured}
            />
          ))}
        </div>
      </div>
      
      {/* Show More/Less Button */}
      {hasMoreItems && (
        <div className="flex justify-center mt-8 md:mt-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "group flex items-center gap-2",
              "px-6 py-3 md:px-8 md:py-4",
              "border border-primary/30 hover:border-primary/60",
              "bg-transparent hover:bg-primary/5",
              "text-primary font-elegant text-sm md:text-base tracking-wide",
              "rounded-none",
              "transition-all duration-300",
              "touch-target-comfortable"
            )}
          >
            <span>
              {isExpanded ? 'View Less' : `View All ${items.length} Items`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}
      
      {/* Bottom Ornament */}
      <MenuOrnament variant="footer" className="mt-8 md:mt-12" />
    </section>
  );
};
