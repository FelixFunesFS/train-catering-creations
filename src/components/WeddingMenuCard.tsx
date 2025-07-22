
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface WeddingMenuCardProps {
  title: string;
  description: string;
  delay?: number;
  featured?: boolean;
  price?: string;
  className?: string;
}

export const WeddingMenuCard = ({ 
  title, 
  description, 
  delay = 200,
  featured = false,
  price,
  className 
}: WeddingMenuCardProps) => {
  const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
    variant: 'elastic', 
    delay,
    mobile: { delay: Math.max(delay - 100, 0) },
    desktop: { delay }
  });
  
  const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
  
  return (
    <div 
      ref={cardRef} 
      className={cn(
        "relative neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-4 sm:p-6 transition-all duration-300 group",
        featured && "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
        cardAnimationClass,
        className
      )}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-lg">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-elegant font-semibold text-foreground text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
            {title}
          </h4>
          {price && (
            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
              {price}
            </span>
          )}
        </div>
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {featured && (
          <div className="flex items-center space-x-1 text-xs text-primary font-medium">
            <Star className="h-3 w-3 fill-current" />
            <span>Chef's Recommendation</span>
          </div>
        )}
      </div>
    </div>
  );
};
