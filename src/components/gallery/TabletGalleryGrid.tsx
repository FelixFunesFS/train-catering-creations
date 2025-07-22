
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { useEffect, useState } from "react";

interface TabletGalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const TabletGalleryGrid = ({ images, onImageClick }: TabletGalleryGridProps) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Sort images by quality for better visual hierarchy
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const featuredImages = sortedImages.slice(0, 3);
  const regularImages = sortedImages.slice(3, 16);

  const gridCols = orientation === 'landscape' ? 'grid-cols-4' : 'grid-cols-3';
  const featuredCols = orientation === 'landscape' ? 'md:col-span-2' : 'md:col-span-2';

  return (
    <div className="hidden sm:block lg:hidden space-y-6">
      {/* Featured Section for Tablet */}
      <div className={`grid ${gridCols} gap-4 mb-8`}>
        {featuredImages.map((image, index) => (
          <div
            key={`featured-${index}`}
            className={`${index === 0 ? featuredCols : 'col-span-1'} ${
              index === 0 ? 'row-span-2' : ''
            }`}
            style={{ minHeight: '44px' }}
          >
            <OptimizedFloatingImage
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio={index === 0 ? "aspect-[4/3]" : "aspect-[5/4]"}
              variant="medium"
              priority={true}
              onImageClick={() => onImageClick(image.src)}
              className="min-h-[44px] w-full touch-manipulation"
            />
          </div>
        ))}
      </div>

      {/* Regular Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {regularImages.map((image, index) => {
          const isLarge = index % 6 === 0 && orientation === 'landscape';
          
          return (
            <div
              key={`regular-${index}`}
              className={`${isLarge ? 'md:col-span-2' : 'col-span-1'}`}
              style={{ minHeight: '44px' }}
            >
              <OptimizedFloatingImage
                src={image.src}
                alt={image.title}
                title={image.title}
                description={image.description}
                aspectRatio={isLarge ? "aspect-[5/3]" : "aspect-[4/5]"}
                variant="subtle"
                priority={index < 6}
                onImageClick={() => onImageClick(image.src)}
                className="min-h-[44px] w-full touch-manipulation"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
