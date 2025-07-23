import React from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
  count?: number;
}

interface HorizontalCategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export const HorizontalCategoryNav = ({
  categories,
  activeCategory,
  onCategoryChange,
  className
}: HorizontalCategoryNavProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 px-4 sm:px-0 sm:justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap touch-target-comfortable",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/30"
            )}
          >
            <span>{category.label}</span>
            {category.count && (
              <span className="ml-2 text-xs opacity-75">({category.count})</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Scroll indicator for mobile */}
      <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
    </div>
  );
};