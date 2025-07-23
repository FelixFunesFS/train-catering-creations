
import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { EnhancedMenuItemCard } from "./EnhancedMenuItemCard";
import { MobileMenuItemCard } from "./MobileMenuItemCard";
import { MenuSectionFilter, commonFilters } from "./MenuSectionFilter";

interface EnhancedMenuItem {
  name: string;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

interface ResponsiveMenuSectionProps {
  title: string;
  subtitle: string;
  color: string;
  items: (string | EnhancedMenuItem)[];
  defaultExpanded?: boolean;
  showFilters?: boolean;
  className?: string;
}

export const ResponsiveMenuSection = ({
  title,
  subtitle,
  color,
  items,
  defaultExpanded = false,
  showFilters = true,
  className
}: ResponsiveMenuSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  // Convert items to enhanced format with sample data
  const enhancedItems: EnhancedMenuItem[] = useMemo(() => {
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
    if (activeFilters.length === 0) return enhancedItems;
    
    return enhancedItems.filter(item => {
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
  }, [enhancedItems, activeFilters]);

  // Mobile shows fewer items initially
  const itemsToShow = isMobile ? 4 : 6;
  const displayItems = isExpanded ? filteredItems : filteredItems.slice(0, itemsToShow);
  const hasMoreItems = filteredItems.length > itemsToShow;

  const handleFilterChange = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Calculate filter counts
  const filtersWithCounts = commonFilters.map(filter => ({
    ...filter,
    count: enhancedItems.filter(item => {
      switch (filter.id) {
        case 'popular': return item.isPopular;
        case 'vegetarian': return item.isVegetarian;
        case 'gluten-free': return item.isGlutenFree;
        case 'spicy': return item.isSpicy;
        default: return false;
      }
    }).length
  })).filter(filter => filter.count > 0);

  const MenuItemCard = isMobile ? MobileMenuItemCard : EnhancedMenuItemCard;

  return (
    <section className={cn("space-y-4", className)}>
      <div className={cn(
        "neumorphic-card-2 hover:neumorphic-card-3 rounded-lg transition-all duration-300",
        "p-4 sm:p-6",
        color
      )}>
        <div ref={headerRef} className={`text-center mb-4 ${headerAnimationClass}`}>
          <h3 className="text-lg sm:text-xl font-elegant text-foreground mb-2 relative">
            {title}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 sm:w-12 h-0.5 bg-primary/60 rounded-full" />
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground italic">{subtitle}</p>
          )}
        </div>

        {/* Responsive Filters */}
        {showFilters && filtersWithCounts.length > 0 && (
          <div className="mb-4">
            <MenuSectionFilter
              filters={filtersWithCounts}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              className={cn(
                "flex-wrap gap-2",
                isMobile ? "justify-center" : "justify-start"
              )}
            />
          </div>
        )}

        {/* Responsive Items Grid */}
        <div className={cn(
          "gap-3 sm:gap-4",
          isMobile 
            ? "flex flex-col space-y-2" 
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {displayItems.map((item, index) => (
            <MenuItemCard
              key={`${item.name}-${index}`}
              item={item.name}
              description={item.description}
              isPopular={item.isPopular}
              isNew={item.isNew}
              isVegetarian={item.isVegetarian}
              isGlutenFree={item.isGlutenFree}
              isSpicy={item.isSpicy}
              onAddToQuote={() => console.log(`Add ${item.name} to quote`)}
            />
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMoreItems && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-300 text-sm font-medium touch-manipulation",
                isMobile ? "min-h-[44px] px-6" : "hover:scale-105"
              )}
            >
              <span>
                {isExpanded ? 'Show Less' : `Show ${filteredItems.length - itemsToShow} More Items`}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* No Results Message */}
        {activeFilters.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No items match the selected filters.</p>
            <button
              onClick={() => setActiveFilters([])}
              className="text-primary hover:text-primary/80 text-sm underline min-h-[44px] px-2 touch-manipulation"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
