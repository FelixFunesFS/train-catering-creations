
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { useState } from "react";

interface DesktopGalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const DesktopGalleryGrid = ({ images, onImageClick }: DesktopGalleryGridProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Sort images by quality and create featured sections
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const featuredImage = sortedImages[0]; // Hero image
  const premiumImages = sortedImages.slice(1, 7); // Next 6 high-quality images
  const regularImages = sortedImages.slice(7, 25); // Up to 18 more images for desktop

  return (
    <div className="hidden lg:block space-y-8">
      {/* Hero Featured Section */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Main Hero Image */}
        <div className="col-span-8 row-span-2">
          <OptimizedFloatingImage
            src={featuredImage.src}
            alt={featuredImage.title}
            title={featuredImage.title}
            description={featuredImage.description}
            aspectRatio="aspect-[16/10]"
            variant="dramatic"
            priority={true}
            onImageClick={() => onImageClick(featuredImage.src)}
            className="min-h-[400px] w-full group"
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
          {hoveredIndex === -1 && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="text-center text-white p-6">
                <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-3">
                  Featured Gallery
                </div>
                <h3 className="text-2xl font-elegant font-bold mb-2">{featuredImage.title}</h3>
                <p className="text-lg text-white/90">{featuredImage.description}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Side Premium Images */}
        <div className="col-span-4 space-y-6">
          {premiumImages.slice(0, 2).map((image, index) => (
            <OptimizedFloatingImage
              key={`premium-${index}`}
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio="aspect-[4/3]"
              variant="medium"
              priority={true}
              onImageClick={() => onImageClick(image.src)}
              className="min-h-[180px] w-full"
            />
          ))}
        </div>
      </div>

      {/* Premium Grid Section */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {premiumImages.slice(2).map((image, index) => (
          <div
            key={`premium-grid-${index}`}
            className={`${index === 0 ? 'col-span-2' : 'col-span-1'}`}
          >
            <OptimizedFloatingImage
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio={index === 0 ? "aspect-[8/5]" : "aspect-square"}
              variant="medium"
              priority={true}
              onImageClick={() => onImageClick(image.src)}
              className="min-h-[44px] w-full"
            />
          </div>
        ))}
      </div>

      {/* Regular Images - Masonry Style */}
      <div className="columns-5 gap-4 space-y-4">
        {regularImages.map((image, index) => {
          const aspectRatios = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]"];
          const aspectRatio = aspectRatios[index % aspectRatios.length];
          
          return (
            <div key={`regular-${index}`} className="break-inside-avoid mb-4">
              <OptimizedFloatingImage
                src={image.src}
                alt={image.title}
                title={image.title}
                description={image.description}
                aspectRatio={aspectRatio as any}
                variant="subtle"
                priority={index < 8}
                onImageClick={() => onImageClick(image.src)}
                className="min-h-[44px] w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
