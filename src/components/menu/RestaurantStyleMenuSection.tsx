import React, { useMemo, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useAnimationClass } from '@/hooks/useAnimationClass';
import { useIsMobile } from '@/hooks/use-mobile';
import { RestaurantMenuItem } from './RestaurantMenuItem';
import { MenuSectionHeader } from './MenuSectionHeader';
import { MenuCategory } from './MenuCategory';
import { MenuSectionFilter, commonFilters } from './MenuSectionFilter';
import { Badge } from '@/components/ui/badge';

interface EnhancedMenuItem {
  name: string;
  description?: string;
  price?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
}

interface RestaurantStyleMenuSectionProps {
  title: string;
  subtitle?: string;
  color: string;
  items: string[] | EnhancedMenuItem[];
  defaultExpanded?: boolean;
  showFilters?: boolean;
  categoryType?: 'signature' | 'premium' | 'classic';
}

export const RestaurantStyleMenuSection: React.FC<RestaurantStyleMenuSectionProps> = ({
  title,
  subtitle,
  color,
  items,
  defaultExpanded = false,
  showFilters = false,
  categoryType = 'classic'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const animationClass = useAnimationClass('fade-up', isVisible);

  // Enhanced items with default properties
  const enhancedItems: EnhancedMenuItem[] = useMemo(() => {
    return items.map((item, index) => {
      if (typeof item === 'string') {
        return {
          name: item,
          description: `Expertly prepared ${item.toLowerCase()} featuring seasonal ingredients and our signature techniques.`,
          isPopular: index < 2,
          isVegetarian: Math.random() > 0.7,
          isSpicy: Math.random() > 0.8,
          isGlutenFree: Math.random() > 0.75,
          isFeatured: index === 0 && categoryType === 'signature'
        };
      }
      return item;
    });
  }, [items, categoryType]);

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return enhancedItems;
    
    return enhancedItems.filter(item => {
      return activeFilters.every(filter => {
        switch (filter) {
          case 'popular': return item.isPopular;
          case 'vegetarian': return item.isVegetarian;
          case 'spicy': return item.isSpicy;
          case 'gluten-free': return item.isGlutenFree;
          case 'new': return item.isNew;
          case 'featured': return item.isFeatured;
          default: return true;
        }
      });
    });
  }, [enhancedItems, activeFilters]);

  const displayItems = isExpanded ? filteredItems : filteredItems.slice(0, isMobile ? 3 : 6);
  const hasMoreItems = filteredItems.length > (isMobile ? 3 : 6);

  const handleFilterChange = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <div ref={ref} className={`${animationClass} mb-12`}>
      <MenuCategory type={categoryType}>
        <MenuSectionHeader 
          title={title} 
          subtitle={subtitle} 
          color={color}
          categoryType={categoryType}
        />
        
        {showFilters && (
          <div className="mb-6">
            <MenuSectionFilter 
              filters={commonFilters}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
            />
          </div>
        )}

        {/* Restaurant-style menu layout */}
        <div className={`
          grid gap-6
          ${isMobile 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
          }
        `}>
          {displayItems.map((item, index) => (
            <RestaurantMenuItem
              key={index}
              item={item}
              index={index}
              categoryType={categoryType}
            />
          ))}
        </div>

        {/* No results message */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No menu items match your current filters.</p>
            <button
              onClick={clearFilters}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Show More/Less button */}
        {hasMoreItems && filteredItems.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary 
                       hover:text-primary/80 transition-colors duration-200 
                       border border-primary/20 rounded-full hover:border-primary/40
                       bg-background/50 backdrop-blur-sm"
            >
              {isExpanded ? (
                <>
                  Show Less
                  <svg className="ml-2 h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              ) : (
                <>
                  Show {filteredItems.length - displayItems.length} More Items
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </MenuCategory>
    </div>
  );
};