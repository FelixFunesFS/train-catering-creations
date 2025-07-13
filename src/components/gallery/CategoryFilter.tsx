import { Button } from "@/components/ui/button";
import { galleryCategories } from "@/data/galleryCategories";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  imageCount?: Record<string, number>;
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'wedding': return '💒';
    case 'corporate': return '🏢';
    case 'formal': return '🎭';
    case 'buffet': return '🍽️';
    case 'desserts': return '🍰';
    case 'signature-dishes': return '⭐';
    case 'bbq': return '🔥';
    case 'family': return '👨‍👩‍👧‍👦';
    case 'grazing': return '🧀';
    case 'all': return '🎉';
    default: return '📷';
  }
};

export const CategoryFilter = ({ selectedCategory, onCategoryChange, imageCount }: CategoryFilterProps) => {
  return (
    <div className="mb-12 sm:mb-16">
      {/* Section header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Explore Our Events
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto px-4">
          Filter by event type to discover the perfect inspiration for your celebration
        </p>
      </div>

      {/* Enhanced filter buttons */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
        {galleryCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const count = imageCount?.[category.id] || 0;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              size="responsive-sm"
              onClick={() => onCategoryChange(category.id)}
              className={`
                relative text-sm font-medium min-h-touch flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3
                transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'bg-gradient-primary text-primary-foreground shadow-glow border-0' 
                  : 'hover:bg-muted/50 hover:border-primary/50'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{getCategoryIcon(category.id)}</span>
                <span>{category.name}</span>
                {count > 0 && category.id !== 'all' && (
                  <span className={`
                    ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isSelected 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </span>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary-foreground rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Visual separator */}
      <div className="flex items-center justify-center mt-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-md" />
      </div>
    </div>
  );
};