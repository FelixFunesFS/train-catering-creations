
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { Button } from "@/components/ui/button";

interface MobileGallerySectionProps {
  title: string;
  description: string;
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const MobileGallerySection = ({ 
  title, 
  description, 
  images, 
  onImageClick 
}: MobileGallerySectionProps) => {
  // Show first 8 images in the grid
  const gridImages = images.slice(0, 8);
  
  return (
    <SectionContentCard className="p-0 mb-6 sm:mb-8 lg:mb-12 overflow-hidden">
      {/* Full-bleed image grid at the top */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 mb-6 sm:mb-8">
        {gridImages.map((image, index) => {
          // Create varied layouts with some full-width images
          const isFullWidth = index === 0 || (index > 0 && index % 7 === 0);
          const aspectRatio = isFullWidth 
            ? "aspect-[3/2]" 
            : index % 3 === 0 
            ? "aspect-[4/5]" 
            : index % 2 === 0 
            ? "aspect-square" 
            : "aspect-[3/4]";
          
          return (
            <div 
              key={index}
              className={`${isFullWidth ? 'col-span-2 sm:col-span-3 lg:col-span-4' : ''} bg-gradient-card rounded-lg overflow-hidden shadow-card hover:shadow-elevated border border-border/20 hover:border-primary/30 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]`}
              onClick={() => onImageClick(image.src)}
            >
              <div className="p-1 sm:p-2">
                <div className="relative rounded-md overflow-hidden">
                  <div className={aspectRatio}>
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 text-left">
                      <h4 className="text-white font-elegant font-semibold text-xs sm:text-sm lg:text-base mb-1 leading-tight">
                        {image.title}
                      </h4>
                      <p className="text-white/90 text-xs leading-tight line-clamp-2">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Content below the images */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
          {description}
        </p>
        
        {images.length > 8 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              size="responsive-sm"
              onClick={() => onImageClick(images[0].src)}
              className="w-full sm:w-auto"
            >
              View All ({images.length} Photos)
            </Button>
          </div>
        )}
      </div>
    </SectionContentCard>
  );
};
