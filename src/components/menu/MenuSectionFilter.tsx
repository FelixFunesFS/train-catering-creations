
import React from "react";
import { Leaf, Wheat, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface MenuSectionFilterProps {
  filters: FilterOption[];
  activeFilters: string[];
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export const MenuSectionFilter = ({ 
  filters, 
  activeFilters, 
  onFilterChange,
  className 
}: MenuSectionFilterProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-4", className)}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
            "border border-border/30 hover:border-primary/30",
            activeFilters.includes(filter.id)
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          {filter.icon}
          {filter.label}
          {filter.count && (
            <span className="ml-1 text-xs opacity-75">({filter.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

// Common filter options
export const commonFilters: FilterOption[] = [
  {
    id: "popular",
    label: "Popular",
    icon: <Star className="h-3 w-3" />
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    icon: <Leaf className="h-3 w-3" />
  },
  {
    id: "gluten-free",
    label: "Gluten-Free",
    icon: <Wheat className="h-3 w-3" />
  },
  {
    id: "spicy",
    label: "Spicy",
    icon: <Flame className="h-3 w-3" />
  }
];
