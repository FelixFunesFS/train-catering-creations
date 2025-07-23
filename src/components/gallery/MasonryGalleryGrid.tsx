
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";

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
  // Sort images by quality and select top 12 for display
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const displayImages = sortedImages.slice(0, 12);
  
  // Select 2 featured images (highest quality)
  const featuredImages = displayImages.slice(0, 2);
  const regularImages = displayImages.slice(2);

  const { ref, getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: displayImages.length,
    staggerDelay: 100,
    baseDelay: 200,
    variant: 'ios-spring'
  });

  const getAspectRatio = (index: number, isFeatured: boolean): "aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]" => {
    if (isFeatured) {
      return "aspect-[4/3]";
    }
    const patterns: ("aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]")[] = [
      "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]", "aspect-[4/3]"
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div ref={ref} className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5">
      {/* Featured Images */}
      {featuredImages.map((image, index) => (
        <div 
          key={`featured-${sectionId}-${index}`}
          className={`break-inside-avoid mb-3 sm:mb-4 md:mb-5 ${getItemClassName(index)}`}
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
              className="w-full transform transition-all duration-300 hover:scale-[1.02]"
            />
            
            {/* Featured Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                Featured
              </span>
            </div>
            
            {/* Enhanced Overlay for Featured */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-elegant font-semibold text-lg mb-2 leading-tight">
                  {image.title}
                </h3>
                <p className="text-sm text-white/90 leading-tight">
                  {image.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    Quality {image.quality}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Regular Images */}
      {regularImages.map((image, index) => (
        <div 
          key={`regular-${sectionId}-${index}`}
          className={`break-inside-avoid mb-3 sm:mb-4 md:mb-5 ${getItemClassName(index + 2)}`}
          style={getItemStyle(index + 2)}
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
  );
};
