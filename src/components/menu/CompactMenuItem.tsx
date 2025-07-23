import React from "react";
import { Star, Leaf, Wheat, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactMenuItemProps {
  name: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  className?: string;
}

export const CompactMenuItem = ({ 
  name, 
  isPopular = false,
  isVegetarian = false,
  isGlutenFree = false,
  isSpicy = false,
  className 
}: CompactMenuItemProps) => {
  return (
    <div className={cn(
      "group relative bg-background/30 hover:bg-background/60 border border-border/20 hover:border-primary/40 rounded-lg p-3 transition-all duration-200 hover:shadow-sm touch-target-comfortable",
      isPopular && "ring-1 ring-primary/30 bg-primary/5",
      className
    )}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-1 -right-1 p-1 bg-primary/20 text-primary rounded-full">
          <Star className="h-2.5 w-2.5 fill-current" />
        </div>
      )}

      {/* Item Name */}
      <div className="mb-2">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm leading-tight line-clamp-2">
          {name}
        </h4>
      </div>

      {/* Dietary Icons */}
      <div className="flex items-center justify-center gap-1">
        {isVegetarian && (
          <div className="p-1 bg-green-100 text-green-600 rounded-full" title="Vegetarian">
            <Leaf className="h-2.5 w-2.5" />
          </div>
        )}
        {isGlutenFree && (
          <div className="p-1 bg-blue-100 text-blue-600 rounded-full" title="Gluten-Free">
            <Wheat className="h-2.5 w-2.5" />
          </div>
        )}
        {isSpicy && (
          <div className="p-1 bg-red-100 text-red-600 rounded-full" title="Spicy">
            <Flame className="h-2.5 w-2.5" />
          </div>
        )}
      </div>
    </div>
  );
};