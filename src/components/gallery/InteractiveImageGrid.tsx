import { useState, useMemo } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { galleryCategories } from "@/data/galleryCategories";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";

import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Heart } from "lucide-react";

interface InteractiveImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  category: string | null;
}

export const InteractiveImageGrid = ({
  images,
  onImageClick,
  category
}: InteractiveImageGridProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const isMobile = useIsMobile();
  
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

  const toggleFavorite = (imageSrc: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageSrc)) {
        newFavorites.delete(imageSrc);
      } else {
        newFavorites.add(imageSrc);
      }
      return newFavorites;
    });
  };

  const getCategoryDisplayName = (categoryId: string | null) => {
    if (!categoryId) return 'All Images';
    const categoryConfig = galleryCategories.find(cat => cat.id === categoryId);
    return categoryConfig?.name || categoryId;
  };

  const ImageCard = ({ image }: { image: GalleryImage }) => {
    const isFavorite = favorites.has(image.src);
    
    return (
      <div 
        className="group relative break-inside-avoid mb-3 sm:mb-4 rounded-xl overflow-hidden bg-card border border-border/10 hover:shadow-elevated transition-all duration-300 cursor-pointer"
        onClick={() => onImageClick(image.src)}
      >
        <OptimizedImage
          src={image.src}
          alt={image.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          containerClassName="w-full h-full"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content - Visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-elegant font-semibold text-white text-sm sm:text-base line-clamp-1">
              {image.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(image.src);
              }}
              className={`${isFavorite ? 'text-primary' : 'text-white/60'} hover:text-white p-1`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </div>
          
          <p className="text-white/80 text-xs sm:text-sm line-clamp-2">
            {image.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div 
        ref={headerRef}
        className={`mb-6 sm:mb-8 ${useAnimationClass(headerVariant, headerVisible)}`}
      >
        <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
          {getCategoryDisplayName(category)}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {sortedImages.length} images
        </p>
      </div>
      
      {/* Masonry Grid */}
      <div 
        ref={gridRef}
        className={`${useAnimationClass(gridVariant, gridVisible)}`}
      >
        {sortedImages.length > 0 ? (
          <div className={isMobile 
            ? "columns-1 sm:columns-2 gap-3 sm:gap-4" 
            : "columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 lg:gap-5"
          }>
            {sortedImages.map((image) => (
              <ImageCard key={image.src} image={image} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
