
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { Button } from "@/components/ui/button";
import { SectionContentCard } from "@/components/ui/section-content-card";

interface GallerySectionProps {
  title: string;
  description: string;
  heroImage: GalleryImage;
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const GallerySection = ({ 
  title, 
  description, 
  heroImage, 
  images, 
  onImageClick 
}: GallerySectionProps) => {
  return (
    <SectionContentCard className="p-6 sm:p-8 mb-8 sm:mb-12">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-elegant font-bold text-foreground mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Hero Image */}
        <div className="lg:col-span-1">
          <OptimizedFloatingImage
            src={heroImage.src}
            alt={heroImage.title}
            title={heroImage.title}
            description={heroImage.description}
            aspectRatio="aspect-[4/5]"
            variant="medium"
            priority={true}
            onImageClick={() => onImageClick(heroImage.src)}
            className="bg-gradient-card border-2 border-transparent min-h-touch"
          />
        </div>
        
        {/* Image Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {images.slice(0, 6).map((image, index) => (
              <OptimizedFloatingImage
                key={index}
                src={image.src}
                alt={image.title}
                title={image.title}
                description={image.description}
                aspectRatio="aspect-square"
                variant="subtle"
                priority={index < 4}
                onImageClick={() => onImageClick(image.src)}
                className="bg-gradient-card border-2 border-transparent min-h-touch"
              />
            ))}
          </div>
          
          {images.length > 6 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                size="responsive-sm"
                onClick={() => onImageClick(images[0].src)}
              >
                View More ({images.length - 6}+ Photos)
              </Button>
            </div>
          )}
        </div>
      </div>
    </SectionContentCard>
  );
};
