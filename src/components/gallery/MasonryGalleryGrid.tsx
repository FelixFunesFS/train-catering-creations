
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { GalleryLoadingState } from "./GalleryLoadingState";
import { useState, useEffect } from "react";

interface MasonryGalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  sectionId: string;
  alternateLayout?: boolean;
}

export const MasonryGalleryGrid = ({ 
  images, 
  onImageClick, 
  sectionId, 
  alternateLayout = false 
}: MasonryGalleryGridProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced image selection with quality-based featuring
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const displayImages = sortedImages.slice(0, 12);
  
  // Select featured images (quality 8+ only)
  const featuredImages = displayImages.filter(img => img.quality >= 8).slice(0, 2);
  const regularImages = displayImages.filter(img => !featuredImages.includes(img));

  const { ref, getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: displayImages.length,
    staggerDelay: 80,
    baseDelay: 150,
    variant: 'ios-spring'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const getAspectRatio = (index: number, isFeatured: boolean): "aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]" => {
    if (isFeatured) {
      return alternateLayout && index === 0 ? "aspect-[5/4]" : "aspect-[4/3]";
    }
    const patterns: ("aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]")[] = [
      "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]", "aspect-[4/3]"
    ];
    return patterns[index % patterns.length];
  };

  if (isLoading) {
    return <GalleryLoadingState viewMode="masonry" itemCount={displayImages.length} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Featured Images Section */}
      {featuredImages.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <span className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
              Featured Highlights
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {featuredImages.map((image, index) => (
              <div 
                key={`featured-${sectionId}-${index}`}
                className={`
                  ${getItemClassName(index)}
                  ${alternateLayout && index === 0 ? 'md:col-span-2' : ''}
                `}
                style={getItemStyle(index)}
              >
                <div className="relative group">
                  <OptimizedFloatingImage
                    src={image.src}
                    alt={image.title}
                    title={image.title}
                    description={image.description}
                    aspectRatio={getAspectRatio(index, true)}
                    variant="dramatic"
                    priority={true}
                    onImageClick={() => onImageClick(image.src)}
                    className="w-full transform transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                  />
                  
                  {/* Enhanced Featured Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Featured
                      </span>
                      <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {image.quality}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Images Grid */}
      {regularImages.length > 0 && (
        <div>
          {featuredImages.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <span className="text-sm text-muted-foreground font-medium">
                Collection Gallery
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
          )}
          
          <div ref={ref} className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5">
            {regularImages.map((image, index) => (
              <div 
                key={`regular-${sectionId}-${index}`}
                className={`break-inside-avoid mb-3 sm:mb-4 md:mb-5 ${getItemClassName(index + featuredImages.length)}`}
                style={getItemStyle(index + featuredImages.length)}
              >
                <OptimizedFloatingImage
                  src={image.src}
                  alt={image.title}
                  title={image.title}
                  description={image.description}
                  aspectRatio={getAspectRatio(index, false)}
                  variant="medium"
                  priority={index < 4}
                  onImageClick={() => onImageClick(image.src)}
                  className="w-full transform transition-all duration-300 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
