
import React from "react";
import { Star, Leaf, Wheat, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EnhancedMenuItemCardProps {
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

export const EnhancedMenuItemCard = ({ 
  item, 
  description,
  isPopular = false,
  isNew = false,
  isVegetarian = false,
  isGlutenFree = false,
  isSpicy = false,
  onAddToQuote,
  className 
}: EnhancedMenuItemCardProps) => {
  return (
    <div className={cn(
      "group relative bg-background/50 hover:bg-background/80 border border-border/30 hover:border-primary/30 rounded-lg p-4 transition-all duration-200 hover:shadow-md",
      isPopular && "ring-1 ring-primary/20 bg-primary/5",
      className
    )}>
      {/* Badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-wrap gap-1">
          {isPopular && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              Popular
            </div>
          )}
          {isNew && (
            <div className="inline-flex items-center px-2 py-1 bg-accent/15 text-accent-foreground rounded-full text-xs font-medium">
              New
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
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

      {/* Content */}
      <div className="space-y-2">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
          {item}
        </h4>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Add to Quote Button */}
      {onAddToQuote && (
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAddToQuote}
            className="w-full text-xs"
          >
            Add to Quote
          </Button>
        </div>
      )}
    </div>
  );
};
