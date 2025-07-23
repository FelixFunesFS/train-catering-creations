import React from "react";
import { Star, Leaf, Wheat, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterQuickTagsProps {
  activeFilters: string[];
  onFilterChange: (filterId: string) => void;
  counts: Record<string, number>;
  className?: string;
}

const filterConfig = [
  {
    id: "popular",
    label: "Popular",
    icon: Star,
    colorClass: "text-primary"
  },
  {
    id: "vegetarian", 
    label: "Vegetarian",
    icon: Leaf,
    colorClass: "text-green-600"
  },
  {
    id: "gluten-free",
    label: "Gluten-Free", 
    icon: Wheat,
    colorClass: "text-blue-600"
  },
  {
    id: "spicy",
    label: "Spicy",
    icon: Flame,
    colorClass: "text-red-600"
  }
];

export const FilterQuickTags = ({
  activeFilters,
  onFilterChange,
  counts,
  className
}: FilterQuickTagsProps) => {
  const availableFilters = filterConfig.filter(filter => counts[filter.id] > 0);

  if (availableFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {availableFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilters.includes(filter.id);
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 touch-target-comfortable",
              "border border-border/20",
              isActive
                ? "bg-primary/15 text-primary border-primary/30 shadow-sm"
                : "bg-background/30 text-muted-foreground hover:text-foreground hover:bg-background/60 hover:border-border/40"
            )}
          >
            <Icon className={cn("h-3 w-3", isActive ? "text-primary" : filter.colorClass)} />
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="text-xs opacity-75">({counts[filter.id]})</span>
          </button>
        );
      })}
    </div>
  );
};