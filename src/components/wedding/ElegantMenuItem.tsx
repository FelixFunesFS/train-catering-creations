import React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ElegantMenuItemProps {
  title: string;
  description: string;
  delay?: number;
  featured?: boolean;
  className?: string;
}

export const ElegantMenuItem = ({ 
  title, 
  description, 
  delay = 0,
  featured = false,
  className 
}: ElegantMenuItemProps) => {
  const { ref: itemRef, isVisible, variant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay,
    mobile: { delay: Math.max(delay - 50, 0) },
    desktop: { delay }
  });
  
  const animationClass = useAnimationClass(variant, isVisible);
  
  return (
    <article 
      ref={itemRef} 
      className={cn(
        "group py-6 md:py-8 border-b border-border/30 last:border-b-0",
        "transition-all duration-300",
        animationClass,
        className
      )}
    >
      {/* Title Row */}
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className={cn(
          "font-elegant text-lg md:text-xl lg:text-2xl font-semibold",
          "text-foreground group-hover:text-primary transition-colors duration-300",
          featured && "text-primary"
        )}>
          {title}
        </h3>
        
        {featured && (
          <span className="text-primary text-lg md:text-xl" aria-label="Chef's recommendation">
            ✦
          </span>
        )}
        
        {/* Decorative dotted line */}
        <div className="flex-1 border-b border-dotted border-border/50 mb-1.5 hidden md:block" />
      </div>
      
      {/* Description */}
      <p className={cn(
        "text-muted-foreground text-sm md:text-base leading-relaxed",
        "font-sans italic",
        "max-w-prose"
      )}>
        {description}
      </p>
      
      {featured && (
        <p className="mt-2 text-xs md:text-sm text-primary/80 font-medium tracking-wide uppercase">
          Chef's Recommendation
        </p>
      )}
    </article>
  );
};
