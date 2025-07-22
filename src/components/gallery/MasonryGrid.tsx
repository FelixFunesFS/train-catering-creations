
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";

interface MasonryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const MasonryGrid = ({ images, onImageClick }: MasonryGridProps) => {
  // Sort images by quality to prioritize high-quality ones for larger display
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  
  const getSizeClasses = (image: GalleryImage, index: number) => {
    // Mobile-first approach with better aspect ratios
    const isHighQuality = image.quality >= 9;
    const isFeatured = index < 3; // First 3 images are featured on mobile
    
    if (isFeatured && isHighQuality) {
      return {
        containerClass: "sm:col-span-2",
        aspectRatio: "aspect-[4/5]" as const // Better for mobile viewing
      };
    } else if (index % 7 === 0 && image.quality >= 8) {
      return {
        containerClass: "",
        aspectRatio: "aspect-[3/4]" as const
      };
    } else {
      // Mobile-optimized aspect ratios
      const aspectRatios = ["aspect-square", "aspect-[5/4]", "aspect-[4/3]"] as const;
      const aspectRatio = aspectRatios[index % aspectRatios.length];
      return {
        containerClass: "",
        aspectRatio
      };
    }
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-12 px-1 sm:px-0 auto-rows-max">
      {sortedImages.map((image, index) => {
        const { containerClass, aspectRatio } = getSizeClasses(image, index);
        
        return (
          <div 
            key={`masonry-${index}`}
            className={`group bg-gradient-card rounded-xl shadow-card hover:shadow-elevated border border-border/20 hover:border-primary/30 cursor-pointer transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${containerClass}`}
            onClick={() => onImageClick(image.src)}
          >
            <div className="p-2 sm:p-3">
              <div className="relative rounded-lg overflow-hidden">
                <div className={aspectRatio}>
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={index < 6 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-left">
                    <h3 className="text-white font-elegant font-semibold text-sm sm:text-base lg:text-lg mb-1 leading-tight">
                      {image.title}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm leading-tight line-clamp-2">
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
  );
};
