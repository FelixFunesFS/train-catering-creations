import React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Check } from "lucide-react";

interface ElegantServiceCardProps {
  title: string;
  items: string[];
  delay?: number;
  className?: string;
}

export const ElegantServiceCard = ({
  title,
  items,
  delay = 0,
  className
}: ElegantServiceCardProps) => {
  const { ref: cardRef, isVisible, variant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay,
    mobile: { delay: Math.max(delay - 50, 0) },
    desktop: { delay }
  });
  
  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "relative p-8 md:p-10 lg:p-12",
        "bg-card/50 backdrop-blur-sm",
        "border border-border/40",
        "transition-all duration-500",
        "group hover:border-primary/30",
        animationClass,
        className
      )}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40 -translate-x-px -translate-y-px" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40 translate-x-px -translate-y-px" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40 -translate-x-px translate-y-px" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40 translate-x-px translate-y-px" />
      
      {/* Title */}
      <h3 className="font-script text-2xl md:text-3xl text-foreground text-center mb-6 md:mb-8">
        {title}
      </h3>
      
      {/* Decorative line under title */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-primary/40" />
          <span className="text-primary/50 text-xs">✦</span>
          <div className="w-8 h-px bg-primary/40" />
        </div>
      </div>
      
      {/* Service Items */}
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li 
            key={index}
            className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
          >
            <Check className="h-4 w-4 text-primary/70 mt-1 flex-shrink-0" />
            <span className="text-sm md:text-base leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
