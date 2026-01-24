import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenuItem } from "./CompactMenuItem";
import { MenuItem } from "@/data/menuData";

interface CollapsibleCategoryProps {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  initialItemCount?: number;
}

export const CollapsibleCategory = ({
  id,
  title,
  subtitle,
  items,
  defaultExpanded = false,
  initialItemCount = 9,
}: CollapsibleCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, initialItemCount);
  const hasMoreItems = items.length > initialItemCount;
  const remainingCount = items.length - initialItemCount;

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between",
          "p-4 sm:p-5 lg:p-6",
          "bg-card hover:bg-card/90",
          "transition-all duration-200",
          "touch-target-comfortable",
          "text-left"
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${id}`}
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              "h-5 w-5 text-primary transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
          <div>
            <h2 className="text-lg sm:text-xl font-elegant font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {items.length} items
        </span>
      </button>

      {/* Collapsible Content */}
      <div
        id={`category-${id}`}
        className={cn(
          "grid transition-all duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6 pt-0 sm:pt-0 lg:pt-0">
            {/* Item Grid - 2 columns mobile, 3 columns desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
              {visibleItems.map((item) => (
                <CompactMenuItem
                  key={item.id}
                  name={item.name}
                />
              ))}
            </div>

            {/* Show More/Less Button */}
            {hasMoreItems && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(!showAll);
                  }}
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium",
                    "bg-muted/50 hover:bg-muted",
                    "text-muted-foreground hover:text-foreground",
                    "rounded-full transition-all duration-200",
                    "min-h-[44px] touch-target-comfortable"
                  )}
                >
                  {showAll ? "Show Less" : `Show ${remainingCount} More Items`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
