import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { CompactMenuItem } from "./CompactMenuItem";
import { FilterQuickTags } from "./FilterQuickTags";

interface CompactMenuItem {
  name: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

interface CompactMenuLayoutProps {
  title: string;
  subtitle: string;
  color: string;
  items: (string | CompactMenuItem)[];
  showFilters?: boolean;
  className?: string;
}

export const CompactMenuLayout = ({
  title,
  subtitle,
  color,
  items,
  showFilters = true,
  className
}: CompactMenuLayoutProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  // Convert items to compact format
  const compactItems: CompactMenuItem[] = useMemo(() => {
    return items.map(item => {
      if (typeof item === 'string') {
        return {
          name: item,
          isPopular: Math.random() > 0.8,
          isVegetarian: item.toLowerCase().includes('vegetable') || item.toLowerCase().includes('salad'),
          isGlutenFree: item.toLowerCase().includes('rice') || item.toLowerCase().includes('potato'),
          isSpicy: item.toLowerCase().includes('spicy') || item.toLowerCase().includes('hot')
        };
      }
      return item;
    });
  }, [items]);

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return compactItems;
    
    return compactItems.filter(item => {
      return activeFilters.some(filter => {
        switch (filter) {
          case 'popular': return item.isPopular;
          case 'vegetarian': return item.isVegetarian;
          case 'gluten-free': return item.isGlutenFree;
          case 'spicy': return item.isSpicy;
          default: return true;
        }
      });
    });
  }, [compactItems, activeFilters]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Calculate filter counts
  const filterCounts = {
    popular: compactItems.filter(item => item.isPopular).length,
    vegetarian: compactItems.filter(item => item.isVegetarian).length,
    'gluten-free': compactItems.filter(item => item.isGlutenFree).length,
    spicy: compactItems.filter(item => item.isSpicy).length
  };

  return (
    <section className={cn("space-y-4", className)}>
      <div className={cn("neumorphic-card-1 rounded-lg p-3 sm:p-4 lg:p-6 transition-all duration-300", color)}>
        <div ref={headerRef} className={`text-center mb-4 ${headerAnimationClass}`}>
          <h3 className="text-base sm:text-lg lg:text-xl font-elegant text-foreground mb-2 relative">
            {title}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 sm:w-10 h-0.5 bg-primary/60 rounded-full" />
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground italic">{subtitle}</p>
          )}
        </div>

        {/* Compact Filters */}
        {showFilters && (
          <FilterQuickTags
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            counts={filterCounts}
            className="mb-4"
          />
        )}

        {/* Compact Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredItems.map((item, index) => (
            <CompactMenuItem
              key={`${item.name}-${index}`}
              name={item.name}
              isPopular={item.isPopular}
              isVegetarian={item.isVegetarian}
              isGlutenFree={item.isGlutenFree}
              isSpicy={item.isSpicy}
            />
          ))}
        </div>

        {/* No Results Message */}
        {activeFilters.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No items match the selected filters.</p>
            <button
              onClick={() => setActiveFilters([])}
              className="mt-2 text-primary hover:text-primary/80 text-xs underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};