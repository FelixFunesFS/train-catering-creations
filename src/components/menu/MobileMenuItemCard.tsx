
import React from "react";
import { Star, Leaf, Wheat, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileMenuItemCardProps {
  item: string;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  onAddToQuote?: () => void;
  className?: string;
}

export const MobileMenuItemCard = ({ 
  item, 
  description,
  isPopular = false,
  isNew = false,
  isVegetarian = false,
  isGlutenFree = false,
  isSpicy = false,
  onAddToQuote,
  className 
}: MobileMenuItemCardProps) => {
  return (
    <div className={cn(
      "group relative bg-background/80 hover:bg-background/90 border border-border/20 rounded-lg transition-all duration-200 active:scale-98 touch-manipulation",
      "min-h-[72px] p-4",
      isPopular && "ring-1 ring-primary/20 bg-primary/5",
      className
    )}>
      {/* Mobile-optimized header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground leading-tight text-base mb-1 truncate">
            {item}
          </h4>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {/* Compact badges for mobile */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {isPopular && (
            <div className="p-1 bg-primary/15 text-primary rounded-full" title="Popular">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
          {isNew && (
            <div className="px-2 py-1 bg-accent/15 text-accent-foreground rounded-full text-xs font-medium">
              New
            </div>
          )}
          {isVegetarian && (
            <div className="p-1 bg-green-100 text-green-600 rounded-full" title="Vegetarian">
              <Leaf className="h-3 w-3" />
            </div>
          )}
          {isGlutenFree && (
            <div className="p-1 bg-blue-100 text-blue-600 rounded-full" title="Gluten-Free">
              <Wheat className="h-3 w-3" />
            </div>
          )}
          {isSpicy && (
            <div className="p-1 bg-red-100 text-red-600 rounded-full" title="Spicy">
              <Flame className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile-optimized action button */}
      {onAddToQuote && (
        <div className="mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAddToQuote}
            className="w-full min-h-[44px] text-sm font-medium touch-manipulation"
          >
            Add to Quote
          </Button>
        </div>
      )}
    </div>
  );
};
