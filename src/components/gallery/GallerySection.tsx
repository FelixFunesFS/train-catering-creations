
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { Button } from "@/components/ui/button";
import { SectionContentCard } from "@/components/ui/section-content-card";

interface GallerySectionProps {
  title: string;
  description: string;
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const GallerySection = ({ 
  title, 
  description, 
  images, 
  onImageClick 
}: GallerySectionProps) => {
  // Show first 12 images in the grid for better variety
  const gridImages = images.slice(0, 12);
  
  return (
    <SectionContentCard className="mb-0">
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl">
          {description}
        </p>
      </div>
      
      {/* Enhanced masonry grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
        {gridImages.map((image, index) => {
          // Create varied aspect ratios for masonry effect
          const getAspectRatio = (idx: number): "aspect-[4/5]" | "aspect-[3/4]" | "aspect-square" | "aspect-[5/4]" | "aspect-[3/2]" => {
            const patterns: ("aspect-[4/5]" | "aspect-[3/4]" | "aspect-square" | "aspect-[5/4]" | "aspect-[3/2]")[] = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[5/4]", "aspect-[3/2]"];
            return patterns[idx % patterns.length];
          };
          
          return (
            <OptimizedFloatingImage
              key={index}
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio={getAspectRatio(index)}
              variant="medium"
              priority={index < 6}
              onImageClick={() => onImageClick(image.src)}
              className="w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated"
            />
          );
        })}
      </div>
      
      {images.length > 12 && (
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
    </SectionContentCard>
  );
};
