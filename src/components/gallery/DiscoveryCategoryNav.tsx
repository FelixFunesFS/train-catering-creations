import { galleryCategories } from "@/data/galleryCategories";
import { galleryImages } from "@/data/galleryImages";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Sparkles, 
  Heart, 
  Building, 
  Cake,
  ChefHat,
  Star
} from "lucide-react";

interface DiscoveryCategoryNavProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export const DiscoveryCategoryNav = ({
  selectedCategory,
  onCategorySelect
}: DiscoveryCategoryNavProps) => {
  const isMobile = useIsMobile();
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: categoriesRef, isVisible: categoriesVisible, variant: categoriesVariant } = useScrollAnimation({ 
    delay: 100, 
    variant: 'slide-up',
    mobile: { variant: 'medium', delay: 50 },
    desktop: { variant: 'ios-spring', delay: 100 }
  });

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'weddings-formal': <Heart className="h-4 w-4" />,
      'wedding': <Heart className="h-4 w-4" />,
      'formal': <Star className="h-4 w-4" />,
      'corporate': <Building className="h-4 w-4" />,
      'desserts': <Cake className="h-4 w-4" />,
      'buffet': <ChefHat className="h-4 w-4" />,
    };
    return iconMap[categoryId] || <Sparkles className="h-4 w-4" />;
  };

  const getCategoryPreviewImage = (categoryId: string) => {
    const category = galleryCategories.find(cat => cat.id === categoryId);
    const filterIds = category?.filterIds || [categoryId];
    const categoryImages = galleryImages.filter(img => filterIds.includes(img.category) && img.quality >= 7);
    return categoryImages[0] || galleryImages[0];
  };

  const getCategoryImageCount = (categoryId: string) => {
    const category = galleryCategories.find(cat => cat.id === categoryId);
    const filterIds = category?.filterIds || [categoryId];
    return galleryImages.filter(img => filterIds.includes(img.category)).length;
  };

  return (
    <div data-section="discovery" className="py-8 sm:py-12 lg:py-16">
      {/* Section Header */}
      <div 
        ref={headerRef} 
        className={`text-center mb-8 sm:mb-10 lg:mb-12 ${useAnimationClass(headerVariant, headerVisible)}`}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4">
          Discover Our Work
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
          Browse our portfolio of beautifully catered events
        </p>
      </div>

      {/* Category Cards */}
      <div 
        ref={categoriesRef}
        className={`${useAnimationClass(categoriesVariant, categoriesVisible)}`}
      >
        {isMobile ? (
          // Mobile: Horizontal scrolling cards
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
              {galleryCategories.map((category) => {
                const previewImage = getCategoryPreviewImage(category.id);
                const imageCount = getCategoryImageCount(category.id);
                const isSelected = selectedCategory === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={`relative flex-shrink-0 w-72 h-40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'ring-2 ring-primary ring-offset-2 shadow-glow' 
                        : 'hover:shadow-elevated hover:scale-105'
                    }`}
                    onClick={() => onCategorySelect(category.id)}
                  >
                    <OptimizedImage
                      src={previewImage.src}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(category.id)}
                        <h3 className="font-elegant font-semibold text-white text-lg">
                          {category.name}
                        </h3>
                      </div>
                      
                      <p className="text-white/80 text-sm line-clamp-2">
                        {category.description}
                      </p>
                      
                      <p className="text-white/60 text-xs mt-1">
                        {imageCount} images
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Desktop: Grid layout
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryCategories.map((category) => {
              const previewImage = getCategoryPreviewImage(category.id);
              const imageCount = getCategoryImageCount(category.id);
              const isSelected = selectedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  className={`group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ${
                    isSelected 
                      ? 'ring-2 ring-primary ring-offset-2 shadow-glow scale-105' 
                      : 'hover:shadow-elevated hover:scale-105'
                  }`}
                  onClick={() => onCategorySelect(category.id)}
                >
                  <OptimizedImage
                    src={previewImage.src}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    containerClassName="w-full h-full"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/30 to-transparent group-hover:from-navy-dark/95 transition-all duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        {getCategoryIcon(category.id)}
                      </div>
                      <h3 className="font-elegant font-bold text-white text-xl">
                        {category.name}
                      </h3>
                    </div>
                    
                    <p className="text-white/90 text-sm group-hover:text-white transition-colors duration-300">
                      {category.description}
                    </p>
                    
                    <p className="text-white/60 text-xs mt-2">
                      {imageCount} images
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
