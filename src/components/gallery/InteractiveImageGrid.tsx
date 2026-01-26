import { useState, useMemo, useEffect } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { galleryCategories } from "@/data/galleryCategories";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";


interface InteractiveImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  category: string | null;
  showDiscoverHeader?: boolean;
}

export const InteractiveImageGrid = ({
  images,
  onImageClick,
  category,
  showDiscoverHeader = false
}: InteractiveImageGridProps) => {
  
  const isMobile = useIsMobile();
  
  // Responsive initial load counts for performance
  const getInitialLoadCount = () => isMobile ? 8 : 16;
  const getLoadMoreCount = () => isMobile ? 8 : 12;
  
  const [visibleCount, setVisibleCount] = useState(getInitialLoadCount());
  
  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(getInitialLoadCount());
  }, [category, isMobile]);
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: gridRef, isVisible: gridVisible, variant: gridVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'slide-up',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });

  // Sort images by quality (highest first)
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => b.quality - a.quality);
  }, [images]);
  
  // Paginate images for progressive loading
  const displayedImages = useMemo(() => {
    return sortedImages.slice(0, visibleCount);
  }, [sortedImages, visibleCount]);
  
  const hasMoreImages = visibleCount < sortedImages.length;
  const remainingCount = sortedImages.length - visibleCount;
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + getLoadMoreCount(), sortedImages.length));
  };


  const getCategoryDisplayName = (categoryId: string | null) => {
    if (!categoryId) return 'All Images';
    const categoryConfig = galleryCategories.find(cat => cat.id === categoryId);
    return categoryConfig?.name || categoryId;
  };

  const ImageCard = ({ image, index }: { image: GalleryImage; index: number }) => {
    // Priority load first 4 images for faster LCP
    const isPriority = index < 4;
    
    return (
      <div 
        className="group relative break-inside-avoid mb-3 sm:mb-4 rounded-xl overflow-hidden bg-card border border-border/10 hover:shadow-elevated transition-all duration-300 cursor-pointer"
        onClick={() => onImageClick(image.src)}
      >
        <OptimizedImage
          src={image.src}
          alt={image.title}
          priority={isPriority}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          containerClassName="w-full h-full"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content - Visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-elegant font-semibold text-white text-sm sm:text-base line-clamp-1">
            {image.title}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div 
        ref={headerRef}
        className={`mb-6 sm:mb-8 lg:mb-10 ${showDiscoverHeader ? 'text-center' : ''} ${useAnimationClass(headerVariant, headerVisible)}`}
      >
        {showDiscoverHeader ? (
          <>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-2 sm:mb-3">
              Discover Our Work
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-1">
              Browse our portfolio of beautifully catered events
            </p>
            {category && (
              <p className="text-ruby font-medium text-sm sm:text-base">
                Showing: {getCategoryDisplayName(category)} ({sortedImages.length} images)
              </p>
            )}
            {!category && (
              <p className="text-muted-foreground/70 text-sm">
                {sortedImages.length} images
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
              {getCategoryDisplayName(category)}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {sortedImages.length} images
            </p>
          </>
        )}
      </div>
      
      {/* Masonry Grid */}
      <div 
        ref={gridRef}
        className={`${useAnimationClass(gridVariant, gridVisible)}`}
      >
        {displayedImages.length > 0 ? (
          <>
            <div className={isMobile 
              ? "columns-1 sm:columns-2 gap-3 sm:gap-4" 
              : "columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 lg:gap-5"
            }>
              {displayedImages.map((image, index) => (
                <ImageCard key={image.src} image={image} index={index} />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMoreImages && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleLoadMore}
                  className="group gap-2 px-6 py-3 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                >
                  <span>Load More</span>
                  <span className="text-muted-foreground text-sm">({remainingCount} remaining)</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
