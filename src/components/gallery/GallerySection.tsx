
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
    <SectionContentCard className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-3 sm:mb-4">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Mobile-first layout: Hero image on top, then grid below */}
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Image - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
          <OptimizedFloatingImage
            src={heroImage.src}
            alt={heroImage.title}
            title={heroImage.title}
            description={heroImage.description}
            aspectRatio="aspect-[4/5]"
            variant="medium"
            priority={true}
            onImageClick={() => onImageClick(heroImage.src)}
            className="min-h-[44px] w-full"
          />
        </div>
        
        {/* Image Grid - Mobile optimized */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {images.slice(0, 8).map((image, index) => (
            <OptimizedFloatingImage
              key={index}
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio={index % 3 === 0 ? "aspect-[4/5]" : index % 2 === 0 ? "aspect-[3/4]" : "aspect-square"}
              variant="subtle"
              priority={index < 4}
              onImageClick={() => onImageClick(image.src)}
              className="min-h-[44px] w-full"
            />
          ))}
        </div>
        
        {images.length > 8 && (
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              size="responsive-sm"
              onClick={() => onImageClick(images[0].src)}
              className="w-full sm:w-auto"
            >
              View More ({images.length - 8}+ Photos)
            </Button>
          </div>
        )}
      </div>
    </SectionContentCard>
  );
};
