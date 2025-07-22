
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DesktopGalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const DesktopGalleryGrid = ({ images, onImageClick }: DesktopGalleryGridProps) => {
  const [currentSet, setCurrentSet] = useState(0);
  
  // Sort images by quality and take sets of 5
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const imagesPerSet = 5;
  const totalSets = Math.ceil(sortedImages.length / imagesPerSet);
  const currentImages = sortedImages.slice(currentSet * imagesPerSet, (currentSet + 1) * imagesPerSet);
  
  const handlePrevious = () => {
    setCurrentSet((prev) => (prev === 0 ? totalSets - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentSet((prev) => (prev === totalSets - 1 ? 0 : prev + 1));
  };

  if (currentImages.length === 0) return null;

  const featuredImage = currentImages[0];
  const supportingImages = currentImages.slice(1);

  return (
    <div className="hidden lg:block space-y-6">
      {/* Navigation Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Set {currentSet + 1} of {totalSets}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSets }, (_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSet ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => setCurrentSet(i)}
                aria-label={`Go to set ${i + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={totalSets <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={totalSets <= 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Featured Layout: 1 Large + 4 Supporting */}
      <div className="grid grid-cols-12 gap-4 h-[400px]">
        {/* Featured Hero Image */}
        <div className="col-span-8">
          <OptimizedFloatingImage
            src={featuredImage.src}
            alt={featuredImage.title}
            title={featuredImage.title}
            description={featuredImage.description}
            aspectRatio="aspect-video"
            variant="dramatic"
            priority={true}
            onImageClick={() => onImageClick(featuredImage.src)}
            className="h-full w-full"
          />
        </div>
        
        {/* Supporting Images Grid */}
        <div className="col-span-4 grid grid-rows-2 gap-4">
          {supportingImages.slice(0, 2).map((image, index) => (
            <OptimizedFloatingImage
              key={`supporting-top-${index}`}
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio="aspect-[5/3]"
              variant="medium"
              priority={true}
              onImageClick={() => onImageClick(image.src)}
              className="h-full w-full"
            />
          ))}
        </div>
      </div>

      {/* Bottom Row - Additional Supporting Images */}
      {supportingImages.length > 2 && (
        <div className="grid grid-cols-3 gap-4 h-[200px]">
          {supportingImages.slice(2, 5).map((image, index) => (
            <OptimizedFloatingImage
              key={`supporting-bottom-${index}`}
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio="aspect-[4/3]"
              variant="medium"
              priority={true}
              onImageClick={() => onImageClick(image.src)}
              className="h-full w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};
